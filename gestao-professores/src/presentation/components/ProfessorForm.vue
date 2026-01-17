<script setup lang="ts">
import { useProfessorStore } from '@/presentation/stores/professor-store';
import { ref } from 'vue';
import MostraProfessor from './ShowProfessor.vue';
import type { Professor } from '@/domain/professor/professor';
import { useDateFormatter } from "@/presentation/composables/use-date-formatter.ts";
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";
import { z } from 'zod';
import { professorSchema } from "@/presentation/validations/professor-schema.ts";

const professorStore = useProfessorStore();
const { formatDateToISODateString, formatDateToLocaleDateString } = useDateFormatter();

const formatProfessorDataToFormData = (
    data: Partial<Omit<Professor, 'dataAdmissao'> & { dataAdmissao?: Date | Professor['dataAdmissao'] }>
) => ({
  ...data, dataAdmissao: formatDateToLocaleDateString({ date: data.dataAdmissao })
});

const resolver = ({ values }: { values: Partial<Professor> }) => {
  const errors: Record<string, { message: string }[]> = {};

  const result = professorSchema.safeParse({
    ...values, dataAdmissao: formatDateToISODateString({ date: { value: values.dataAdmissao, format: 'dd/MM/yyyy' }, type: 'date' })
  });

  if (!result.success) {
    const { properties = {} } = z.treeifyError(result.error);

    Object.entries(properties).forEach(([field, { errors: zErrors }]) => {
      errors[field] = zErrors.map((message) => ({ message }) );
    });
  }

  return { values, errors };
};

const confirm = useConfirm();
const toast = useToast();

const initialFormState = {
  key: 0,
  isSubmitted: false,
  isDialogVisible: false,
  isEditMode: false,
  data: {
    ...formatProfessorDataToFormData({ nome: '', email: '', telefone: '', dataAdmissao: new Date(), salario: 0 })
  } as Partial<Professor>
};

const formState = ref({ ...initialFormState });

function add() {
  clear();
  formState.value.isDialogVisible = true;
}

async function edit(id: number) {
  const professor = await professorStore.findOne(id);

  if (!professor) {
    toast.add({
      severity: 'error',
      summary: 'Professor não encontrado',
      detail: `O professor de ID: "${id}" não foi encontrado!`,
      life: 3000
    });
    return;
  }

  formState.value.data = { ...formatProfessorDataToFormData(professor) };
  formState.value.isDialogVisible = true;
  formState.value.isEditMode = true;
}

function cancel() {
  confirm.require({
    header: 'Confirmação',
    message: `Tem certeza que deseja cancelar ${formState.value.isEditMode ? 'a edição' : 'o cadastro'}? Todas as alterações serão perdidas!`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: `Não, Continuar ${formState.value.isEditMode ? 'Editando' : 'Cadastrando'}`,
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: `Sim, Cancelar ${formState.value.isEditMode ? 'Edição' : 'Cadastro'}`,
      severity: 'danger'
    },
    accept: () => {
      toast.add({
        severity: 'info',
        summary: `${formState.value.isEditMode ? 'Edição cancelada!' : 'Cadastro cancelado!'}`,
        detail: 'Nada foi feito.',
        life: 3000
      });
      clear();
    }
  });
}

function save({ valid, values }: { valid: boolean, values: any }): void {
  formState.value.isSubmitted = true;

  if (!valid) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, corrija os erros no formulário.', life: 3000 });
    return;
  }

  confirm.require({
    header: 'Confirmação',
    message: formState.value.isEditMode
        ? 'Tem certeza que deseja alterar as informações do professor?'
        : 'Tem certeza que deseja cadastrar o professor?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Não, Cancelar',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: `Sim, ${formState.value.isEditMode ? 'Salvar Alterações' : 'Cadastrar'}`,
      severity: 'success'
    },
    accept: () => {
      values.dataAdmissao = formatDateToISODateString({ date: { value: values.dataAdmissao, format: 'dd/MM/yyyy' }, type: 'date' });

      if (formState.value.isEditMode) {
        professorStore.update(formState.value.data.id as number, values);
        toast.add({severity: 'success', summary: 'Sucesso', detail: 'Professor atualizado com sucesso!', life: 3000});
      } else {
        professorStore.add(values);
        toast.add({severity: 'success', summary: 'Sucesso', detail: 'Professor cadastrado com sucesso!', life: 3000});
      }

      clear();
    }
  });
}

function clear(): void {
  formState.value = { ...initialFormState, key: formState.value.key + 1  }; // Reseta o formulário
}
</script>

<template>
  <Dialog v-model:visible="formState.isDialogVisible" modal :header="formState.isEditMode ? 'Editar Professor' : 'Cadastrar Professor'"
          :style="{ width: '50rem' }">
    <template #header>
      <div class="flex items-baseline gap-2 text-2xl font-medium">
        <i class="pi me-2" :class="formState.isEditMode ? 'pi-user-edit' : 'pi-user-plus'" style="font-size: 1.5rem"></i>
        {{ formState.isEditMode ? 'Editar Professor' : 'Cadastrar Professor' }}
      </div>
    </template>

    <div class="text-surface-500 dark:text-surface-400 block mb-8">
      <span v-if="formState.isEditMode">Atualizar as informações do professor <strong>ID: {{ formState.data.id }}</strong>.</span>
      <span v-else>Cadastrar novo professor e suas informações.</span>
    </div>

    <Form :key="formState.key" v-slot="$form" :initialValues="formState.data" :resolver="resolver" @submit="save"
          class="flex flex-col gap-4 w-full">
      <div class="flex flex-col gap-1">
        <label for="nome" class="font-semibold">Nome</label>

        <div class="flex flex-col w-full items-start">
          <InputText id="nome" name="nome" type="text" placeholder="Nome" fluid/>
          <Message v-if="$form.nome?.invalid" severity="error" size="small" variant="simple" class="mt-1 ms-1">
            {{ $form.nome.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="email" class="font-semibold">E-mail</label>

        <div class="flex flex-col w-full items-start">
          <InputText id="email" name="email" type="email" placeholder="E-mail" fluid/>
          <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple" class="mt-1 ms-1">
            {{ $form.email.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="telefone" class="font-semibold">Telefone</label>

        <div class="flex flex-col w-full items-start">
          <InputMask id="telefone" name="telefone" type="text" placeholder="Telefone" mask="(99) 99999-9999" fluid/>
          <Message v-if="$form.telefone?.invalid" severity="error" size="small" variant="simple" class="mt-1 ms-1">
            {{ $form.telefone.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="dataAdmissao" class="font-semibold">Data de Admissão</label>

        <div class="flex flex-col w-full items-start">
          <DatePicker id="dataAdmissao" name="dataAdmissao" class="w-full" type="date" placeholder="Data de Admissão"
                     dateFormat="dd/mm/yy" updateModelType="string" :manualInput="false"
                      showIcon showButtonBar fluid iconDisplay="input">
            <template #buttonbar="{ todayCallback, clearCallback }">
              <div class="flex justify-between w-full">
                <Button size="small" :label="$primevue.config.locale.clear" @click="clearCallback"
                        severity="secondary" variant="outlined"/>
                <Button size="small" :label="$primevue.config.locale.today" @click="todayCallback"
                        severity="secondary" variant="outlined"/>
              </div>
            </template>
          </DatePicker>
          <Message v-if="$form.dataAdmissao?.invalid" severity="error" size="small" variant="simple" class="mt-1 ms-1">
            {{ $form.dataAdmissao.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex flex-col gap-1 mb-8">
        <label for="salario" class="font-semibold">Salário</label>

        <div class="flex flex-col w-full items-start">
          <InputNumber id="salario" name="salario" mode="currency" currency="BRL" locale="pt-BR" placeholder="Salário"
                       :useGrouping="false" fluid/>
          <Message v-if="$form.salario?.invalid" severity="error" size="small" variant="simple" class="mt-1 ms-1">
            {{ $form.salario.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <Button v-if="formState.isDialogVisible" @click="cancel" type="button" :severity="formState.isEditMode ? 'secondary' : 'danger'"
                :label="formState.isEditMode ? 'Cancelar Edição' : 'Cancelar Cadastro'" />
        <Button type="submit" severity="success" :label="!formState.isEditMode ? 'Cadastrar' : 'Salvar'" :disabled="formState.isSubmitted && !$form.valid" />
      </div>
    </Form>
  </Dialog>

  <MostraProfessor @add="add" @edit="edit" class="mt-5"/>
</template>

<style scoped>
</style>