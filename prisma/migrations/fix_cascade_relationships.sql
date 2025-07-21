-- Migration para corrigir configurações de cascata
-- AddForeignKey para corrigir relacionamentos com cascata apropriada

-- Remover constraints existentes
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_matricula_id_fkey";
ALTER TABLE "Frequencia" DROP CONSTRAINT "Frequencia_matricula_id_fkey";
ALTER TABLE "Matricula" DROP CONSTRAINT "Matricula_turma_id_fkey";
ALTER TABLE "HorarioAula" DROP CONSTRAINT "HorarioAula_turma_id_fkey";
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_disciplina_id_fkey";
ALTER TABLE "CursoDisciplina" DROP CONSTRAINT "CursoDisciplina_curso_id_fkey";
ALTER TABLE "CursoDisciplina" DROP CONSTRAINT "CursoDisciplina_disciplina_id_fkey";

-- Recriar com configurações de cascata apropriadas
-- Notas e Frequências devem ser removidas quando a matrícula for removida
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_matricula_id_fkey" 
    FOREIGN KEY ("matricula_id") REFERENCES "Matricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_matricula_id_fkey" 
    FOREIGN KEY ("matricula_id") REFERENCES "Matricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Matrículas devem ser removidas quando a turma for removida
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_turma_id_fkey" 
    FOREIGN KEY ("turma_id") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Horários devem ser removidos quando a turma for removida
ALTER TABLE "HorarioAula" ADD CONSTRAINT "HorarioAula_turma_id_fkey" 
    FOREIGN KEY ("turma_id") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Turmas devem ser removidas quando a disciplina for removida
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_disciplina_id_fkey" 
    FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Relacionamentos curso-disciplina devem ser removidos quando curso ou disciplina forem removidos
ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_curso_id_fkey" 
    FOREIGN KEY ("curso_id") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_disciplina_id_fkey" 
    FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;
