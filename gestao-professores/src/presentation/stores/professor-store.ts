import type { Professor } from "@/domain/professor/professor";
import { ProfessorRepositoryKey } from "@/config/dependency-injection/injection-keys";
import { defineStore } from "pinia";
import { inject, ref, type Ref } from "vue";
import type { ProfessorRepository } from "@/domain/professor/professor-repository";

export interface ProfessorState {
    professores: Ref<Professor[]>,
    isLoading: Ref<boolean>
}

export const useProfessorStore = defineStore('professorStore', () => {
    const repository = inject(ProfessorRepositoryKey) as ProfessorRepository;

    if (!repository) {
        throw new Error('Repository não definido!');
    }
    
    const professores: Ref<Professor[]> = ref([]);
    const isLoading: Ref<boolean> = ref(false);

    async function fetchData(): Promise<void> {
        isLoading.value = true;
        professores.value = await repository.getAll();
        isLoading.value = false;
    }

    async function findOne(id: number): Promise<Professor | undefined> {
        isLoading.value = true;

        const index = professores.value.findIndex(p => p.id === id);
        const found = professores.value[index];

        isLoading.value = false;

        if (!found) {
            return;
        }

        return found;
    }

    async function add(livro: Partial<Professor>): Promise<Professor | undefined> {
        const newProfessor = await repository?.create(livro);

        if (!newProfessor) {
            return;
        }

        professores.value.push(newProfessor);
        return newProfessor;
    }

    async function update(id: number, livro: Partial<Professor>): Promise<Professor | undefined> {
        const index = professores.value.findIndex(p => p.id === id);
        const updatedProfessor = await repository?.update(id, livro);

        if (index === -1 || !updatedProfessor) {
            return;
        }

        professores.value[index] = updatedProfessor; 
        return updatedProfessor;
    }

    async function destroy(id: number): Promise<void> {
        await repository?.destroy(id);
        professores.value = professores.value.filter(p => p.id !== id);
    }

    return { professores, isLoading, fetchData, findOne, add, update, destroy };
});