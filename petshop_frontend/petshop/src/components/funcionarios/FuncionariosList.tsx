import { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Trash2, X } from "lucide-react";
import funcionarioService, {
  Funcionario,
  FuncionarioCreate,
  FuncionarioUpdate,
} from "../../services/funcionarioService";

// Tipos
interface FuncionarioFormData {
  nome: string;
  cargo: string;
  telefone?: string;
  email?: string;
  data_contratacao: string;
  ativo: boolean;
}

const FuncionariosList = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFuncionario, setEditingFuncionario] =
    useState<Funcionario | null>(null);
  const [formData, setFormData] = useState<FuncionarioFormData>({
    nome: "",
    cargo: "",
    telefone: "",
    email: "",
    data_contratacao: "",
    ativo: true,
  });

  // Carregar dados da API
  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        setLoading(true);
        const data = await funcionarioService.getAll();
        setFuncionarios(data);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar funcionários:", err);
        setError(
          err.response?.data?.detail ||
            "Não foi possível carregar os funcionários. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchFuncionarios();
  }, []);

  // Filtrar funcionários
  const filteredFuncionarios = funcionarios.filter(
    (funcionario) =>
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (funcionario.email &&
        funcionario.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (funcionario.telefone && funcionario.telefone.includes(searchTerm))
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      cargo: "",
      telefone: "",
      email: "",
      data_contratacao: "",
      ativo: true,
    });
    setEditingFuncionario(null);
  };

  const handleOpenForm = (funcionario?: Funcionario) => {
    if (funcionario) {
      setEditingFuncionario(funcionario);
      setFormData({
        nome: funcionario.nome,
        cargo: funcionario.cargo,
        telefone: funcionario.telefone || "",
        email: funcionario.email || "",
        data_contratacao: funcionario.data_contratacao,
        ativo: funcionario.ativo,
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
    if (!formData.nome || !formData.cargo || !formData.data_contratacao) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      if (editingFuncionario) {
        // Atualizar funcionário existente
        const funcionarioData: FuncionarioUpdate = {
          nome: formData.nome,
          cargo: formData.cargo,
          telefone: formData.telefone,
          email: formData.email,
          data_contratacao: formData.data_contratacao,
          ativo: formData.ativo,
        };
        const updatedFuncionario = await funcionarioService.update(
          editingFuncionario.funcionario_id,
          funcionarioData
        );
        setFuncionarios(
          funcionarios.map((f) =>
            f.funcionario_id === updatedFuncionario.funcionario_id
              ? updatedFuncionario
              : f
          )
        );
      } else {
        // Adicionar novo funcionário
        const funcionarioData: FuncionarioCreate = {
          nome: formData.nome,
          cargo: formData.cargo,
          telefone: formData.telefone,
          email: formData.email,
          data_contratacao: formData.data_contratacao,
          ativo: formData.ativo,
        };
        const newFuncionario = await funcionarioService.create(funcionarioData);
        setFuncionarios([...funcionarios, newFuncionario]);
      }

      setLoading(false);
      setShowForm(false);
      resetForm();
      setError(null);
    } catch (err: any) {
      console.error("Erro ao salvar funcionário:", err);
      setError(
        err.response?.data?.detail ||
          "Erro ao salvar funcionário. Tente novamente."
      );
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        setLoading(true);
        await funcionarioService.delete(id);
        setFuncionarios(funcionarios.filter((f) => f.funcionario_id !== id));
        setError(null);
      } catch (err: any) {
        console.error("Erro ao excluir funcionário:", err);
        setError(
          err.response?.data?.detail ||
            "Erro ao excluir funcionário. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (error && !loading) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Funcionários</h1>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Novo Funcionário
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar funcionários..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingFuncionario ? "Editar Funcionário" : "Novo Funcionário"}
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
                <label className="block text-gray-700 mb-2" htmlFor="cargo">
                  Cargo*
                </label>
                <input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="telefone">
                  Telefone
                </label>
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="data_contratacao"
                >
                  Data de Contratação*
                </label>
                <input
                  type="date"
                  id="data_contratacao"
                  name="data_contratacao"
                  value={formData.data_contratacao}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700" htmlFor="ativo">
                  Funcionário Ativo
                </label>
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

      {/* Tabela de funcionários */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contratação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredFuncionarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhum funcionário encontrado
                  </td>
                </tr>
              ) : (
                filteredFuncionarios.map((funcionario) => (
                  <tr
                    key={funcionario.funcionario_id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {funcionario.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {funcionario.cargo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {funcionario.telefone || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {funcionario.email || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(funcionario.data_contratacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          funcionario.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {funcionario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenForm(funcionario)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(funcionario.funcionario_id)}
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

export default FuncionariosList;
