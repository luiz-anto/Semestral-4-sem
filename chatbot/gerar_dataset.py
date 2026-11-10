# Roda uma vez só: python gerar_dataset.py
# Cria data/dataset_comandos.csv, que o src/main.py usa para treinar o modelo.
import random

import pandas as pd

random.seed(42)

# {local} vira "", "da sala", "do quarto" ou "do escritório". {n} vira um número.
FRASES = {
    "luz_ligar": [
        "liga a luz {local}", "ligue a luz {local}", "acende a luz {local}", "acenda a luz {local}",
        "liga a lâmpada {local}", "ligue a lâmpada {local}", "quero a luz {local} acesa",
        "pode ligar a luz {local}", "por favor, acenda a luz {local}",
    ],
    "luz_desligar": [
        "desliga a luz {local}", "desligue a luz {local}", "apaga a luz {local}", "apague a luz {local}",
        "desliga a lâmpada {local}", "desligue a lâmpada {local}", "quero a luz {local} apagada",
        "pode desligar a luz {local}", "por favor, apague a luz {local}",
    ],
    "luz_intensidade": [
        "coloca a luz {local} em {n}%", "ajusta o brilho da luz {local} para {n}",
        "deixa a luz {local} com {n}% de intensidade", "diminui a luz {local} para {n}%",
        "aumenta a luz {local} para {n}%", "brilho da lâmpada {local} em {n}",
        "intensidade da luz {local} {n}%", "põe a luz {local} em {n} por cento",
    ],
    "tv_ligar": [
        "liga a tv {local}", "ligue a tv {local}", "liga a televisão {local}", "ligue a televisão {local}",
        "pode ligar a tv {local}", "quero ver tv {local}", "ative a tv {local}",
    ],
    "tv_desligar": [
        "desliga a tv {local}", "desligue a tv {local}", "desliga a televisão {local}",
        "desligue a televisão {local}", "pode desligar a tv {local}", "apague a tv {local}",
        "chega de tv {local}",
    ],
    "ar_condicionado_ligar": [
        "liga o ar {local}", "ligue o ar {local}", "liga o ar condicionado {local}",
        "ligue o ar condicionado {local}", "pode ligar o ar {local}", "preciso de ar {local}",
        "ative o ar condicionado {local}",
    ],
    "ar_condicionado_desligar": [
        "desliga o ar {local}", "desligue o ar {local}", "desliga o ar condicionado {local}",
        "desligue o ar condicionado {local}", "pode desligar o ar {local}", "apague o ar {local}",
        "desative o ar condicionado {local}",
    ],
    "ar_condicionado_temperatura": [
        "coloca o ar {local} em {n} graus", "ajusta o ar {local} para {n}", "deixa o ar {local} em {n}°C",
        "temperatura do ar {local} para {n}", "põe o ar condicionado {local} em {n} graus",
        "quero o ar {local} a {n} graus", "muda o ar {local} para {n}",
        "aumenta a temperatura do ar {local}", "diminui a temperatura do ar {local}",
    ],
    # O que o sistema não controla (sem {local}: são frases soltas)
    "desconhecido": [
        "bom dia", "boa noite", "oi tudo bem", "obrigado", "tchau", "me ajuda", "quem é você",
        "me conte uma piada", "que horas são", "qual a previsão do tempo", "pedir uma pizza",
        "ligue o som", "desligue o som", "toque uma música", "aqueça o chuveiro", "abra a porta",
        "tranque a porta", "abra a cortina", "ligue o ventilador", "ligue a cafeteira",
    ],
}
LOCAIS = ["", "da sala", "do quarto", "do escritório"]

linhas = []
for intencao, modelos in FRASES.items():
    for modelo in modelos:
        for local in LOCAIS:
            for _ in range(3):
                if intencao == "luz_intensidade":
                    n = random.choice([10, 25, 50, 75, 100])  # intensidade: 0 a 100
                else:
                    n = random.randint(16, 30)  # temperatura: 16 a 30
                frase = modelo.format(local=local, n=n)
                linhas.append([" ".join(frase.split()), intencao])

dados = pd.DataFrame(linhas, columns=["comando", "intencao"])
dados = dados.drop_duplicates().sample(frac=1, random_state=42)
dados.to_csv("data/dataset_comandos.csv", index=False)

print(dados["intencao"].value_counts())
