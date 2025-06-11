// /home/ubuntu/petshop_frontend/petshop/src/services/servicoService.ts

import api from './api';

export interface Servico {
  servico_id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_estimada_minutos: number;
}

export interface ServicoCreate {
  nome: string;
  descricao?: string;
  preco: number;
  duracao_estimada_minutos: number;
}

export interface ServicoUpdate {
  nome?: string;
  descricao?: string;
  preco?: number;
  duracao_estimada_minutos?: number;
}

const servicoService = {
  // Buscar todos os serviços
  getAll: async (): Promise<Servico[]> => {
    const response = await api.get('/servicos/');
    return response.data;
  },

  // Buscar serviço por ID
  getById: async (id: number): Promise<Servico> => {
    const response = await api.get(`/servicos/${id}`);
    return response.data;
  },

  // Criar novo serviço
  create: async (servico: ServicoCreate): Promise<Servico> => {
    const response = await api.post('/servicos/', servico);
    return response.data;
  },

  // Atualizar serviço existente
  update: async (id: number, servico: ServicoUpdate): Promise<Servico> => {
    const response = await api.put(`/servicos/${id}`, servico);
    return response.data;
  },

  // Excluir serviço
  delete: async (id: number): Promise<void> => {
    await api.delete(`/servicos/${id}`);
  }
};

export default servicoService;
