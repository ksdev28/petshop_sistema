// /home/ubuntu/petshop_frontend/petshop/src/services/funcionarioService.ts

import api from './api';

export interface Funcionario {
  funcionario_id: number;
  nome: string;
  cargo: string;
  telefone?: string;
  email?: string;
  data_contratacao: string;
  ativo: boolean;
}

export interface FuncionarioCreate {
  nome: string;
  cargo: string;
  telefone?: string;
  email?: string;
  data_contratacao: string;
  ativo: boolean;
}

export interface FuncionarioUpdate {
  nome?: string;
  cargo?: string;
  telefone?: string;
  email?: string;
  data_contratacao?: string;
  ativo?: boolean;
}

const funcionarioService = {
  // Buscar todos os funcionários
  getAll: async (apenasAtivos: boolean = false): Promise<Funcionario[]> => {
    const response = await api.get(`/funcionarios/?apenas_ativos=${apenasAtivos}`);
    return response.data;
  },

  // Buscar funcionário por ID
  getById: async (id: number): Promise<Funcionario> => {
    const response = await api.get(`/funcionarios/${id}`);
    return response.data;
  },

  // Criar novo funcionário
  create: async (funcionario: FuncionarioCreate): Promise<Funcionario> => {
    const response = await api.post('/funcionarios/', funcionario);
    return response.data;
  },

  // Atualizar funcionário existente
  update: async (id: number, funcionario: FuncionarioUpdate): Promise<Funcionario> => {
    const response = await api.put(`/funcionarios/${id}`, funcionario);
    return response.data;
  },

  // Excluir funcionário
  delete: async (id: number): Promise<void> => {
    await api.delete(`/funcionarios/${id}`);
  }
};

export default funcionarioService;
