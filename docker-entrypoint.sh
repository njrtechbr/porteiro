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

# Instalar netcat se não estiver disponível
if ! command -v nc &> /dev/null; then
    echo "Instalando netcat..."
    apk add --no-cache netcat-openbsd
fi

# Aguardar o banco de dados
wait_for_db

# Aplicar migrações do Prisma
echo "Aplicando migrações do banco de dados..."
npx prisma migrate deploy

# Gerar cliente Prisma
echo "Gerando cliente Prisma..."
npx prisma generate

# Executar seed se a variável estiver definida
if [ "$RUN_SEED" = "true" ]; then
    echo "Executando seed do banco de dados..."
    npx prisma db seed || echo "Seed falhou ou já foi executado"
fi

# Iniciar aplicação
echo "Iniciando aplicação Next.js..."
exec node server.js 