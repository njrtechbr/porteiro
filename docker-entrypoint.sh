#!/bin/sh

# Função para aguardar o banco de dados
wait_for_db() {
    echo "Aguardando banco de dados..."
    until nc -z $DATABASE_HOST $DATABASE_PORT; do
        echo "Banco não disponível ainda, aguardando..."
        sleep 2
    done
    echo "Banco de dados disponível!"
}

# Netcat já está instalado no Dockerfile

# Aguardar o banco de dados
wait_for_db

# Aplicar migrações do Prisma usando caminho absoluto
echo "Aplicando migrações do banco de dados..."
./node_modules/.bin/prisma migrate deploy

# Gerar cliente Prisma
echo "Gerando cliente Prisma..."
./node_modules/.bin/prisma generate

# Executar seed se a variável estiver definida
if [ "$RUN_SEED" = "true" ]; then
    echo "Executando seed do banco de dados..."
    ./node_modules/.bin/tsx prisma/seed.ts || echo "Seed falhou ou já foi executado"
fi

# Iniciar aplicação
echo "Iniciando aplicação Next.js..."
exec node server.js 