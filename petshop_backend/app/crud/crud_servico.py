import psycopg2
from typing import List, Optional
from decimal import Decimal

from app.db.database import get_db_cursor
from app.models.servico import Servico, ServicoCreate, ServicoUpdate

def create_servico(servico: ServicoCreate) -> Optional[Servico]:
    """Cria um novo serviço no banco de dados usando SQL puro."""
    sql = """
        INSERT INTO Servicos (nome, descricao, preco, duracao_estimada_minutos)
        VALUES (%s, %s, %s, %s)
        RETURNING servico_id, nome, descricao, preco, duracao_estimada_minutos;
    """
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (
                servico.nome,
                servico.descricao,
                servico.preco,
                servico.duracao_estimada_minutos
            ))
            row = cursor.fetchone()
            if row:
                return Servico(
                    servico_id=row[0],
                    nome=row[1],
                    descricao=row[2],
                    preco=Decimal(row[3]),
                    duracao_estimada_minutos=row[4]
                )
    except psycopg2.Error as e:
        if e.pgcode == '23505':  
            print(f"Erro ao criar serviço: Nome '{servico.nome}' já existe.")
        elif e.pgcode == '23514': 
            print(f"Erro ao criar serviço: Verifique se o preço é >= 0 e a duração > 0.")
        else:
            print(f"Erro de banco de dados ao criar serviço: {e}")
    except Exception as e:
        print(f"Erro inesperado ao criar serviço: {e}")
    return None

def get_servico_by_id(servico_id: int) -> Optional[Servico]:
    """Busca um serviço pelo ID usando SQL puro."""
    sql = """
        SELECT servico_id, nome, descricao, preco, duracao_estimada_minutos
        FROM Servicos
        WHERE servico_id = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (servico_id,))
            row = cursor.fetchone()
            if row:
                return Servico(
                    servico_id=row[0],
                    nome=row[1],
                    descricao=row[2],
                    preco=Decimal(row[3]),
                    duracao_estimada_minutos=row[4]
                )
    except psycopg2.Error as e:
        print(f"Erro ao buscar serviço por ID: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar serviço por ID: {e}")
    return None

def get_servico_by_nome(nome: str) -> Optional[Servico]:
    """Busca um serviço pelo nome usando SQL puro."""
    sql = """
        SELECT servico_id, nome, descricao, preco, duracao_estimada_minutos
        FROM Servicos
        WHERE nome = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (nome,))
            row = cursor.fetchone()
            if row:
                return Servico(
                    servico_id=row[0],
                    nome=row[1],
                    descricao=row[2],
                    preco=Decimal(row[3]),
                    duracao_estimada_minutos=row[4]
                )
    except psycopg2.Error as e:
        print(f"Erro ao buscar serviço por nome: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar serviço por nome: {e}")
    return None

def get_servicos(skip: int = 0, limit: int = 100) -> List[Servico]:
    """Busca uma lista de serviços com paginação usando SQL puro."""
    sql = """
        SELECT servico_id, nome, descricao, preco, duracao_estimada_minutos
        FROM Servicos
        ORDER BY nome
        LIMIT %s OFFSET %s;
    """
    servicos = []
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (limit, skip))
            rows = cursor.fetchall()
            for row in rows:
                servicos.append(Servico(
                    servico_id=row[0],
                    nome=row[1],
                    descricao=row[2],
                    preco=Decimal(row[3]),
                    duracao_estimada_minutos=row[4]
                ))
    except psycopg2.Error as e:
        print(f"Erro ao buscar serviços: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar serviços: {e}")
    return servicos

def update_servico(servico_id: int, servico_update: ServicoUpdate) -> Optional[Servico]:
    """Atualiza um serviço existente usando SQL puro."""
    update_data = servico_update.model_dump(exclude_unset=True)
    if not update_data:
        return get_servico_by_id(servico_id)

    set_parts = []
    values = []
    for key, value in update_data.items():
        set_parts.append(f"{key} = %s")
        values.append(value)

    values.append(servico_id)

    sql = f"""
        UPDATE Servicos
        SET {", ".join(set_parts)}
        WHERE servico_id = %s
        RETURNING servico_id, nome, descricao, preco, duracao_estimada_minutos;
    """

    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, tuple(values))
            row = cursor.fetchone()
            if row:
                return Servico(
                    servico_id=row[0],
                    nome=row[1],
                    descricao=row[2],
                    preco=Decimal(row[3]),
                    duracao_estimada_minutos=row[4]
                )
    except psycopg2.Error as e:
        if e.pgcode == '23505':  
            print(f"Erro ao atualizar serviço: Nome '{servico_update.nome}' já existe.")
        elif e.pgcode == '23514':  
            print(f"Erro ao atualizar serviço: Verifique se o preço é >= 0 e a duração > 0.")
        else:
            print(f"Erro ao atualizar serviço: {e}")
    except Exception as e:
        print(f"Erro inesperado ao atualizar serviço: {e}")
    return None

def delete_servico(servico_id: int) -> bool:
    """Deleta um serviço pelo ID usando SQL puro."""
    sql = "DELETE FROM Servicos WHERE servico_id = %s RETURNING servico_id;"
    deleted_id = None
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (servico_id,))
            result = cursor.fetchone()
            if result:
                deleted_id = result[0]
                print(f"Serviço ID {deleted_id} deletado com sucesso.")
            else:
                print(f"Serviço ID {servico_id} não encontrado para deleção.")
    except psycopg2.Error as e:
        if e.pgcode == '23503':
            print(f"Erro ao deletar serviço ID {servico_id}: Serviço está associado a um ou mais agendamentos. Remova as associações primeiro.")
        else:
            print(f"Erro ao deletar serviço: {e}")
    except Exception as e:
        print(f"Erro inesperado ao deletar serviço: {e}")
    return deleted_id is not None