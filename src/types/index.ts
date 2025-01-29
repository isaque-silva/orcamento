export interface InformacoesEmpresa {
  id?: string;
  nome_empresa: string;
  documento: string;
  tipo_documento: 'cpf' | 'cnpj';
  endereco: string;
  telefone: string;
  email: string;
  logo_url?: string;
  assinatura_url?: string;
  observacoes_padrao?: string;
  created_at?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  tipo_documento: 'cpf' | 'cnpj';
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  created_at?: string;
}

export interface ItemOrcamento {
  id: number;
  orcamento_id: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total?: number;
  created_at?: string;
}

export interface Orcamento {
  id: number;
  cliente_id: string;
  data: string;
  valor_total: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  created_at?: string;
  itens?: ItemOrcamento[];
} 