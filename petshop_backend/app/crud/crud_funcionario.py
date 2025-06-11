import psycopg2
from typing import List, Optional

from app.db.database import get_db_cursor
from app.models.funcionario import Funcionario, FuncionarioCreate, FuncionarioUpdate

def create_funcionario(funcionario: FuncionarioCreate) -> Optional[Funcionario]:
    """Cria um novo funcionário no banco de dados usando SQL puro."""
    sql = """
        INSERT INTO Funcionarios (nome, cargo, telefone, email, data_contratacao, ativo)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING funcionario_id, nome, cargo, telefone, email, data_contratacao, ativo;
    """
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (
                funcionario.nome,
                funcionario.cargo,
                funcionario.telefone,
                funcionario.email,
                funcionario.data_contratacao,
                funcionario.ativo
            ))
            row = cursor.fetchone()
            if row:
                return Funcionario(
                    funcionario_id=row[0],
                    nome=row[1],
                    cargo=row[2],
                    telefone=row[3],
                    email=row[4],
                    data_contratacao=row[5],
                    ativo=row[6]
                )
    except psycopg2.Error as e:
        if e.pgcode == '23505':
            print(f"Erro ao criar funcionário: Email '{funcionario.email}' já existe.")
        else:
            print(f"Erro de banco de dados ao criar funcionário: {e}")
    except Exception as e:
        print(f"Erro inesperado ao criar funcionário: {e}")
    return None

def get_funcionario_by_id(funcionario_id: int) -> Optional[Funcionario]:
    """Busca um funcionário pelo ID usando SQL puro."""
    sql = """
        SELECT funcionario_id, nome, cargo, telefone, email, data_contratacao, ativo
        FROM Funcionarios
        WHERE funcionario_id = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (funcionario_id,))
            row = cursor.fetchone()
            if row:
                return Funcionario(
                    funcionario_id=row[0],
                    nome=row[1],
                    cargo=row[2],
                    telefone=row[3],
                    email=row[4],
                    data_contratacao=row[5],
                    ativo=row[6]
                )
    except psycopg2.Error as e:
        print(f"Erro ao buscar funcionário por ID: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar funcionário por ID: {e}")
    return None

def get_funcionario_by_email(email: str) -> Optional[Funcionario]:
    """Busca um funcionário pelo e-mail usando SQL puro."""
    sql = """
        SELECT funcionario_id, nome, cargo, telefone, email, data_contratacao, ativo
        FROM Funcionarios
        WHERE email = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (email,))
            row = cursor.fetchone()
            if row:
                return Funcionario(
                    funcionario_id=row[0],
                    nome=row[1],
                    cargo=row[2],
                    telefone=row[3],
                    email=row[4],
                    data_contratacao=row[5],
                    ativo=row[6]
                )
    except psycopg2.Error as e:
        print(f"Erro ao buscar funcionário por e-mail: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar funcionário por e-mail: {e}")
    return None

def get_funcionarios(skip: int = 0, limit: int = 100, apenas_ativos: bool = False) -> List[Funcionario]:
    """Busca uma lista de funcionários com paginação e filtro opcional de ativos."""
    sql_base = """
        SELECT funcionario_id, nome, cargo, telefone, email, data_contratacao, ativo
        FROM Funcionarios
    """
    conditions = []
    params = []

    if apenas_ativos:
        conditions.append("ativo = %s")
        params.append(True)

    if conditions:
        sql_base += " WHERE " + " AND ".join(conditions)

    sql_final = sql_base + " ORDER BY nome LIMIT %s OFFSET %s;"
    params.extend([limit, skip])

    funcionarios = []
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql_final, tuple(params))
            rows = cursor.fetchall()
            for row in rows:
                funcionarios.append(Funcionario(
                    funcionario_id=row[0],
                    nome=row[1],
                    cargo=row[2],
                    telefone=row[3],
                    email=row[4],
                    data_contratacao=row[5],
                    ativo=row[6]
                ))
    except psycopg2.Error as e:
        print(f"Erro ao buscar funcionários: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar funcionários: {e}")
    return funcionarios

def update_funcionario(funcionario_id: int, funcionario_update: FuncionarioUpdate) -> Optional[Funcionario]:
    """Atualiza um funcionário existente usando SQL puro."""
    update_data = funcionario_update.model_dump(exclude_unset=True)
    if not update_data:
        return get_funcionario_by_id(funcionario_id)

    set_parts = []
    values = []
    for key, value in update_data.items():
        set_parts.append(f"{key} = %s")
        values.append(value)

    values.append(funcionario_id)

    sql = f"""
        UPDATE Funcionarios
        SET {", ".join(set_parts)}
        WHERE funcionario_id = %s
        RETURNING funcionario_id, nome, cargo, telefone, email, data_contratacao, ativo;
    """

    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, tuple(values))
            row = cursor.fetchone()
            if row:
                return Funcionario(
                    funcionario_id=row[0],
                    nome=row[1],
                    cargo=row[2],
                    telefone=row[3],
                    email=row[4],
                    data_contratacao=row[5],
                    ativo=row[6]
                )
    except psycopg2.Error as e:
        if e.pgcode == '23505': 
            print(f"Erro ao atualizar funcionário: Email '{funcionario_update.email}' já pertence a outro funcionário.")
        else:
            print(f"Erro ao atualizar funcionário: {e}")
    except Exception as e:
        print(f"Erro inesperado ao atualizar funcionário: {e}")
    return None

def delete_funcionario(funcionario_id: int) -> bool:
    """Deleta (ou marca como inativo) um funcionário pelo ID usando SQL puro."""
    sql = "DELETE FROM Funcionarios WHERE funcionario_id = %s RETURNING funcionario_id;"

    deleted_id = None
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (funcionario_id,))
            result = cursor.fetchone()
            if result:
                deleted_id = result[0]
                print(f"Funcionário ID {deleted_id} deletado com sucesso.")
            else:
                print(f"Funcionário ID {funcionario_id} não encontrado para deleção.")
    except psycopg2.Error as e:
        print(f"Erro ao deletar funcionário: {e}")
    except Exception as e:
        print(f"Erro inesperado ao deletar funcionário: {e}")

    return deleted_id is not None