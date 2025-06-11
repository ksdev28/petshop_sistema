// /home/ubuntu/petshop_frontend/petshop/src/services/clienteService.ts

import api from './api';

export interface Cliente {
  cliente_id: number;
  nome: string;
  telefone: string;
  email: string;
  endereco?: string;
  data_cadastro: string;
}

export interface ClienteCreate {
  nome: string;
  telefone: string;
  email: string;
  endereco?: string;
}

export interface ClienteUpdate {
  nome?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

const clienteService = {
  // Buscar todos os clientes
  getAll: async (): Promise<Cliente[]> => {
    const response = await api.get('/clientes/');
    return response.data;
  },

  // Buscar cliente por ID
  getById: async (id: number): Promise<Cliente> => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  // Criar novo cliente
  create: async (cliente: ClienteCreate): Promise<Cliente> => {
    const response = await api.post('/clientes/', cliente);
    return response.data;
  },

  // Atualizar cliente existente
  update: async (id: number, cliente: ClienteUpdate): Promise<Cliente> => {
    const response = await api.put(`/clientes/${id}`, cliente);
    return response.data;
  },

  // Excluir cliente
  delete: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  }
};

export default clienteService;
