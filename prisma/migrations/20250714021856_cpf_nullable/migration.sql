-- DropIndex
DROP INDEX "users_cpf_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "cpf" DROP NOT NULL;
