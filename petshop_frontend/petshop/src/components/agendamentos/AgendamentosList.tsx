import { useState, useEffect, Component, ErrorInfo } from "react";
import { PlusCircle, Search, Edit, Trash2, X, Calendar } from "lucide-react";
import agendamentoService, {
  Agendamento,
  AgendamentoCreate,
  AgendamentoUpdate,
  AgendamentoServico,
} from "../../services/agendamentoService";
import animalService, { Animal } from "../../services/animalService";
import funcionarioService, {
  Funcionario,
} from "../../services/funcionarioService";
import servicoService, { Servico } from "../../services/servicoService";

// Tipos
interface AgendamentoFormData {
  animal_id: number;
  funcionario_id?: number;
  data_hora_agendamento: string;
  status: string;
  observacoes?: string;
  servicos_ids: number[];
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-4">
          Ocorreu um erro ao carregar os agendamentos. Tente novamente.
        </div>
      );
    }
    return this.props.children;
  }
}

const AgendamentosList = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAgendamento, setEditingAgendamento] =
    useState<Agendamento | null>(null);
  const [formData, setFormData] = useState<AgendamentoFormData>({
    animal_id: 0,
    funcionario_id: undefined,
    data_hora_agendamento: "",
    status: "Agendado",
    observacoes: "",
    servicos_ids: [],
  });
  const [selectedServicos, setSelectedServicos] = useState<Servico[]>([]);

  // Carregar dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(
          "Carregando dados de agendamentos, animais, funcionários e serviços..."
        );
        const [agendamentosData, animaisData, funcionariosData, servicosData] =
          await Promise.all([
            agendamentoService.getAll(),
            animalService.getAll(),
            funcionarioService.getAll(),
            servicoService.getAll(),
          ]);
        console.log(
          "Agendamentos recebidos:",
          JSON.stringify(agendamentosData, null, 2)
        );
        setAgendamentos(agendamentosData);
        setAnimais(animaisData);
        setFuncionarios(funcionariosData);
        setServicos(servicosData);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        setError(
          err.response?.data?.detail ||
            "Não foi possível carregar os dados. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrar agendamentos
  const filteredAgendamentos = agendamentos.filter(
    (agendamento) =>
      (agendamento.animal_nome &&
        agendamento.animal_nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (agendamento.cliente_nome &&
        agendamento.cliente_nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (agendamento.funcionario_nome &&
        agendamento.funcionario_nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      agendamento.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDateTime(agendamento.data_hora_agendamento).includes(searchTerm)
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "animal_id" || name === "funcionario_id") {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value, 10) : undefined,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleServicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const servicoId = parseInt(e.target.value, 10);
    const servico = servicos.find((s) => s.servico_id === servicoId);

    if (servico && !selectedServicos.some((s) => s.servico_id === servicoId)) {
      setSelectedServicos([...selectedServicos, servico]);
      setFormData({
        ...formData,
        servicos_ids: [...formData.servicos_ids, servicoId],
      });
    }

    e.target.value = "";
  };

  const handleRemoveServico = (servicoId: number) => {
    setSelectedServicos(
      selectedServicos.filter((s) => s.servico_id !== servicoId)
    );
    setFormData({
      ...formData,
      servicos_ids: formData.servicos_ids.filter((id) => id !== servicoId),
    });
  };

  const resetForm = () => {
    setFormData({
      animal_id: 0,
      funcionario_id: undefined,
      data_hora_agendamento: "",
      status: "Agendado",
      observacoes: "",
      servicos_ids: [],
    });
    setSelectedServicos([]);
    setEditingAgendamento(null);
  };

  const handleOpenForm = async (agendamento?: Agendamento) => {
    console.log(
      "handleOpenForm chamado com agendamento:",
      JSON.stringify(agendamento, null, 2)
    );
    try {
      if (agendamento) {
        const fullAgendamento = await agendamentoService.getById(
          agendamento.agendamento_id
        );
        console.log(
          "Agendamento completo carregado para edição:",
          JSON.stringify(fullAgendamento, null, 2)
        );
        setEditingAgendamento(fullAgendamento);
        setFormData({
          animal_id: fullAgendamento.animal_id,
          funcionario_id: fullAgendamento.funcionario_id,
          data_hora_agendamento: fullAgendamento.data_hora_agendamento.slice(
            0,
            16
          ),
          status: fullAgendamento.status,
          observacoes: fullAgendamento.observacoes || "",
          servicos_ids:
            fullAgendamento.servicos?.map((s) => s.servico_id) || [],
        });
        const servicosSelecionados =
          fullAgendamento.servicos?.map((as) => {
            const servico = servicos.find(
              (s) => s.servico_id === as.servico_id
            );
            return (
              servico || {
                servico_id: as.servico_id,
                nome: as.nome_servico,
                preco: as.preco_registrado,
                duracao_estimada_minutos: 0,
              }
            );
          }) || [];
        setSelectedServicos(servicosSelecionados);
      } else {
        resetForm();
      }
    } catch (err: any) {
      console.error("Erro ao carregar agendamento para edição:", err);
      setError(
        "Não foi possível carregar os dados do agendamento: " +
          (err.response?.data?.detail || err.message)
      );
    } finally {
      console.log("Definindo showForm como true");
      setShowForm(true);
    }
  };

  const handleCloseForm = () => {
    console.log("Fechando formulário");
    setShowForm(false);
    resetForm();
  };

  // Converter data para formato ISO 8601
  const formatToISO = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) {
        throw new Error("Data inválida");
      }
      // Adicionar fuso horário -03:00
      return date.toISOString().replace("Z", "-03:00");
    } catch (err) {
      console.error("Erro ao formatar data para ISO:", err);
      return dateTime;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "Iniciando handleSubmit com formData:",
      JSON.stringify(formData, null, 2)
    );
    if (
      !formData.animal_id ||
      !formData.data_hora_agendamento ||
      !formData.status ||
      formData.servicos_ids.length === 0
    ) {
      const errorMsg =
        "Por favor, preencha todos os campos obrigatórios e selecione pelo menos um serviço.";
      console.warn("Validação falhou:", errorMsg);
      setError(errorMsg);
      return;
    }
    const animal = animais.find((a) => a.animal_id === formData.animal_id);
    if (!animal?.especie) {
      const errorMsg = "O animal selecionado não possui uma espécie válida.";
      console.warn("Validação falhou:", errorMsg);
      setError(errorMsg);
      return;
    }
    try {
      setLoading(true);
      const formattedData = {
        ...formData,
        data_hora_agendamento: formatToISO(formData.data_hora_agendamento),
      };
      console.log(
        "Dados formatados para envio:",
        JSON.stringify(formattedData, null, 2)
      );
      if (editingAgendamento) {
        const agendamentoData: AgendamentoUpdate = {
          animal_id: formattedData.animal_id,
          funcionario_id: formattedData.funcionario_id,
          data_hora_agendamento: formattedData.data_hora_agendamento,
          status: formattedData.status,
          observacoes: formattedData.observacoes,
          servicos_ids: formattedData.servicos_ids,
        };
        console.log(
          "Enviando atualização:",
          JSON.stringify(agendamentoData, null, 2)
        );
        const updatedAgendamento = await agendamentoService.update(
          editingAgendamento.agendamento_id,
          agendamentoData
        );
        console.log(
          "Agendamento atualizado:",
          JSON.stringify(updatedAgendamento, null, 2)
        );
        setAgendamentos(
          agendamentos.map((a) =>
            a.agendamento_id === updatedAgendamento.agendamento_id
              ? updatedAgendamento
              : a
          )
        );
      } else {
        const agendamentoData: AgendamentoCreate = {
          animal_id: formattedData.animal_id,
          funcionario_id: formattedData.funcionario_id,
          data_hora_agendamento: formattedData.data_hora_agendamento,
          status: formattedData.status,
          observacoes: formattedData.observacoes,
          servicos_ids: formattedData.servicos_ids,
        };
        console.log(
          "Enviando criação:",
          JSON.stringify(agendamentoData, null, 2)
        );
        const newAgendamento = await agendamentoService.create(agendamentoData);
        console.log(
          "Novo agendamento criado:",
          JSON.stringify(newAgendamento, null, 2)
        );
        setAgendamentos([...agendamentos, newAgendamento]);
      }
      setLoading(false);
      setShowForm(false);
      resetForm();
      setError(null);
    } catch (err: any) {
      console.error("Erro ao salvar agendamento:", err);
      const errorMsg =
        err.response?.data?.detail ||
        "Erro ao salvar agendamento. Tente novamente.";
      console.error("Mensagem de erro detalhada:", errorMsg);
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        setLoading(true);
        console.log(`Excluindo agendamento ID: ${id}`);
        await agendamentoService.delete(id);
        setAgendamentos(agendamentos.filter((a) => a.agendamento_id !== id));
        setError(null);
      } catch (err: any) {
        console.error("Erro ao excluir agendamento:", err);
        setError(
          err.response?.data?.detail ||
            "Erro ao excluir agendamento. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Formatação de data e hora
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        console.warn(`Data inválida: ${dateTimeString}`);
        return "-";
      }
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Erro ao formatar data:", err);
      return "-";
    }
  };

  // Formatação de preço
  const formatPrice = (price?: number | null) => {
    if (price === undefined || price === null) return "-";
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Buscar classe de cor com base no status
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "Agendado":
        return "bg-blue-100 text-blue-800";
      case "Confirmado":
        return "bg-green-100 text-green-800";
      case "Cancelado":
        return "bg-red-100 text-red-800";
      case "Concluído":
        return "bg-purple-100 text-purple-800";
      case "Não Compareceu":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Agendamentos</h1>
          <button
            onClick={() => handleOpenForm()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Novo Agendamento
          </button>
        </div>

        {}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar agendamentos..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {}
        {error && !showForm && (
          <div className="text-red-500 p-4 mb-4 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingAgendamento
                    ? "Editar Agendamento"
                    : "Novo Agendamento"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {}
              {error && (
                <div className="text-red-500 p-4 mb-4 bg-red-100 rounded-md">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="animal_id"
                    >
                      Animal*
                    </label>
                    <select
                      id="animal_id"
                      name="animal_id"
                      value={formData.animal_id || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um animal</option>
                      {animais.map((animal) => (
                        <option key={animal.animal_id} value={animal.animal_id}>
                          {animal.nome} ({animal.especie},{" "}
                          {animal.cliente_nome || "Desconhecido"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="funcionario_id"
                    >
                      Funcionário
                    </label>
                    <select
                      id="funcionario_id"
                      name="funcionario_id"
                      value={formData.funcionario_id || ""}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um funcionário</option>
                      {funcionarios.map((funcionario) => (
                        <option
                          key={funcionario.funcionario_id}
                          value={funcionario.funcionario_id}
                        >
                          {funcionario.nome} ({funcionario.cargo})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="data_hora_agendamento"
                    >
                      Data e Hora*
                    </label>
                    <input
                      type="datetime-local"
                      id="data_hora_agendamento"
                      name="data_hora_agendamento"
                      value={formData.data_hora_agendamento}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="status"
                    >
                      Status*
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Agendado">Agendado</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Não Compareceu">Não Compareceu</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="observacoes"
                  >
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Serviços*</label>
                  <div className="flex items-center mb-2">
                    <select
                      id="servico_select"
                      onChange={handleServicoChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Adicionar serviço</option>
                      {servicos
                        .filter(
                          (s) =>
                            !selectedServicos.some(
                              (selected) => selected.servico_id === s.servico_id
                            )
                        )
                        .map((servico) => (
                          <option
                            key={servico.servico_id}
                            value={servico.servico_id}
                          >
                            {servico.nome} - {formatPrice(servico.preco)}
                          </option>
                        ))}
                    </select>
                  </div>
                  {selectedServicos.length === 0 ? (
                    <div className="text-red-500 text-sm">
                      Selecione pelo menos um serviço
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {selectedServicos.map((servico) => (
                          <li
                            key={servico.servico_id}
                            className="py-2 flex justify-between items-center"
                          >
                            <div>
                              <span className="font-medium">
                                {servico.nome}
                              </span>
                              <span className="ml-2 text-gray-600">
                                {formatPrice(servico.preco)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveServico(servico.servico_id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 pt-3 border-t border-gray-200 font-bold flex justify-between">
                        <span>Total:</span>
                        <span>
                          {formatPrice(
                            selectedServicos.reduce(
                              (total, s) => total + s.preco,
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabela de agendamentos */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Animal/Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviços
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredAgendamentos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Nenhum agendamento encontrado
                    </td>
                  </tr>
                ) : (
                  filteredAgendamentos.map((agendamento) => {
                    console.log(
                      "Renderizando agendamento:",
                      JSON.stringify(agendamento, null, 2)
                    );
                    return (
                      <tr
                        key={agendamento.agendamento_id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                            <div className="text-sm text-gray-900">
                              {formatDateTime(
                                agendamento.data_hora_agendamento
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {agendamento.animal_nome || "Desconhecido"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {agendamento.cliente_nome || "Desconhecido"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <ul className="text-sm text-gray-900">
                            {agendamento.servicos &&
                            agendamento.servicos.length > 0 ? (
                              agendamento.servicos.map((servico) => (
                                <li key={servico.servico_id} className="mb-1">
                                  {servico.nome_servico}
                                </li>
                              ))
                            ) : (
                              <li>-</li>
                            )}
                          </ul>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {agendamento.funcionario_nome || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(
                              agendamento.status
                            )}`}
                          >
                            {agendamento.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(agendamento.valor_total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenForm(agendamento)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(agendamento.agendamento_id)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AgendamentosList;
