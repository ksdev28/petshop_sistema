import { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Trash2, X } from "lucide-react";
import animalService, {
  Animal,
  AnimalCreate,
  AnimalUpdate,
} from "../../services/animalService";
import clienteService, { Cliente } from "../../services/clienteService";

// Tipos
interface AnimalFormData {
  cliente_id: number;
  nome: string;
  especie: string;
  raca?: string;
  data_nascimento?: string;
  observacoes?: string;
}

const AnimaisList = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formData, setFormData] = useState<AnimalFormData>({
    cliente_id: 0,
    nome: "",
    especie: "",
    raca: "",
    data_nascimento: "",
    observacoes: "",
  });

  // Carregar dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [animaisData, clientesData] = await Promise.all([
          animalService.getAll(),
          clienteService.getAll(),
        ]);
        setAnimais(
          animaisData.map((animal) => ({
            ...animal,
            cliente_nome:
              clientesData.find((c) => c.cliente_id === animal.cliente_id)
                ?.nome || "Desconhecido",
          }))
        );
        setClientes(clientesData);
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

  // Filtrar animais
  const filteredAnimais = animais.filter(
    (animal) =>
      animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.raca &&
        animal.raca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (animal.cliente_nome &&
        animal.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "cliente_id" ? parseInt(value, 10) : value,
    });
  };

  const resetForm = () => {
    setFormData({
      cliente_id: 0,
      nome: "",
      especie: "",
      raca: "",
      data_nascimento: "",
      observacoes: "",
    });
    setEditingAnimal(null);
  };

  const handleOpenForm = (animal?: Animal) => {
    if (animal) {
      setEditingAnimal(animal);
      setFormData({
        cliente_id: animal.cliente_id,
        nome: animal.nome,
        especie: animal.especie,
        raca: animal.raca || "",
        data_nascimento: animal.data_nascimento || "",
        observacoes: animal.observacoes || "",
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
    if (!formData.cliente_id || !formData.nome || !formData.especie) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const clienteNome =
        clientes.find((c) => c.cliente_id === formData.cliente_id)?.nome ||
        "Desconhecido";
      if (editingAnimal) {
        const animalData: AnimalUpdate = {
          nome: formData.nome,
          especie: formData.especie,
          raca: formData.raca,
          data_nascimento: formData.data_nascimento,
          observacoes: formData.observacoes,
        };
        const updatedAnimal = await animalService.update(
          editingAnimal.animal_id,
          animalData
        );
        setAnimais(
          animais.map((a) =>
            a.animal_id === updatedAnimal.animal_id
              ? { ...updatedAnimal, cliente_nome: clienteNome }
              : a
          )
        );
      } else {
        // Adicionar novo animal
        const animalData: AnimalCreate = {
          cliente_id: formData.cliente_id,
          nome: formData.nome,
          especie: formData.especie,
          raca: formData.raca,
          data_nascimento: formData.data_nascimento,
          observacoes: formData.observacoes,
        };
        const newAnimal = await animalService.create(animalData);
        setAnimais([...animais, { ...newAnimal, cliente_nome: clienteNome }]);
      }

      setLoading(false);
      setShowForm(false);
      resetForm();
      setError(null);
    } catch (err: any) {
      console.error("Erro ao salvar animal:", err);
      setError(
        err.response?.data?.detail || "Erro ao salvar animal. Tente novamente."
      );
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este animal?")) {
      try {
        setLoading(true);
        await animalService.delete(id);
        setAnimais(animais.filter((a) => a.animal_id !== id));
        setError(null);
      } catch (err: any) {
        console.error("Erro ao excluir animal:", err);
        setError(
          err.response?.data?.detail ||
            "Erro ao excluir animal. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Formatação de data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (error && !loading) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Animais</h1>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Novo Animal
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar animais..."
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
                {editingAnimal ? "Editar Animal" : "Novo Animal"}
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
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="cliente_id"
                >
                  Cliente*
                </label>
                <select
                  id="cliente_id"
                  name="cliente_id"
                  value={formData.cliente_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.cliente_id} value={cliente.cliente_id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="block text-gray-700 mb-2" htmlFor="especie">
                  Espécie*
                </label>
                <input
                  type="text"
                  id="especie"
                  name="especie"
                  value={formData.especie}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="raca">
                  Raça
                </label>
                <input
                  type="text"
                  id="raca"
                  name="raca"
                  value={formData.raca}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="data_nascimento"
                >
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="data_nascimento"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
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

      {/* Tabela de animais */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Espécie/Raça
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nascimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observações
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
              ) : filteredAnimais.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhum animal encontrado
                  </td>
                </tr>
              ) : (
                filteredAnimais.map((animal) => (
                  <tr key={animal.animal_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {animal.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {animal.especie}
                      </div>
                      <div className="text-sm text-gray-500">
                        {animal.raca || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {animal.cliente_nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(animal.data_nascimento)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {animal.observacoes || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenForm(animal)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(animal.animal_id)}
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

export default AnimaisList;
