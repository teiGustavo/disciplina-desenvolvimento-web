<script setup lang="ts">
import { useProfessorStore } from '@/presentation/stores/professor-store';
import { computed, onMounted } from 'vue';
import { useCurrencyFormatter } from '../composables/use-currency-formatter';
import { useDateFormatter } from '../composables/use-date-formatter';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const professorStore = useProfessorStore();

defineEmits(['add', 'edit']);

onMounted(async () => {
  await professorStore.fetchData();
});

const {formatSalary} = useCurrencyFormatter();
const {formatDateToLocaleDateString} = useDateFormatter();

const formattedProfessores = computed(() =>
    professorStore.professores.map(professor => ({
      ...professor,
      dataAdmissao: formatDateToLocaleDateString({ date: professor.dataAdmissao }),
      salario: formatSalary(professor.salario),
    }))
);

const tableColumns = [
  {field: 'nome', header: 'Nome'},
  {field: 'email', header: 'Email'},
  {field: 'telefone', header: 'Telefone'},
  {field: 'dataAdmissao', header: 'Data de Admissão'},
  {field: 'salario', header: 'Salário'}
];

const confirm = useConfirm();
const toast = useToast();

function deleteProfessor(id: number, nome: string) {
  confirm.require({
    header: 'Confirmação',
    message: `Você tem certeza que deseja excluir o professor "${nome}"?`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Não, Cancelar',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Sim, Excluir',
      severity: 'danger'
    },
    accept: () => {
      professorStore.destroy(id);
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'O Professor foi excluído com sucesso!', life: 3000 });
    },
    reject: () => {
      toast.add({ severity: 'info', summary: 'Exclusão cancelada!', detail: 'Nada foi feito.', life: 3000 });
    }
  });
}
</script>

<template>
  <div>
    <div class="rounded-xl shadow-lg m-3 p-6">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 ms-3">
        <h1 class="font-medium text-xl">Professores Cadastrados:</h1>

        <button class="btn btn-primary" @click="$emit('add')">
          <i class="pi pi-user-plus me-2"></i>
          Adicionar Novo Professor
        </button>
      </div>

      <DataTable :value="formattedProfessores" tableStyle="min-width: 50rem"
                 paginator :rows="10" :rowsPerPageOptions="[5,10,20]"
                 paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                 currentPageReportTemplate="Exibindo {first} até {last} de {totalRecords} professores">

        <Column v-for="col of tableColumns" :key="col.field" :field="col.field" :header="col.header"></Column>

        <Column header="Ações" bodyClass="flex gap-2">
          <template #body="slotProps">
            <button @click="$emit('edit', slotProps.data.id)" class="cursor-pointer" v-tooltip="'Editar Professor'">
              <i class="pi pi-pencil text-gray-500" style="font-size: 1.2rem"></i>
            </button>

            <button @click="deleteProfessor(slotProps.data.id, slotProps.data.nome)" class="cursor-pointer"
                    v-tooltip="'Excluir Professor'">
              <i class="pi pi-trash text-red-600" style="font-size: 1.2rem"></i>
            </button>
          </template>
        </Column>

        <template #paginatorstart>
          <Button type="button" icon="pi pi-refresh" text/>
        </template>

        <template #paginatorend>
          <Button type="button" icon="pi pi-download" disabled text/>
        </template>
      </DataTable>
    </div>

    <ConfirmDialog></ConfirmDialog>
    <Toast></Toast>
  </div>
</template>

<style scoped>
</style>