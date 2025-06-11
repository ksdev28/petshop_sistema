import psycopg2
from typing import List, Optional

from app.db.database import get_db_cursor
from app.models.cliente import Cliente, ClienteCreate, ClienteUpdate


def create_cliente(cliente: ClienteCreate) -> Optional[Cliente]:
    """Cria um novo cliente no banco de dados usando SQL puro."""
    sql = """
        INSERT INTO Clientes (nome, telefone, email, endereco)
        VALUES (%s, %s, %s, %s)
        RETURNING cliente_id, nome, telefone, email, endereco, data_cadastro;
    """
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (cliente.nome, cliente.telefone, cliente.email, cliente.endereco))
            row = cursor.fetchone()
            if row:
                # Mapeia a tupla do banco para o modelo Pydantic
                return Cliente(
                    cliente_id=row[0],
                    nome=row[1],
                    telefone=row[2],
                    email=row[3],
                    endereco=row[4],
                    data_cadastro=row[5]
                )
    except psycopg2.Error as e:
        print(f"Erro ao criar cliente: {e}")
    except Exception as e:
        print(f"Erro inesperado ao criar cliente: {e}")
    return None

def get_cliente_by_id(cliente_id: int) -> Optional[Cliente]:
    """Busca um cliente pelo ID usando SQL puro."""
    sql = """
        SELECT cliente_id, nome, telefone, email, endereco, data_cadastro
        FROM Clientes
        WHERE cliente_id = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (cliente_id,))
            row = cursor.fetchone()
            if row:
                return Cliente(
                    cliente_id=row[0],
                    nome=row[1],
                    telefone=row[2],
                    email=row[3],
                    endereco=row[4],
                    data_cadastro=row[5]
                )
    except psycopg2.Error as e:
        print(f"Erro ao buscar cliente por ID: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar cliente por ID: {e}")
    return None

def get_cliente_by_email(email: str) -> Optional[Cliente]:
    """Busca um cliente pelo email usando SQL puro."""
    sql = """
        SELECT cliente_id, nome, telefone, email, endereco, data_cadastro
        FROM Clientes
        WHERE email = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (email,))
            row = cursor.fetchone()
            if row:
                return Cliente(
                    cliente_id=row[0],
                    nome=row[1],
                    telefone=row[2],
                    email=row[3],
                    endereco=row[4],
                    data_cadastro=row[5]
                )
    except psycopg2.Error as e:
        print(f"Erro ao buscar cliente por email: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar cliente por email: {e}")
    return None

def get_clientes(skip: int = 0, limit: int = 100) -> List[Cliente]:
    """Busca uma lista de clientes com paginação usando SQL puro."""
    sql = """
        SELECT cliente_id, nome, telefone, email, endereco, data_cadastro
        FROM Clientes
        ORDER BY nome
        LIMIT %s OFFSET %s;
    """
    clientes = []
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (limit, skip))
            rows = cursor.fetchall()
            for row in rows:
                clientes.append(Cliente(
                    cliente_id=row[0],
                    nome=row[1],
                    telefone=row[2],
                    email=row[3],
                    endereco=row[4],
                    data_cadastro=row[5]
                ))
    except psycopg2.Error as e:
        print(f"Erro ao buscar clientes: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar clientes: {e}")
    return clientes

def update_cliente(cliente_id: int, cliente_update: ClienteUpdate) -> Optional[Cliente]:
    """Atualiza um cliente existente usando SQL puro."""
    # Monta a query de update dinamicamente para atualizar apenas os campos fornecidos
    update_data = cliente_update.model_dump(exclude_unset=True) # Pega só os campos definidos
    if not update_data:
        # Se nada foi passado para atualizar, retorna o cliente atual sem fazer query
        return get_cliente_by_id(cliente_id)

    set_parts = []
    values = []
    for key, value in update_data.items():
        set_parts.append(f"{key} = %s")
        values.append(value)

    values.append(cliente_id) # Adiciona o ID para o WHERE

    sql = f"""
        UPDATE Clientes
        SET {', '.join(set_parts)}
        WHERE cliente_id = %s
        RETURNING cliente_id, nome, telefone, email, endereco, data_cadastro;
    """

    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, tuple(values))
            row = cursor.fetchone()
            if row:
                return Cliente(
                    cliente_id=row[0],
                    nome=row[1],
                    telefone=row[2],
                    email=row[3],
                    endereco=row[4],
                    data_cadastro=row[5]
                )
    except psycopg2.Error as e:
        print(f"Erro ao atualizar cliente: {e}")
    except Exception as e:
        print(f"Erro inesperado ao atualizar cliente: {e}")
    return None

def delete_cliente(cliente_id: int) -> bool:
    """Deleta um cliente pelo ID usando SQL puro."""
    sql = "DELETE FROM Clientes WHERE cliente_id = %s RETURNING cliente_id;"
    deleted_id = None
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (cliente_id,))
            result = cursor.fetchone()
            if result:
                deleted_id = result[0]
    except psycopg2.Error as e:
        print(f"Erro ao deletar cliente: {e}")
    except Exception as e:
        print(f"Erro inesperado ao deletar cliente: {e}")

    return deleted_id is not None

