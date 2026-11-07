# Banco de dados

Modelos User e Device, relação de proprietário com cascade na exclusão de usuário. Duas migrations versionadas. Aplicação: `npm run db:migrate` dentro de backend com DATABASE_URL configurado. Estados ficam fora do banco, em backend/data/devices.json. Não execute reset no banco existente.
