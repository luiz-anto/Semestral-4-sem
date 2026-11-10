# Arquitetura

Frontend React/Vite/Tailwind integrado à API NestJS. PostgreSQL mantém cadastros e estados (ligado e valores de cada dispositivo). Simulações em abas separadas consultam os estados pela API a cada segundo. O chatbot é uma API FastAPI (pasta chatbot): um classificador de intenção (scikit-learn) entende luz, TV e ar-condicionado e envia o comando ao backend com o token do usuário.
