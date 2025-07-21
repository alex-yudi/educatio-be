-- DropForeignKey
ALTER TABLE "CursoDisciplina" DROP CONSTRAINT "CursoDisciplina_curso_id_fkey";

-- DropForeignKey
ALTER TABLE "CursoDisciplina" DROP CONSTRAINT "CursoDisciplina_disciplina_id_fkey";

-- DropForeignKey
ALTER TABLE "Frequencia" DROP CONSTRAINT "Frequencia_matricula_id_fkey";

-- DropForeignKey
ALTER TABLE "HorarioAula" DROP CONSTRAINT "HorarioAula_turma_id_fkey";

-- DropForeignKey
ALTER TABLE "Matricula" DROP CONSTRAINT "Matricula_turma_id_fkey";

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_matricula_id_fkey";

-- DropForeignKey
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_disciplina_id_fkey";

-- AddForeignKey
ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioAula" ADD CONSTRAINT "HorarioAula_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_matricula_id_fkey" FOREIGN KEY ("matricula_id") REFERENCES "Matricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_matricula_id_fkey" FOREIGN KEY ("matricula_id") REFERENCES "Matricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;
