import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import ClientesList from "./components/clientes/ClientesList";
import AnimaisList from "./components/animais/AnimaisList";
import FuncionariosList from "./components/funcionarios/FuncionariosList";
import ServicosList from "./components/servicos/ServicosList";
import AgendamentosList from "./components/agendamentos/AgendamentosList";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
        <Navbar />
        <main className="py-10">
          <Routes>
            <Route
              path="/"
              element={
                <div className="container mx-auto px-6">
                  <div className="text-center py-12">
                    <h1 className="text-5xl font-extrabold text-blue-700 mb-5 tracking-tight">
                      Sistema de Agendamento Pet Shop
                    </h1>
                    <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
                      Gerencie clientes, animais, funcionários, serviços e
                      agendamentos do seu pet shop com eficiência.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                      <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4">
                          Clientes
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Cadastre e gerencie os donos dos animais.
                        </p>
                        <a
                          href="/clientes"
                          className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Acessar →
                        </a>
                      </div>
                      <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4">
                          Animais
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Registre os pets e suas informações.
                        </p>
                        <a
                          href="/animais"
                          className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Acessar →
                        </a>
                      </div>
                      <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4">
                          Funcionários
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Gerencie a equipe do pet shop.
                        </p>
                        <a
                          href="/funcionarios"
                          className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Acessar →
                        </a>
                      </div>
                      <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4">
                          Serviços
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Configure os serviços oferecidos.
                        </p>
                        <a
                          href="/servicos"
                          className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Acessar →
                        </a>
                      </div>
                      <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4">
                          Agendamentos
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Agende e gerencie os atendimentos.
                        </p>
                        <a
                          href="/agendamentos"
                          className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Acessar →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/clientes" element={<ClientesList />} />
            <Route path="/animais" element={<AnimaisList />} />
            <Route path="/funcionarios" element={<FuncionariosList />} />
            <Route path="/servicos" element={<ServicosList />} />
            <Route path="/agendamentos" element={<AgendamentosList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
