import type { Professor } from "@/domain/professor/professor";
import type { ProfessorRepository } from "@/domain/professor/professor-repository";


const STORAGE_KEY = 'professores_data';

export class LocalStorageProfessorRepository implements ProfessorRepository {
    private data: Map<number, Professor> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const jsonString = localStorage.getItem(STORAGE_KEY);
            if (jsonString) {
                const professoresArray: Professor[] = JSON.parse(jsonString);
            
                this.data = new Map(professoresArray.map(professor => [professor.id, professor]));
            }
        } catch (error) {
            console.error("Erro ao carregar dados do LocalStorage:", error);
            this.data = new Map();
        }
    }

    private saveToStorage(): void {
        try {
            const professoresArray = Array.from(this.data.values());
            const jsonString = JSON.stringify(professoresArray);
            localStorage.setItem(STORAGE_KEY, jsonString);
        } catch (error) {
            console.error("Erro ao salvar dados no LocalStorage:", error);
        }
    }

    async getAll(): Promise<Professor[]> {
        return Promise.resolve(Array.from(this.data.values()));
    }

    async findOne(id: number): Promise<Professor | undefined> {
        return Promise.resolve(this.data.get(id));
    }

    async create(professor: Partial<Omit<Professor, "id">>): Promise<Professor | undefined> {
        const { nome, email, telefone, dataAdmissao, salario } = professor;

        if (!nome || !email || !telefone || !dataAdmissao || !salario) {
            return;
        }

        const id = Date.now(); 

        const newProfessor: Professor = {
            id: id,
            nome, email, telefone, dataAdmissao, salario
        };

        this.data.set(id, newProfessor);
        
        this.saveToStorage(); 
        
        return Promise.resolve(newProfessor);
    }

    async update(id: number, professor: Partial<Professor>): Promise<Professor | undefined> {
        const existingProfessor = this.data.get(id);

        if (!existingProfessor) {
            return;
        }

        const updatedProfessor: Professor = {
            ...existingProfessor,
            ...professor,
            id: existingProfessor.id,
        };

        this.data.set(id, updatedProfessor);
        
    
        this.saveToStorage(); 
        
        return Promise.resolve(updatedProfessor);
    }

    async destroy(id: number): Promise<void> {
        this.data.delete(id);
        
        this.saveToStorage(); 
        
        return Promise.resolve();
    }
}