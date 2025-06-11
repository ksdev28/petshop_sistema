import { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Trash2, X, PawPrint } from "lucide-react";
import clienteService, {
  Cliente,
  ClienteCreate,
  ClienteUpdate,
} from "../../services/clienteService";
import animalService, { Animal } from "../../services/animalService";

interface ClienteFormData {
  nome: string;
  telefone: string;
  email: string;
  endereco?: string;
}

const ClientesList = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
  });
  const [showAnimaisModal, setShowAnimaisModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [animaisCliente, setAnimaisCliente] = useState<Animal[]>([]);
  const [animaisLoading, setAnimaisLoading] = useState(false);

  // Carregar dados da API
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const data = await clienteService.getAll();
        setClientes(data);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar clientes:", err);
        setError(
          err.response?.data?.detail ||
            "Não foi possível carregar os clientes. Por favor, tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  // Função para carregar animais de um cliente
  const fetchAnimaisCliente = async (clienteId: number) => {
    try {
      setAnimaisLoading(true);
      const data = await animalService.getByCliente(clienteId);
      setAnimaisCliente(data);
    } catch (err: any) {
      console.error("Erro ao buscar animais:", err);
      setError(
        err.response?.data?.detail ||
          "Não foi possível carregar os animais. Tente novamente."
      );
    } finally {
      setAnimaisLoading(false);
    }
  };

  // Filtrar clientes
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      endereco: "",
    });
    setEditingCliente(null);
  };

  const handleOpenForm = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        endereco: cliente.endereco || "",
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

    if (!formData.nome || !formData.telefone || !formData.email) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      if (editingCliente) {
        const clienteData: ClienteUpdate = {
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
        };
        const updatedCliente = await clienteService.update(
          editingCliente.cliente_id,
          clienteData
        );
        setClientes(
          clientes.map((c) =>
            c.cliente_id === updatedCliente.cliente_id ? updatedCliente : c
          )
        );
      } else {
        const clienteData: ClienteCreate = {
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
        };
        const newCliente = await clienteService.create(clienteData);
        setClientes([...clientes, newCliente]);
      }

      setShowForm(false);
      resetForm();
      setError(null);
    } catch (err: any) {
      console.error("Erro ao salvar cliente:", err);
      setError(
        err.response?.data?.detail ||
          "Erro ao salvar cliente. Por favor, tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        setLoading(true);
        await clienteService.delete(id);
        setClientes(clientes.filter((c) => c.cliente_id !== id));
        setError(null);
      } catch (err: any) {
        console.error("Erro ao excluir cliente:", err);
        setError(
          err.response?.data?.detail ||
            "Erro ao excluir cliente. Por favor, tente novamente."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenAnimaisModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    fetchAnimaisCliente(cliente.cliente_id);
    setShowAnimaisModal(true);
  };

  const handleCloseAnimaisModal = () => {
    setShowAnimaisModal(false);
    setSelectedCliente(null);
    setAnimaisCliente([]);
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR")
    );
  };

  if (error && !loading) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Novo Cliente
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar clientes..."
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
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
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
                <label className="block text-gray-700 mb-2" htmlFor="telefone">
                  Telefone*
                </label>
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="endereco">
                  Endereço
                </label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Modal de animais */}
      {showAnimaisModal && selectedCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Animais de {selectedCliente.nome}
              </h2>
              <button
                onClick={handleCloseAnimaisModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {animaisLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : animaisCliente.length === 0 ? (
              <p className="text-gray-500 text-center">
                Nenhum animal encontrado para este cliente.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {animaisCliente.map((animal) => (
                  <li key={animal.animal_id} className="py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {animal.nome}
                    </div>
                    <div className="text-sm text-gray-500">
                      {animal.especie} {animal.raca ? `(${animal.raca})` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseAnimaisModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de clientes */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endereço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.cliente_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cliente.telefone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cliente.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {cliente.endereco || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(cliente.data_cadastro)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenAnimaisModal(cliente)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Ver Animais"
                      >
                        <PawPrint className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenForm(cliente)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.cliente_id)}
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

export default ClientesList;
