
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime

# Importações dos modelos Pydantic
from app.models.cliente import Cliente, ClienteCreate, ClienteUpdate
from app.models.animal import Animal, AnimalCreate, AnimalUpdate
from app.models.funcionario import Funcionario, FuncionarioCreate, FuncionarioUpdate
from app.models.servico import Servico, ServicoCreate, ServicoUpdate
from app.models.agendamento import Agendamento, AgendamentoCreate, AgendamentoUpdate, AgendamentoSimple

# Importações das funções CRUD
from app.crud import crud_cliente
from app.crud import crud_animal
from app.crud import crud_funcionario
from app.crud import crud_servico
from app.crud import crud_agendamento

app = FastAPI(
    title="API PetShop Agendamentos",
    description="API para gerenciar clientes, animais, funcionários, serviços e agendamentos de um pet shop.",
    version="0.1.0"
)

# Configuração do CORS
origins = [
    "http://localhost",         
    "http://localhost:3000",    
    "http://localhost:5173",    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  
)

# --- Endpoints para Clientes --- 

@app.post("/clientes/", response_model=Cliente, status_code=status.HTTP_201_CREATED, tags=["Clientes"])
def create_new_cliente(cliente: ClienteCreate):
    db_cliente = crud_cliente.get_cliente_by_email(email=cliente.email)
    if db_cliente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado")
    created_cliente = crud_cliente.create_cliente(cliente=cliente)
    if not created_cliente:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao criar cliente")
    return created_cliente

@app.get("/clientes/", response_model=List[Cliente], tags=["Clientes"])
def read_clientes(skip: int = 0, limit: int = 100):
    clientes = crud_cliente.get_clientes(skip=skip, limit=limit)
    return clientes

@app.get("/clientes/{cliente_id}", response_model=Cliente, tags=["Clientes"])
def read_cliente_by_id(cliente_id: int):
    db_cliente = crud_cliente.get_cliente_by_id(cliente_id=cliente_id)
    if db_cliente is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    return db_cliente

@app.put("/clientes/{cliente_id}", response_model=Cliente, tags=["Clientes"])
def update_existing_cliente(cliente_id: int, cliente: ClienteUpdate):
    db_cliente = crud_cliente.get_cliente_by_id(cliente_id=cliente_id)
    if db_cliente is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    if cliente.email and cliente.email != db_cliente.email:
        existing_email_cliente = crud_cliente.get_cliente_by_email(email=cliente.email)
        if existing_email_cliente and existing_email_cliente.cliente_id != cliente_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Novo email já cadastrado para outro cliente")
            
    updated_cliente = crud_cliente.update_cliente(cliente_id=cliente_id, cliente_update=cliente)
    if updated_cliente is None:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao atualizar cliente")
    return updated_cliente

@app.delete("/clientes/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Clientes"])
def delete_existing_cliente(cliente_id: int):
    db_cliente = crud_cliente.get_cliente_by_id(cliente_id=cliente_id)
    if db_cliente is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    deleted = crud_cliente.delete_cliente(cliente_id=cliente_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao deletar cliente")
    return 

# --- Endpoints para Animais --- 

@app.post("/animais/", response_model=Animal, status_code=status.HTTP_201_CREATED, tags=["Animais"])
def create_new_animal(animal: AnimalCreate):
    db_cliente = crud_cliente.get_cliente_by_id(cliente_id=animal.cliente_id)
    if not db_cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente com ID {animal.cliente_id} não encontrado")
    
    created_animal = crud_animal.create_animal(animal=animal)
    if not created_animal:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao criar animal")
    return created_animal

@app.get("/animais/", response_model=List[Animal], tags=["Animais"])
def read_animais(cliente_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    if cliente_id is not None:
        db_cliente = crud_cliente.get_cliente_by_id(cliente_id=cliente_id)
        if not db_cliente:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente com ID {cliente_id} não encontrado")
        animais = crud_animal.get_animais_by_cliente(cliente_id=cliente_id, skip=skip, limit=limit)
    else:
        animais = crud_animal.get_animais(skip=skip, limit=limit)
    return animais

@app.get("/animais/{animal_id}", response_model=Animal, tags=["Animais"])
def read_animal_by_id(animal_id: int):
    db_animal = crud_animal.get_animal_by_id(animal_id=animal_id)
    if db_animal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal não encontrado")
    return db_animal

@app.put("/animais/{animal_id}", response_model=Animal, tags=["Animais"])
def update_existing_animal(animal_id: int, animal: AnimalUpdate):
    db_animal = crud_animal.get_animal_by_id(animal_id=animal_id)
    if db_animal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal não encontrado")
    
    updated_animal = crud_animal.update_animal(animal_id=animal_id, animal_update=animal)
    if updated_animal is None:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao atualizar animal")
    return updated_animal

@app.delete("/animais/{animal_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Animais"])
def delete_existing_animal(animal_id: int):
    db_animal = crud_animal.get_animal_by_id(animal_id=animal_id)
    if db_animal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal não encontrado")
    deleted = crud_animal.delete_animal(animal_id=animal_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao deletar animal")
    return

# --- Endpoints para Funcionários --- 

@app.post("/funcionarios/", response_model=Funcionario, status_code=status.HTTP_201_CREATED, tags=["Funcionários"])
def create_new_funcionario(funcionario: FuncionarioCreate):
    if funcionario.email:
        db_funcionario = crud_funcionario.get_funcionario_by_email(email=funcionario.email)
        if db_funcionario:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado para outro funcionário")
            
    created_funcionario = crud_funcionario.create_funcionario(funcionario=funcionario)
    if not created_funcionario:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao criar funcionário")
    return created_funcionario


@app.get("/funcionarios/", response_model=List[Funcionario], tags=["Funcionários"])
def read_funcionarios(apenas_ativos: bool = False, skip: int = 0, limit: int = 100):
    funcionarios = crud_funcionario.get_funcionarios(skip=skip, limit=limit, apenas_ativos=apenas_ativos)
    return funcionarios

@app.get("/funcionarios/{funcionario_id}", response_model=Funcionario, tags=["Funcionários"])
def read_funcionario_by_id(funcionario_id: int):
    db_funcionario = crud_funcionario.get_funcionario_by_id(funcionario_id=funcionario_id)
    if db_funcionario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")
    return db_funcionario

@app.put("/funcionarios/{funcionario_id}", response_model=Funcionario, tags=["Funcionários"])
def update_existing_funcionario(funcionario_id: int, funcionario: FuncionarioUpdate):
    db_funcionario = crud_funcionario.get_funcionario_by_id(funcionario_id=funcionario_id)
    if db_funcionario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")

    if funcionario.email and funcionario.email != db_funcionario.email:
         existing_email_func = crud_funcionario.get_funcionario_by_email(email=funcionario.email)
         if existing_email_func and existing_email_func.funcionario_id != funcionario_id:
              raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Novo email já cadastrado para outro funcionário")

    updated_funcionario = crud_funcionario.update_funcionario(funcionario_id=funcionario_id, funcionario_update=funcionario)
    if updated_funcionario is None:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao atualizar funcionário")
    return updated_funcionario

@app.delete("/funcionarios/{funcionario_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Funcionários"])
def delete_existing_funcionario(funcionario_id: int):
    db_funcionario = crud_funcionario.get_funcionario_by_id(funcionario_id=funcionario_id)
    if db_funcionario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")
    deleted = crud_funcionario.delete_funcionario(funcionario_id=funcionario_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao deletar funcionário")
    return

# --- Endpoints para Serviços --- 

@app.post("/servicos/", response_model=Servico, status_code=status.HTTP_201_CREATED, tags=["Serviços"])
def create_new_servico(servico: ServicoCreate):
    db_servico = crud_servico.get_servico_by_nome(nome=servico.nome)
    if db_servico:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Serviço com este nome já existe")
        
    created_servico = crud_servico.create_servico(servico=servico)
    if not created_servico:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao criar serviço")
    return created_servico


@app.get("/servicos/", response_model=List[Servico], tags=["Serviços"])
def read_servicos(skip: int = 0, limit: int = 100):
    servicos = crud_servico.get_servicos(skip=skip, limit=limit)
    return servicos

@app.get("/servicos/{servico_id}", response_model=Servico, tags=["Serviços"])
def read_servico_by_id(servico_id: int):
    db_servico = crud_servico.get_servico_by_id(servico_id=servico_id)
    if db_servico is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado")
    return db_servico

@app.put("/servicos/{servico_id}", response_model=Servico, tags=["Serviços"])
def update_existing_servico(servico_id: int, servico: ServicoUpdate):
    db_servico = crud_servico.get_servico_by_id(servico_id=servico_id)
    if db_servico is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado")

    if servico.nome and servico.nome != db_servico.nome:
        existing_name_servico = crud_servico.get_servico_by_nome(nome=servico.nome)
        if existing_name_servico and existing_name_servico.servico_id != servico_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Outro serviço já existe com este nome")

    updated_servico = crud_servico.update_servico(servico_id=servico_id, servico_update=servico)
    if updated_servico is None:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao atualizar serviço")
    return updated_servico

@app.delete("/servicos/{servico_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Serviços"])
def delete_existing_servico(servico_id: int):
    db_servico = crud_servico.get_servico_by_id(servico_id=servico_id)
    if db_servico is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado")
    deleted = crud_servico.delete_servico(servico_id=servico_id)
    if not deleted:
        if crud_servico.get_servico_by_id(servico_id=servico_id):
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Serviço não pode ser deletado pois está associado a agendamentos")
        else:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao deletar serviço")
    return

# --- Endpoints para Agendamentos --- 

@app.post("/agendamentos/", response_model=Agendamento, status_code=status.HTTP_201_CREATED, tags=["Agendamentos"])
def create_new_agendamento(agendamento: AgendamentoCreate):
    if not crud_animal.get_animal_by_id(agendamento.animal_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Animal com ID {agendamento.animal_id} não encontrado")
    if agendamento.funcionario_id and not crud_funcionario.get_funcionario_by_id(agendamento.funcionario_id):
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Funcionário com ID {agendamento.funcionario_id} não encontrado")
    
    try:
        created_agendamento = crud_agendamento.create_agendamento(agendamento=agendamento)
        if not created_agendamento:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao criar agendamento. Verifique os IDs fornecidos.")
        return created_agendamento
    except ValueError as ve:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao criar agendamento")

@app.get("/agendamentos/", response_model=List[Agendamento], tags=["Agendamentos"])
def read_agendamentos(
    skip: int = 0, limit: int = 100,
    animal_id: Optional[int] = Query(None, description="Filtrar por ID do animal"),
    funcionario_id: Optional[int] = Query(None, description="Filtrar por ID do funcionário"),
    data_inicio: Optional[datetime] = Query(None, description="Data/hora inicial do período (ISO format)"),
    data_fim: Optional[datetime] = Query(None, description="Data/hora final do período (ISO format)"),
    status: Optional[str] = Query(None, description="Filtrar por status (Agendado, Confirmado, etc.)")
):
    agendamentos = crud_agendamento.get_agendamentos(
        skip=skip, limit=limit,
        animal_id=animal_id,
        funcionario_id=funcionario_id,
        data_inicio=data_inicio,
        data_fim=data_fim,
        status=status
    )
    return agendamentos
    return agendamentos

@app.get("/agendamentos/{agendamento_id}", response_model=Agendamento, tags=["Agendamentos"])
def read_agendamento_by_id(agendamento_id: int):
    db_agendamento = crud_agendamento.get_agendamento_by_id(agendamento_id=agendamento_id)
    if db_agendamento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado")
    return db_agendamento

@app.put("/agendamentos/{agendamento_id}", response_model=Agendamento, tags=["Agendamentos"])
def update_existing_agendamento(agendamento_id: int, agendamento: AgendamentoUpdate):
    db_agendamento = crud_agendamento.get_agendamento_by_id(agendamento_id=agendamento_id)
    if db_agendamento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado")

    if agendamento.animal_id and agendamento.animal_id != db_agendamento.animal_id:
         if not crud_animal.get_animal_by_id(agendamento.animal_id):
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Novo Animal com ID {agendamento.animal_id} não encontrado")
    if agendamento.funcionario_id and agendamento.funcionario_id != db_agendamento.funcionario_id:
         if not crud_funcionario.get_funcionario_by_id(agendamento.funcionario_id):
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Novo Funcionário com ID {agendamento.funcionario_id} não encontrado")

    try:
        updated_agendamento = crud_agendamento.update_agendamento(agendamento_id=agendamento_id, agendamento_update=agendamento)
        if updated_agendamento is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao atualizar agendamento. Verifique os IDs fornecidos.")
        return updated_agendamento
    except ValueError as ve:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
         # Log e
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno ao atualizar agendamento")

@app.delete("/agendamentos/{agendamento_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Agendamentos"])
def delete_existing_agendamento(agendamento_id: int):
    db_agendamento = crud_agendamento.get_agendamento_by_id(agendamento_id=agendamento_id)
    if db_agendamento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado")
    deleted = crud_agendamento.delete_agendamento(agendamento_id=agendamento_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao deletar agendamento")
    return

# --- Endpoint Raiz --- 

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Bem-vindo à API PetShop Agendamentos! Acesse /docs para a documentação interativa."}


# Exemplo para crud_funcionario.py:
def get_funcionario_by_email(email: str) -> Optional[Funcionario]:
    sql = "SELECT ... FROM Funcionarios WHERE email = %s;"

# Exemplo para crud_servico.py:
def get_servico_by_nome(nome: str) -> Optional[Servico]:
    sql = "SELECT ... FROM Servicos WHERE nome = %s;"

