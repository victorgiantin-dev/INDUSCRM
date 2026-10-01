export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  ddd_telefone_2?: string;
  email?: string;
  descricao_situacao_cadastral?: string;
  data_situacao_cadastral?: string;
  capital_social?: number;
}

export interface CnpjSearchResult {
  success: boolean;
  data?: {
    cnpj: string;
    cnpjFormatted: string;
    razaoSocial: string;
    nomeFantasia: string;
    cnae: string;
    cnaeDescricao: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    enderecoCompleto: string;
    telefone: string;
    whatsapp: string;
    email: string;
    situacao: string;
  };
  error?: string;
}

export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function formatCnpj(cnpj: string): string {
  const digits = cleanCnpj(cnpj);
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
}

// Algoritmo oficial de validação de dígitos verificadores de CNPJ
export function validateCnpj(cnpj: string): boolean {
  const clean = cleanCnpj(cnpj);
  if (clean.length !== 14) return false;

  // Rejeita sequências repetidas (00000000000000, 11111111111111, etc.)
  if (/^(\d)\1{13}$/.test(clean)) return false;

  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === Number(digits.charAt(1));
}

/**
 * Consulta dados cadastrais na Receita Federal via BrasilAPI
 */
export async function consultarBrasilApiCnpj(cnpjInput: string): Promise<CnpjSearchResult> {
  const digits = cleanCnpj(cnpjInput);

  if (!digits) {
    return { success: false, error: 'Por favor, informe o CNPJ da empresa.' };
  }

  if (digits.length !== 14) {
    return {
      success: false,
      error: `CNPJ incompleto (${digits.length} de 14 dígitos). Verifique o número informado.`,
    };
  }

  if (!validateCnpj(digits)) {
    return {
      success: false,
      error: 'CNPJ inválido de acordo com o cálculo de dígitos verificadores da Receita Federal.',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.status === 404) {
      return {
        success: false,
        error: 'CNPJ não encontrado na base de dados da Receita Federal.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: `Serviço da BrasilAPI retornou status ${response.status}. Tente novamente em instantes.`,
      };
    }

    const data: BrasilApiCnpjResponse = await response.json();

    const formattedCnpj = formatCnpj(digits);
    const rawPhone = data.ddd_telefone_1 || data.ddd_telefone_2 || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneFormatted = cleanPhone ? formatPhone(cleanPhone) : '';

    const enderecoParts = [
      data.logradouro,
      data.numero ? `nº ${data.numero}` : null,
      data.complemento,
      data.bairro,
      data.municipio ? `${data.municipio} - ${data.uf}` : null,
      data.cep ? `CEP: ${data.cep}` : null,
    ].filter(Boolean);

    return {
      success: true,
      data: {
        cnpj: digits,
        cnpjFormatted: formattedCnpj,
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || data.razao_social || '',
        cnae: data.cnae_fiscal ? String(data.cnae_fiscal) : '',
        cnaeDescricao: data.cnae_fiscal_descricao || '',
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        municipio: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep ? data.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2') : '',
        enderecoCompleto: enderecoParts.join(', '),
        telefone: phoneFormatted,
        whatsapp: cleanPhone,
        email: data.email?.toLowerCase() || '',
        situacao: data.descricao_situacao_cadastral || 'ATIVA',
      },
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        error: 'Tempo limite esgotado ao consultar BrasilAPI (timeout). Verifique sua conexão e tente novamente.',
      };
    }
    return {
      success: false,
      error: 'Não foi possível conectar à BrasilAPI. Verifique sua conexão com a internet ou preencha os dados manualmente.',
    };
  }
}
