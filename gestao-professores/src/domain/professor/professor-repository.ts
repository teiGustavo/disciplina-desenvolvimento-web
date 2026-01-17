import type { Professor } from "./professor";

export interface ProfessorRepository {
    findOne(id: number): Promise<Professor | undefined>;
    getAll(): Promise<Professor[]>;
    create(Professor: Partial<Omit<Professor, 'id'>>): Promise<Professor | undefined>; 
    update(id: number, Professor: Partial<Professor>): Promise<Professor | undefined>; 
    destroy(id: number): Promise<void>; 
}