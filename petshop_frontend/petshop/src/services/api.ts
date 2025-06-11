// /home/ubuntu/petshop_frontend/petshop/src/services/api.ts

import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:8000', // URL base da API backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na requisição API:', error);
    
    // Personalizar mensagens de erro com base no status
    if (error.response) {
      // O servidor respondeu com um status de erro
      const status = error.response.status;
      
      if (status === 404) {
        error.message = 'Recurso não encontrado';
      } else if (status === 400) {
        error.message = error.response.data.detail || 'Dados inválidos';
      } else if (status === 401) {
        error.message = 'Não autorizado';
      } else if (status === 403) {
        error.message = 'Acesso proibido';
      } else if (status === 500) {
        error.message = 'Erro interno do servidor';
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      error.message = 'Servidor não respondeu. Verifique sua conexão.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
