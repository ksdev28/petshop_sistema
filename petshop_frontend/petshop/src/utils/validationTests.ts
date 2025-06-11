// /home/ubuntu/petshop_frontend/petshop/src/utils/validationTests.ts

import clienteService from '../services/clienteService';
import animalService from '../services/animalService';
import funcionarioService from '../services/funcionarioService';
import servicoService from '../services/servicoService';
import agendamentoService from '../services/agendamentoService';

/**
 * Função para validar o funcionamento completo do sistema
 * Executa operações CRUD para cada entidade e registra os resultados
 */
export const runValidationTests = async () => {
  const results = {
    clientes: { create: false, read: false, update: false, delete: false, message: '' },
    animais: { create: false, read: false, update: false, delete: false, message: '' },
    funcionarios: { create: false, read: false, update: false, delete: false, message: '' },
    servicos: { create: false, read: false, update: false, delete: false, message: '' },
    agendamentos: { create: false, read: false, update: false, delete: false, message: '' },
  };

  // Teste CRUD para Clientes
  try {
    console.log('Validando CRUD - Clientes');
    
    // CREATE
    const novoCliente = await clienteService.create({
      nome: 'Cliente Teste',
      telefone: '(11) 99999-9999',
      email: 'teste@email.com',
      endereco: 'Rua de Teste, 123'
    });
    results.clientes.create = true;
    console.log('- CREATE: OK', novoCliente);
    
    // READ
    const cliente = await clienteService.getById(novoCliente.cliente_id);
    results.clientes.read = cliente.cliente_id === novoCliente.cliente_id;
    console.log('- READ: OK', cliente);
    
    // UPDATE
    const clienteAtualizado = await clienteService.update(cliente.cliente_id, {
      nome: 'Cliente Teste Atualizado'
    });
    results.clientes.update = clienteAtualizado.nome === 'Cliente Teste Atualizado';
    console.log('- UPDATE: OK', clienteAtualizado);
    
    // DELETE
    await clienteService.delete(cliente.cliente_id);
    try {
      await clienteService.getById(cliente.cliente_id);
      results.clientes.delete = false;
    } catch (error) {
      results.clientes.delete = true;
      console.log('- DELETE: OK');
    }
    
    results.clientes.message = 'Todas as operações CRUD para Clientes foram validadas com sucesso.';
  } catch (error: any) {
    console.error('Erro na validação CRUD - Clientes:', error);
    results.clientes.message = `Erro: ${error.message || 'Falha na validação CRUD para Clientes'}`;
  }

  // Teste CRUD para Animais
  try {
    console.log('Validando CRUD - Animais');
    
    // Primeiro, criar um cliente para associar ao animal
    const clienteTemp = await clienteService.create({
      nome: 'Dono Teste',
      telefone: '(11) 88888-8888',
      email: 'dono@email.com'
    });
    
    // CREATE
    const novoAnimal = await animalService.create({
      cliente_id: clienteTemp.cliente_id,
      nome: 'Animal Teste',
      especie: 'Cachorro',
      raca: 'Vira-lata',
      data_nascimento: '2020-01-01'
    });
    results.animais.create = true;
    console.log('- CREATE: OK', novoAnimal);
    
    // READ
    const animal = await animalService.getById(novoAnimal.animal_id);
    results.animais.read = animal.animal_id === novoAnimal.animal_id;
    console.log('- READ: OK', animal);
    
    // UPDATE
    const animalAtualizado = await animalService.update(animal.animal_id, {
      nome: 'Animal Teste Atualizado'
    });
    results.animais.update = animalAtualizado.nome === 'Animal Teste Atualizado';
    console.log('- UPDATE: OK', animalAtualizado);
    
    // DELETE
    await animalService.delete(animal.animal_id);
    try {
      await animalService.getById(animal.animal_id);
      results.animais.delete = false;
    } catch (error) {
      results.animais.delete = true;
      console.log('- DELETE: OK');
    }
    
    // Limpar - remover o cliente temporário
    await clienteService.delete(clienteTemp.cliente_id);
    
    results.animais.message = 'Todas as operações CRUD para Animais foram validadas com sucesso.';
  } catch (error: any) {
    console.error('Erro na validação CRUD - Animais:', error);
    results.animais.message = `Erro: ${error.message || 'Falha na validação CRUD para Animais'}`;
  }

  // Teste CRUD para Funcionários
  try {
    console.log('Validando CRUD - Funcionários');
    
    // CREATE
    const novoFuncionario = await funcionarioService.create({
      nome: 'Funcionário Teste',
      cargo: 'Cargo Teste',
      telefone: '(11) 77777-7777',
      email: 'funcionario@email.com',
      data_contratacao: '2025-01-01',
      ativo: true
    });
    results.funcionarios.create = true;
    console.log('- CREATE: OK', novoFuncionario);
    
    // READ
    const funcionario = await funcionarioService.getById(novoFuncionario.funcionario_id);
    results.funcionarios.read = funcionario.funcionario_id === novoFuncionario.funcionario_id;
    console.log('- READ: OK', funcionario);
    
    // UPDATE
    const funcionarioAtualizado = await funcionarioService.update(funcionario.funcionario_id, {
      nome: 'Funcionário Teste Atualizado'
    });
    results.funcionarios.update = funcionarioAtualizado.nome === 'Funcionário Teste Atualizado';
    console.log('- UPDATE: OK', funcionarioAtualizado);
    
    // DELETE
    await funcionarioService.delete(funcionario.funcionario_id);
    try {
      await funcionarioService.getById(funcionario.funcionario_id);
      results.funcionarios.delete = false;
    } catch (error) {
      results.funcionarios.delete = true;
      console.log('- DELETE: OK');
    }
    
    results.funcionarios.message = 'Todas as operações CRUD para Funcionários foram validadas com sucesso.';
  } catch (error: any) {
    console.error('Erro na validação CRUD - Funcionários:', error);
    results.funcionarios.message = `Erro: ${error.message || 'Falha na validação CRUD para Funcionários'}`;
  }

  // Teste CRUD para Serviços
  try {
    console.log('Validando CRUD - Serviços');
    
    // CREATE
    const novoServico = await servicoService.create({
      nome: 'Serviço Teste',
      descricao: 'Descrição do serviço teste',
      preco: 50.00,
      duracao_estimada_minutos: 60
    });
    results.servicos.create = true;
    console.log('- CREATE: OK', novoServico);
    
    // READ
    const servico = await servicoService.getById(novoServico.servico_id);
    results.servicos.read = servico.servico_id === novoServico.servico_id;
    console.log('- READ: OK', servico);
    
    // UPDATE
    const servicoAtualizado = await servicoService.update(servico.servico_id, {
      nome: 'Serviço Teste Atualizado',
      preco: 60.00
    });
    results.servicos.update = servicoAtualizado.nome === 'Serviço Teste Atualizado';
    console.log('- UPDATE: OK', servicoAtualizado);
    
    // DELETE
    await servicoService.delete(servico.servico_id);
    try {
      await servicoService.getById(servico.servico_id);
      results.servicos.delete = false;
    } catch (error) {
      results.servicos.delete = true;
      console.log('- DELETE: OK');
    }
    
    results.servicos.message = 'Todas as operações CRUD para Serviços foram validadas com sucesso.';
  } catch (error: any) {
    console.error('Erro na validação CRUD - Serviços:', error);
    results.servicos.message = `Erro: ${error.message || 'Falha na validação CRUD para Serviços'}`;
  }

  // Teste CRUD para Agendamentos
  try {
    console.log('Validando CRUD - Agendamentos');
    
    // Criar entidades necessárias para o agendamento
    const clienteTemp = await clienteService.create({
      nome: 'Cliente Agendamento',
      telefone: '(11) 66666-6666',
      email: 'cliente.agendamento@email.com'
    });
    
    const animalTemp = await animalService.create({
      cliente_id: clienteTemp.cliente_id,
      nome: 'Animal Agendamento',
      especie: 'Gato'
    });
    
    const funcionarioTemp = await funcionarioService.create({
      nome: 'Funcionário Agendamento',
      cargo: 'Veterinário',
      data_contratacao: '2025-01-01',
      ativo: true
    });
    
    const servicoTemp = await servicoService.create({
      nome: 'Serviço Agendamento',
      preco: 100.00,
      duracao_estimada_minutos: 45
    });
    
    // CREATE
    const novoAgendamento = await agendamentoService.create({
      animal_id: animalTemp.animal_id,
      funcionario_id: funcionarioTemp.funcionario_id,
      data_hora_agendamento: '2025-06-10T14:00:00',
      status: 'Agendado',
      observacoes: 'Observação teste',
      servicos_ids: [servicoTemp.servico_id]
    });
    results.agendamentos.create = true;
    console.log('- CREATE: OK', novoAgendamento);
    
    // READ
    const agendamento = await agendamentoService.getById(novoAgendamento.agendamento_id);
    results.agendamentos.read = agendamento.agendamento_id === novoAgendamento.agendamento_id;
    console.log('- READ: OK', agendamento);
    
    // UPDATE
    const agendamentoAtualizado = await agendamentoService.update(agendamento.agendamento_id, {
      status: 'Confirmado',
      observacoes: 'Observação atualizada'
    });
    results.agendamentos.update = agendamentoAtualizado.status === 'Confirmado';
    console.log('- UPDATE: OK', agendamentoAtualizado);
    
    // DELETE
    await agendamentoService.delete(agendamento.agendamento_id);
    try {
      await agendamentoService.getById(agendamento.agendamento_id);
      results.agendamentos.delete = false;
    } catch (error) {
      results.agendamentos.delete = true;
      console.log('- DELETE: OK');
    }
    
    // Limpar - remover as entidades temporárias
    await servicoService.delete(servicoTemp.servico_id);
    await funcionarioService.delete(funcionarioTemp.funcionario_id);
    await animalService.delete(animalTemp.animal_id);
    await clienteService.delete(clienteTemp.cliente_id);
    
    results.agendamentos.message = 'Todas as operações CRUD para Agendamentos foram validadas com sucesso.';
  } catch (error: any) {
    console.error('Erro na validação CRUD - Agendamentos:', error);
    results.agendamentos.message = `Erro: ${error.message || 'Falha na validação CRUD para Agendamentos'}`;
  }

  // Resultado geral da validação
  const allSuccess = Object.values(results).every(result => 
    result.create && result.read && result.update && result.delete
  );
  
  return {
    success: allSuccess,
    details: results,
    message: allSuccess 
      ? 'Todas as operações CRUD foram validadas com sucesso para todas as entidades!' 
      : 'Falha na validação de algumas operações CRUD. Verifique os detalhes.'
  };
};

export default runValidationTests;
