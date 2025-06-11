import { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Trash2, X } from "lucide-react";
import servicoService, {
  Servico,
  ServicoCreate,
  ServicoUpdate,
} from "../../services/servicoService";

// Tipos
interface ServicoFormData {
  nome: string;
  descricao?: string;
  preco: number | string;
  duracao_estimada_minutos: number | string;
}

const ServicosList = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState<ServicoFormData>({
    nome: "",
    descricao: "",
    preco: "",
    duracao_estimada_minutos: "",
  });

  // Carregar dados da API
  useEffect(() => {
    const fetchServicos = async () => {
      try {
        setLoading(true);
        const data = await servicoService.getAll();
        setServicos(data);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar serviços:", err);
        setError(
          err.response?.data?.detail ||
            "Não foi possível carregar os serviços. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchServicos();
  }, []);

  // Filtrar serviços com base no termo de pesquisa
  const filteredServicos = servicos.filter(
    (servico) =>
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (servico.descricao &&
        servico.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      servico.preco.toString().includes(searchTerm) ||
      servico.duracao_estimada_minutos.toString().includes(searchTerm)
  );

  // Manipuladores de eventos para o formulário
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      preco: "",
      duracao_estimada_minutos: "",
    });
    setEditingServico(null);
  };

  const handleOpenForm = (servico?: Servico) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        nome: servico.nome,
        descricao: servico.descricao || "",
        preco: servico.preco,
        duracao_estimada_minutos: servico.duracao_estimada_minutos,
      });
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (
      !formData.nome ||
      !formData.preco ||
      !formData.duracao_estimada_minutos
    ) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Validar valores numéricos
    const preco = parseFloat(formData.preco.toString());
    const duracao = parseInt(formData.duracao_estimada_minutos.toString(), 10);

    if (isNaN(preco) || preco <= 0) {
      setError("O preço deve ser um número positivo.");
      return;
    }

    if (isNaN(duracao) || duracao <= 0) {
      setError("A duração deve ser um número inteiro positivo.");
      return;
    }

    try {
      setLoading(true);
      if (editingServico) {
        // Atualizar serviço existente
        const servicoData: ServicoUpdate = {
          nome: formData.nome,
          descricao: formData.descricao,
          preco: preco,
          duracao_estimada_minutos: duracao,
        };
        const updatedServico = await servicoService.update(
          editingServico.servico_id,
          servicoData
        );
        setServicos(
          servicos.map((s) =>
            s.servico_id === updatedServico.servico_id ? updatedServico : s
          )
        );
      } else {
        // Adicionar novo serviço
        const servicoData: ServicoCreate = {
          nome: formData.nome,
          descricao: formData.descricao,
          preco: preco,
          duracao_estimada_minutos: duracao,
        };
        const newServico = await servicoService.create(servicoData);
        setServicos([...servicos, newServico]);
      }

      setLoading(false);
      setShowForm(false);
      resetForm();
      setError(null);
    } catch (err: any) {
      console.error("Erro ao salvar serviço:", err);
      setError(
        err.response?.data?.detail || "Erro ao salvar serviço. Tente novamente."
      );
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        setLoading(true);
        await servicoService.delete(id);
        setServicos(servicos.filter((s) => s.servico_id !== id));
        setError(null);
      } catch (err: any) {
        console.error("Erro ao excluir serviço:", err);
        setError(
          err.response?.data?.detail ||
            "Erro ao excluir serviço. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Formatação de preço para exibição
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Formatação de duração para exibição
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  };

  if (error && !loading) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Novo Serviço
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar serviços..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Modal de formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingServico ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="nome">
                  Nome*
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="descricao">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="preco">
                  Preço (R$)*
                </label>
                <input
                  type="number"
                  id="preco"
                  name="preco"
                  value={formData.preco}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="duracao_estimada_minutos"
                >
                  Duração Estimada (minutos)*
                </label>
                <input
                  type="number"
                  id="duracao_estimada_minutos"
                  name="duracao_estimada_minutos"
                  value={formData.duracao_estimada_minutos}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="1"
                  required
                />
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

      {/* Tabela de serviços */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredServicos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhum serviço encontrado
                  </td>
                </tr>
              ) : (
                filteredServicos.map((servico) => (
                  <tr key={servico.servico_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {servico.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {servico.descricao || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatPrice(servico.preco)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(servico.duracao_estimada_minutos)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenForm(servico)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(servico.servico_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServicosList;
