// /home/ubuntu/petshop_frontend/petshop/src/services/animalService.ts

import api from './api';

export interface Animal {
  animal_id: number;
  cliente_id: number;
  nome: string;
  especie: string;
  raca?: string;
  data_nascimento?: string;
  observacoes?: string;
}

export interface AnimalCreate {
  cliente_id: number;
  nome: string;
  especie: string;
  raca?: string;
  data_nascimento?: string;
  observacoes?: string;
}

export interface AnimalUpdate {
  nome?: string;
  especie?: string;
  raca?: string;
  data_nascimento?: string;
  observacoes?: string;
}

const animalService = {
  // Buscar todos os animais
  getAll: async (): Promise<Animal[]> => {
    const response = await api.get('/animais/');
    return response.data;
  },

  // Buscar animais por cliente
  getByCliente: async (clienteId: number): Promise<Animal[]> => {
    const response = await api.get(`/animais/?cliente_id=${clienteId}`);
    return response.data;
  },

  // Buscar animal por ID
  getById: async (id: number): Promise<Animal> => {
    const response = await api.get(`/animais/${id}`);
    return response.data;
  },

  // Criar novo animal
  create: async (animal: AnimalCreate): Promise<Animal> => {
    const response = await api.post('/animais/', animal);
    return response.data;
  },

  // Atualizar animal existente
  update: async (id: number, animal: AnimalUpdate): Promise<Animal> => {
    const response = await api.put(`/animais/${id}`, animal);
    return response.data;
  },

  // Excluir animal
  delete: async (id: number): Promise<void> => {
    await api.delete(`/animais/${id}`);
  }
};

export default animalService;
