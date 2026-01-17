import type { App } from "vue";
import router from "@/presentation/router";
import { createPinia } from "pinia";
import configureDI from "./dependency-injection";
import '@/assets/main.css';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, ToastService } from "primevue";
import ptBR from '@/infrastructure/i18n/pt-BR.json';

export default function bootstrap(app: App): void {
    // Plugins Vue
    app.use(createPinia());
    app.use(router);

    // PrimeVue
    app.use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: false,
            },
        },
        locale: ptBR,
    });
    app.use(ConfirmationService);
    app.use(ToastService);

    // Injeção de Dependências
    configureDI(app);
};