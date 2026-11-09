# KiloW — Frontend

React JSX + Vite + Tailwind CSS 4. Identidade visual KiloW, logo fornecida e fonte Tenor Sans incluída localmente pelo pacote @fontsource/tenor-sans.

## Substituir a versão anterior

Faça uma cópia da sua pasta frontend atual. Extraia este ZIP e coloque a pasta frontend no lugar da anterior, ao lado de backend. O backend não precisa de alterações. Se sua URL de API for personalizada, preserve seu frontend/.env.

No PowerShell, dentro da nova pasta frontend:

```powershell
npm ci
npm run dev
```

Abra o endereço do Vite, normalmente http://localhost:5173. O backend deve continuar rodando em http://localhost:3000. O .env incluído configura VITE_API_URL=http://localhost:3000. Para experimentar a interface sem backend, clique em Explorar demonstração.

Alternativa de preparação:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
npm run dev
```

## Estilização

Toda estilização visual está em classes Tailwind nos elementos JSX: cores, tamanhos, estados, responsividade, animações e efeitos. Não há regras CSS próprias, @apply ou atributos style. O arquivo src/index.css contém somente @import "tailwindcss", necessário para o compilador do Tailwind. A fonte é importada pelo pacote local, sem chamada ao Google Fonts.

Paleta: #09193B, #E88211, #BBCCEF, #3B6283, #E4EAF0 e #1C1D1F. A logo original é conservada em public/logo.png, sem alteração nos pixels ou cores.

## Funções mantidas

Cadastro/login, perfil, filtros por cômodo, CRUD de dispositivos, energia, intensidade, temperatura, canal e volume. A abertura das simulações continua disponível ao cadastrar um dispositivo e no botão Abrir simulação. O chatbot continua apenas como interface, sem envio de mensagens. A área de gastos permanece removida.

O frontend usa os mesmos endpoints e identificadores de sessão da versão anterior, preservando compatibilidade com o backend. O ZIP não contém backend, node_modules ou dist.

## Verificação

```powershell
npm test
npm run build
```

Build e teste HTTP aprovados. Conferidos no navegador: telas de acesso, painel, modal, chatbot, energia/intensidade e sincronização da lâmpada em demonstração. Layout conferido em quadros de 320 e 390 pixels, sem overflow horizontal. Teste em aparelho físico e integração com seu banco local continuam dependendo do seu ambiente.

## Barra de preenchimento

A barra conta campos preenchidos, independentemente de sua validade. Login: 0%, 50%, 100%. Cadastro: 0%, 33%, 67%, 100%. Campos vazios ou contendo apenas espaços não contam. As regras de e-mail e senha continuam sendo verificadas no envio e no backend; barra completa não significa cadastro aprovado.
