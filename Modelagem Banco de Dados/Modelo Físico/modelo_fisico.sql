
-- Criação da Tabela Clientes
CREATE TABLE Clientes (
    cliente_id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    endereco VARCHAR(500),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Criação da Tabela Funcionarios
CREATE TABLE Funcionarios (
    funcionario_id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    data_contratacao DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE -- Adicionado para indicar se o funcionário está ativo
);


-- Criação da Tabela Servicos
CREATE TABLE Servicos (
    servico_id SERIAL PRIMARY KEY,
    nome VARCHAR(150) UNIQUE NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
    duracao_estimada_minutos INTEGER NOT NULL CHECK (duracao_estimada_minutos > 0)
);


-- Criação da Tabela Animais
CREATE TABLE Animais (
    animal_id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(50),
    data_nascimento DATE,
    observacoes TEXT,
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id)
        REFERENCES Clientes (cliente_id)
        ON DELETE CASCADE -- Se o cliente for removido, seus animais também são.
);

-- Criação da Tabela Agendamentos
CREATE TABLE Agendamentos (
    agendamento_id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL,
    funcionario_id INTEGER, 
    data_hora_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Agendado', 'Confirmado', 'Cancelado', 'Concluído', 'Não Compareceu')),
    observacoes TEXT,
    CONSTRAINT fk_animal FOREIGN KEY (animal_id)
        REFERENCES Animais (animal_id)
        ON DELETE CASCADE, -- Se o animal for removido, seus agendamentos também são.
    CONSTRAINT fk_funcionario FOREIGN KEY (funcionario_id)
        REFERENCES Funcionarios (funcionario_id)
        ON DELETE SET NULL -- 
);


-- Criação da Tabela de Junção Agendamento_Servicos (N:M)
CREATE TABLE Agendamento_Servicos (
    agendamento_id INTEGER NOT NULL,
    servico_id INTEGER NOT NULL,
    preco_registrado DECIMAL(10, 2) NOT NULL,
    observacoes TEXT,
    PRIMARY KEY (agendamento_id, servico_id), -- Chave primária
    CONSTRAINT fk_agendamento FOREIGN KEY (agendamento_id)
        REFERENCES Agendamentos (agendamento_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_servico FOREIGN KEY (servico_id)
        REFERENCES Servicos (servico_id)
        ON DELETE RESTRICT -- Impede remover um serviço se ele estiver em algum agendamento.
);

-- Criação de Índices para otimização de consultas
CREATE INDEX idx_animais_cliente_id ON Animais(cliente_id);
CREATE INDEX idx_agendamentos_animal_id ON Agendamentos(animal_id);
CREATE INDEX idx_agendamentos_funcionario_id ON Agendamentos(funcionario_id);
CREATE INDEX idx_agendamentos_data_hora ON Agendamentos(data_hora_agendamento);
CREATE INDEX idx_agendamento_servicos_servico_id ON Agendamento_Servicos(servico_id);
CREATE INDEX idx_clientes_email ON Clientes(email);
CREATE INDEX idx_funcionarios_email ON Funcionarios(email);
