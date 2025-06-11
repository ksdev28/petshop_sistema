import api from "./api";

export interface AgendamentoServico {
  servico_id: number;
  nome_servico: string;
  preco_registrado: number;
  observacoes?: string;
}

export interface Agendamento {
  agendamento_id: number;
  animal_id: number;
  animal_nome?: string | null;
  cliente_nome?: string | null;
  funcionario_id?: number | null;
  funcionario_nome?: string | null;
  data_hora_agendamento: string;
  data_hora_criacao: string;
  status: string;
  observacoes?: string | null;
  valor_total?: number | null;
  servicos: AgendamentoServico[];
}

export interface AgendamentoCreate {
  animal_id: number;
  funcionario_id?: number;
  data_hora_agendamento: string;
  status: string;
  observacoes?: string;
  servicos_ids: number[];
}

export interface AgendamentoUpdate {
  animal_id?: number;
  funcionario_id?: number;
  data_hora_agendamento?: string;
  status?: string;
  observacoes?: string;
  servicos_ids?: number[];
}

export interface AgendamentoFiltros {
  animal_id?: number;
  funcionario_id?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  skip?: number;
  limit?: number;
}

const agendamentoService = {
  getAll: async (filtros?: AgendamentoFiltros): Promise<Agendamento[]> => {
    let url = "/agendamentos/";

    if (filtros) {
      const params = new URLSearchParams();

      if (filtros.animal_id)
        params.append("animal_id", filtros.animal_id.toString());
      if (filtros.funcionario_id)
        params.append("funcionario_id", filtros.funcionario_id.toString());
      if (filtros.data_inicio)
        params.append("data_inicio", filtros.data_inicio);
      if (filtros.data_fim) params.append("data_fim", filtros.data_fim);
      if (filtros.status) params.append("status", filtros.status);
      if (filtros.skip) params.append("skip", filtros.skip.toString());
      if (filtros.limit) params.append("limit", filtros.limit.toString());

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: number): Promise<Agendamento> => {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data;
  },

  create: async (agendamento: AgendamentoCreate): Promise<Agendamento> => {
    const response = await api.post("/agendamentos/", agendamento);
    return response.data;
  },

  update: async (
    id: number,
    agendamento: AgendamentoUpdate
  ): Promise<Agendamento> => {
    const response = await api.put(`/agendamentos/${id}`, agendamento);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/agendamentos/${id}`);
  },
};

export default agendamentoService;
