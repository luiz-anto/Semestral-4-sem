# Dockerfile unico com dois alvos: "backend" e "frontend".
# Uso: docker build --target backend -t smart-home-backend .

# ---------- Backend (NestJS + Prisma) ----------
FROM node:22-alpine AS backend
WORKDIR /app
RUN apk add --no-cache python3 make g++ openssl

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
# O prisma.config.ts exige DATABASE_URL ate para gerar o client; valor so de build.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm run prisma:generate \
 && npm run build

ENV NODE_ENV=production
EXPOSE 3000
# Aplica as migrations e sobe a API.
CMD ["sh", "-c", "npm run db:migrate && npm run start:prod"]

# ---------- Frontend: build do Vite ----------
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# A URL da API e gravada no build e usada pelo navegador, por isso e localhost.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_CHATBOT_URL=http://localhost:8001
ENV VITE_CHATBOT_URL=$VITE_CHATBOT_URL
RUN npm run build

# ---------- Frontend: nginx servindo os arquivos estaticos ----------
FROM nginx:alpine AS frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 80

# ---------- Chatbot (FastAPI + scikit-learn) ----------
FROM python:3.12-slim AS chatbot
WORKDIR /app
COPY chatbot/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY chatbot/ ./
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
