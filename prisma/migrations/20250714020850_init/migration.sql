-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Familia', 'Hospede', 'Convidado');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ativo', 'pendente', 'expirado');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "access_start" TIMESTAMP(3),
    "access_end" TIMESTAMP(3),
    "access_code" TEXT NOT NULL,
    "invites" INTEGER NOT NULL DEFAULT 0,
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL,
    "accessible_gates" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_access_code_key" ON "users"("access_code");

-- CreateIndex
CREATE INDEX "access_logs_user_id_idx" ON "access_logs"("user_id");

-- AddForeignKey
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
