/*
  Warnings:

  - The values [chefeDepartamento] on the enum `EnumPerfil` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `departamento_id` on the `Curso` table. All the data in the column will be lost.
  - You are about to drop the column `horario` on the `Turma` table. All the data in the column will be lost.
  - You are about to drop the column `departamento_id` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `Departamento` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO');

-- AlterEnum
BEGIN;
CREATE TYPE "EnumPerfil_new" AS ENUM ('admin', 'professor', 'aluno');
ALTER TABLE "Usuario" ALTER COLUMN "role" TYPE "EnumPerfil_new" USING ("role"::text::"EnumPerfil_new");
ALTER TYPE "EnumPerfil" RENAME TO "EnumPerfil_old";
ALTER TYPE "EnumPerfil_new" RENAME TO "EnumPerfil";
DROP TYPE "EnumPerfil_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Curso" DROP CONSTRAINT "Curso_departamento_id_fkey";

-- DropForeignKey
ALTER TABLE "Departamento" DROP CONSTRAINT "Departamento_chefe_id_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_departamento_id_fkey";

-- AlterTable
ALTER TABLE "Curso" DROP COLUMN "departamento_id";

-- AlterTable
ALTER TABLE "Turma" DROP COLUMN "horario",
ADD COLUMN     "sala" TEXT,
ADD COLUMN     "vagas" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "departamento_id";

-- DropTable
DROP TABLE "Departamento";

-- CreateTable
CREATE TABLE "HorarioAula" (
    "id" SERIAL NOT NULL,
    "turma_id" INTEGER NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fim" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorarioAula_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HorarioAula" ADD CONSTRAINT "HorarioAula_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
