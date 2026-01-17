import { ref, type Ref } from 'vue';

interface Identifiable {
    id: number;
}

// A interface do Repository deve ter métodos de CRUD que retornam Promessas
interface BaseRepository<T extends Identifiable> {
    getAll(): Promise<T[]>;
    create(item: Partial<Omit<T, "id">>): Promise<T | undefined>;
    update(id: number, item: Partial<T>): Promise<T | undefined>;
    destroy(id: number): Promise<void>;
}

export abstract class BaseStore<T extends Identifiable> {
    protected data: Ref<T[]> = ref([]);
    protected isLoading: Ref<boolean> = ref(false);

    public async syncData(callable: CallableFunction): Promise<void> {
        this.isLoading.value = true;
        this.data.value = await callable();
        this.isLoading.value = false;
    }

    public async addData(payload: T): Promise<void> {
        this.data.value.push(payload); 
    }

    public async updateData(id: number, newData: T): Promise<void> {
        const index = this.data.value.findIndex(item => item.id === id);

        if (index === -1) {
            return;
        }

        this.data.value[index] = newData;
    }

    public async remove(id: number): Promise<void> {
        this.data.value = this.data.value.filter(item => item.id !== id);
    }

    // Métodos para expor o estado (necessário para a API de Setup do Pinia)
    public get state() {
        return {
            data: this.data,
            isLoading: this.isLoading,
        };
    }
}