# Smart Home — versão 4

React/JSX, Vite e Tailwind no frontend. NestJS, Prisma/PostgreSQL e JSON no backend.

Rodar:

```powershell
Set-Location .\backend
powershell -ExecutionPolicy Bypass -File .\setup.ps1
npm run start:dev
```

Em outro terminal, dentro de smart-home:

```powershell
Set-Location .\frontend
powershell -ExecutionPolicy Bypass -File .\setup.ps1
npm run dev
```


## Docker (tudo de uma vez)

```powershell
docker compose up --build
```

Frontend em http://localhost:5173, API em http://localhost:3000, chatbot em http://localhost:8001 e PostgreSQL em localhost:5432.

## Chatbot (FastAPI)

`POST /chat` com `{"mensagem": "liga a luz da sala"}` e o mesmo token Bearer do backend. Para rodar fora do Docker (o modelo é treinado ao iniciar):

```powershell
Set-Location .\chatbot
pip install -r requirements.txt
uvicorn src.main:app --port 8001
```
