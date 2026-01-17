import { z } from 'zod';

export const professorSchema = z.object({
    nome: z.string('O nome é obrigatório.').min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    email: z.email('O e-mail deve ser válido.'),
    telefone: z.string('O telefone é obrigatório.').min(10, 'O telefone deve ter pelo menos 10 caracteres.'),
    dataAdmissao: z.iso.date('A data de admissão deve ser uma data válida.'),
    salario: z.number('O salário deve ser um número.').positive('O salário deve ser um número positivo maior que zero.')
});