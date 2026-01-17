import { LocalStorageProfessorRepository } from "@/infrastructure/repositories/local-storage/local-storage-professor-repository";
import { ProfessorRepositoryKey } from "./injection-keys";
import type { App } from "vue";

export default function configureDI (app: App): void {
    app.provide(ProfessorRepositoryKey, new LocalStorageProfessorRepository());
};