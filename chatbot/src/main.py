import os
import re

import httpx
import pandas as pd
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")  # no Docker vem do compose

# 1. Dataset
dados = pd.read_csv("data/dataset_comandos.csv")
X = dados["comando"]
y = dados["intencao"]

# 2. Vetorização de texto (Bag of Words)
vectorizer = CountVectorizer()
X_vec = vectorizer.fit_transform(X)

# 3. Treinamento do modelo (Regressão Logística)
# O LogisticRegression é feito para classificar categorias
modelo = LogisticRegression(max_iter=1000)
modelo.fit(X_vec, y)

TIPOS = {"luz": "LIGHT", "tv": "TV", "ar_condicionado": "AIR_CONDITIONER"}
COMODOS = {"sala": "Sala", "quarto": "Quarto", "escrit": "Escritório"}

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Mensagem(BaseModel):
    mensagem: str


def resposta(texto, dispositivos=[]):
    return {"resposta": texto, "dispositivos": dispositivos}


@app.post("/chat")
def chat(corpo: Mensagem, authorization: str = Header()):
    texto = corpo.mensagem.lower()

    # Intenção, ex: "luz_ligar", "ar_condicionado_temperatura"
    intencao = modelo.predict(vectorizer.transform([texto]))[0]

    print(f"Texto: {texto} | Intenção: {intencao}")
    if intencao == "desconhecido":
        return resposta("Não entendi. Tente “ligue a luz da sala”.")
    dispositivo, acao = intencao.rsplit("_", 1)

    print(f"Dispositivo: {dispositivo} | Ação: {acao}")

    # Cômodo e número (temperatura ou intensidade) que aparecem na frase
    comodo = None
    for palavra, nome in COMODOS.items():
        if palavra in texto:
            comodo = nome
    numeros = [int(n) for n in re.findall(r"\d+", texto)]

    # O que vai ser mudado no dispositivo
    if acao == "ligar":
        estado = {"isOn": True}
    elif acao == "desligar":
        estado = {"isOn": False}
    elif acao == "temperatura":
        numeros = [n for n in numeros if 16 <= n <= 30]
        if not numeros:
            return resposta("Qual temperatura? Entre 16 e 30 °C.")
        estado = {"temperature": numeros[0]}
    elif acao == "intensidade":
        numeros = [n for n in numeros if 0 <= n <= 100]
        if not numeros:
            return resposta("Qual intensidade? Entre 0 e 100%.")
        estado = {"brightness": numeros[0]}

    # Dispositivos do tipo (e do cômodo, se foi dito)
    headers = {"Authorization": authorization}
    todos = httpx.get(f"{BACKEND_URL}/devices", headers=headers).json()
    alvos = []
    for d in todos:
        if d["type"] == TIPOS[dispositivo] and (comodo is None or d.get("room") == comodo):
            alvos.append(d)
    if not alvos:
        return resposta("Não encontrei esse dispositivo.")

    atualizados = []
    for d in alvos:
        atualizados.append(httpx.patch(f"{BACKEND_URL}/devices/{d['id']}/state", json=estado, headers=headers).json())

    nomes = ", ".join(d["name"] for d in atualizados)
    return resposta(f"Pronto: {nomes}.", atualizados)
