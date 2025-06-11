import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, PawPrint } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <PawPrint className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">PetShop Agendamentos</span>
            </Link>
          </div>
          
          {/* Menu para desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Home
              </Link>
              <Link to="/clientes" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Clientes
              </Link>
              <Link to="/animais" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Animais
              </Link>
              <Link to="/funcionarios" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Funcionários
              </Link>
              <Link to="/servicos" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Serviços
              </Link>
              <Link to="/agendamentos" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Agendamentos
              </Link>
            </div>
          </div>
          
          {/* Botão de menu mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/clientes" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Clientes
            </Link>
            <Link 
              to="/animais" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Animais
            </Link>
            <Link 
              to="/funcionarios" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Funcionários
            </Link>
            <Link 
              to="/servicos" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Serviços
            </Link>
            <Link 
              to="/agendamentos" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Agendamentos
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
