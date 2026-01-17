import {type Ref, unref} from "vue";

type PlainDateInput = Date | string | number | null | undefined;
type DateInput = PlainDateInput | Ref<PlainDateInput>;

type LocaleOptions = Intl.LocalesArgument;

// Tipo para as opções de formatação, baseadas na Intl.DateTimeFormatOptions
type FormatOptions = Intl.DateTimeFormatOptions;

const defaultOptions: FormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

export function useDateFormatter() {
  /**
   * Composable para formatar datas no Vue.js com TypeScript.
   * Utiliza a API nativa Intl.DateTimeFormat para internacionalização e desempenho.
   *
   * @param date A data a ser formatada (pode ser uma Ref, Date, string ou number).
   * @param locale O código da localidade (ex: 'pt-BR', 'en-US').
   * @param options Opções de formatação para Intl.DateTimeFormat.
   * @param inputFormat
   * @returns Uma string com a data formatada.
   */
  const formatDateToLocaleDateString = (
      { date, locale = 'pt-BR', options = {} }: {
        date: { value: DateInput, format?: string } | DateInput,
        locale?: LocaleOptions,
        options?: FormatOptions,
      }
  ): string => {
    const intlLocale = locale || 'pt-BR';
    const formatOptions: FormatOptions = { ...defaultOptions, ...options };

    return (function () {
      const dateValue = unref((date && (typeof date === 'object') && 'value' in date) ? date.value : date);
      const inputFormat = (date && (typeof dateValue === 'string') && (typeof date === 'object') && 'format' in date)
          ? date.format
          : undefined;

      if (dateValue === null || dateValue === undefined || dateValue === '') {
        return 'Data Inválida!';
      }

      try {
        const dateObj: Date = parseDateByFormat(dateValue.toString(), inputFormat) || new Date(dateValue);

        if (isNaN(dateObj.getTime())) {
          console.error('Data inválida fornecida para useDateFormat:', dateValue);
          return 'Data Inválida!';
        }

        return new Intl.DateTimeFormat(intlLocale, formatOptions).format(dateObj);
      } catch (e) {
        console.error('Erro ao formatar data:', e);
        return 'Erro na Formatação.';
      }
    })();
  };

  /**
   * Formata uma data para os padrões ISO mais comuns.
   * @param date Data a ser formatada (Ref, Date, string ou number).
   * @param type Tipo de formato ISO: 'date', 'datetime', 'datetime-local'.
   * @param inputFormat
   * @returns String no formato ISO ou mensagem de erro.
   */
  const formatDateToISODateString = (
      { date, type = 'datetime' }: {
          date: { value: DateInput, format?: string } | DateInput,
          type?: 'date' | 'datetime' | 'datetime-local',
        }
  ): string => {
    const dateValue = unref((date && (typeof date === 'object') && 'value' in date) ? date.value : date);
    const inputFormat = (date && (typeof dateValue === 'string') && (typeof date === 'object') && 'format' in date)
        ? date.format
        : undefined;

    if (dateValue === null || dateValue === undefined || dateValue === '') {
      return 'Data Inválida!';
    }

    try {
      const dateObj: Date = parseDateByFormat(dateValue.toString(), inputFormat) || new Date(dateValue);

      if (isNaN(dateObj.getTime())) {
        return 'Data Inválida!';
      }

      if (type === 'date') {
        return dateObj.toISOString().slice(0, 10); // yyyy-mm-dd -> ISO 8601 Date (sem tempo)
      }

      if (type === 'datetime-local') {
        return dateObj.toISOString().slice(0, 19).replace('T', ' '); // yyyy-mm-dd hh:mm:ss -> ISO 8601 Datetime Local (sem fuso)
      }

      return dateObj.toISOString(); // yyyy-mm-ddThh:mm:ss.sssZ -> ISO 8601 Datetime (com fuso)
    } catch (e) {
      return 'Erro na Formatação.';
    }
  };

  return { formatDateToLocaleDateString, formatDateToISODateString };
}

function parseDateByFormat(dateStr: string, format?: string): Date | null {
  const formats = format
    ? [format]
    : [
      'yyyy-MM-dd',
      'dd/MM/yyyy',
      'MM/dd/yyyy',
      'yyyy/MM/dd',
      'dd-MM-yyyy',
      'MM-dd-yyyy',
      'yyyyMMdd',
    ];

  const functionByFormatMap: Record<string, Function> = {
    'dd/MM/yyyy': (s: string) => {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return null;

      const [day, month, year] = s.split('/').map(Number);

      if (!day || !month || !year) return null;

      return new Date(year, month - 1, day);
    },
    'MM/dd/yyyy': (s: string) => {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return null;

      const [month, day, year] = s.split('/').map(Number);

      if (!day || !month || !year) return null;

      return new Date(year, month - 1, day);
    },
    'yyyy-MM-dd': (s: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;

      const [year, month, day] = s.split('-').map(Number);

      if (!day || !month || !year) return null;

      return new Date(year, month - 1, day);
    },
    'dd-MM-yyyy': (s: string) => {
      if (!/^\d{2}-\d{2}-\d{4}$/.test(s)) return null;

      const [day, month, year] = s.split('-').map(Number);

      if (!day || !month || !year) return null;

      return new Date(year, month - 1, day);
    },
    'MM-dd-yyyy': (s: string) => {
      if (!/^\d{2}-\d{2}-\d{4}$/.test(s)) return null;

      const [month, day, year] = s.split('-').map(Number);

      if (!day || !month || !year) return null;

      return new Date(year, month - 1, day);
    },
    'yyyy/MM/dd': (s: string) => {
      if (!/^\d{4}\/\d{2}\/\d{2}$/.test(s)) return null;

      const [year, month, day] = s.split('/').map(Number);

      if (!day || !month || !year) return null;

      return new Date(year, month - 1, day);
    },
    'yyyyMMdd': (s: string) => {
      const year = Number(s.slice(0, 4));
      const month = Number(s.slice(4, 6));
      const day = Number(s.slice(6, 8));
      return new Date(year, month - 1, day);
    },
  };

  for (const fmt of formats) {
    const date: Date | null | undefined = functionByFormatMap[fmt]?.(dateStr);
    if (date && !isNaN(date.getTime())) return date;
  }

  return null;
}