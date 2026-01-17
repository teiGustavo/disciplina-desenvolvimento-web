import type { ProfessorRepository } from '@/domain/professor/professor-repository';
import type { InjectionKey } from 'vue';

export const ProfessorRepositoryKey: InjectionKey<ProfessorRepository> = Symbol('ProfessorRepository');