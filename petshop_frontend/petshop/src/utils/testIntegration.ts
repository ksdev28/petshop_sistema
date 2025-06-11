// Arquivo para testar a integração entre frontend e backend
// /home/ubuntu/petshop_frontend/petshop/src/utils/testIntegration.ts

import clienteService from '../services/clienteService';
import animalService from '../services/animalService';
import funcionarioService from '../services/funcionarioService';
import servicoService from '../services/servicoService';
import agendamentoService from '../services/agendamentoService';

/**
 * Função para testar a integração entre frontend e backend
 * Executa operações básicas de CRUD para cada entidade e registra os resultados
 */
export const testIntegration = async () => {
  const results = {
    clientes: { success: false, message: '' },
    animais: { success: false, message: '' },
    funcionarios: { success: false, message: '' },
    servicos: { success: false, message: '' },
    agendamentos: { success: false, message: '' },
  };

  try {
    // Teste de integração para Clientes
    console.log('Testando integração - Clientes');
    const clientes = await clienteService.getAll();
    console.log(`- Busca de clientes: ${clientes.length} encontrados`);
    results.clientes.success = true;
    results.clientes.message = `Integração bem-sucedida. ${clientes.length} clientes encontrados.`;
  } catch (error: any) {
    console.error('Erro na integração - Clientes:', error);
    results.clientes.message = `Erro: ${error.message || 'Falha na comunicação com o backend'}`;
  }

  try {
    // Teste de integração para Animais
    console.log('Testando integração - Animais');
    const animais = await animalService.getAll();
    console.log(`- Busca de animais: ${animais.length} encontrados`);
    results.animais.success = true;
    results.animais.message = `Integração bem-sucedida. ${animais.length} animais encontrados.`;
  } catch (error: any) {
    console.error('Erro na integração - Animais:', error);
    results.animais.message = `Erro: ${error.message || 'Falha na comunicação com o backend'}`;
  }

  try {
    // Teste de integração para Funcionários
    console.log('Testando integração - Funcionários');
    const funcionarios = await funcionarioService.getAll();
    console.log(`- Busca de funcionários: ${funcionarios.length} encontrados`);
    results.funcionarios.success = true;
    results.funcionarios.message = `Integração bem-sucedida. ${funcionarios.length} funcionários encontrados.`;
  } catch (error: any) {
    console.error('Erro na integração - Funcionários:', error);
    results.funcionarios.message = `Erro: ${error.message || 'Falha na comunicação com o backend'}`;
  }

  try {
    // Teste de integração para Serviços
    console.log('Testando integração - Serviços');
    const servicos = await servicoService.getAll();
    console.log(`- Busca de serviços: ${servicos.length} encontrados`);
    results.servicos.success = true;
    results.servicos.message = `Integração bem-sucedida. ${servicos.length} serviços encontrados.`;
  } catch (error: any) {
    console.error('Erro na integração - Serviços:', error);
    results.servicos.message = `Erro: ${error.message || 'Falha na comunicação com o backend'}`;
  }

  try {
    // Teste de integração para Agendamentos
    console.log('Testando integração - Agendamentos');
    const agendamentos = await agendamentoService.getAll();
    console.log(`- Busca de agendamentos: ${agendamentos.length} encontrados`);
    results.agendamentos.success = true;
    results.agendamentos.message = `Integração bem-sucedida. ${agendamentos.length} agendamentos encontrados.`;
  } catch (error: any) {
    console.error('Erro na integração - Agendamentos:', error);
    results.agendamentos.message = `Erro: ${error.message || 'Falha na comunicação com o backend'}`;
  }

  // Resultado geral da integração
  const allSuccess = Object.values(results).every(result => result.success);
  
  return {
    success: allSuccess,
    details: results,
    message: allSuccess 
      ? 'Integração entre frontend e backend bem-sucedida para todas as entidades!' 
      : 'Falha na integração entre frontend e backend para algumas entidades. Verifique os detalhes.'
  };
};

export default testIntegration;
