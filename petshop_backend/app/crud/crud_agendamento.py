import psycopg2
from typing import List, Optional, Tuple
from decimal import Decimal
from datetime import datetime

from app.db.database import get_db_cursor
from app.models.agendamento import Agendamento, AgendamentoCreate, AgendamentoUpdate, AgendamentoServicoDetalhe, AgendamentoSimple
from app.models.servico import Servico
from app.crud.crud_servico import get_servico_by_id

# --- Funções Auxiliares ---

def _fetch_servicos_details(cursor, servico_ids: List[int]) -> List[Tuple[int, Decimal]]:
    """Busca ID e preço atual dos serviços fornecidos."""
    if not servico_ids:
        return []
    placeholders = ",".join(["%s"] * len(servico_ids))
    sql = f"SELECT servico_id, preco FROM Servicos WHERE servico_id IN ({placeholders});"
    cursor.execute(sql, tuple(servico_ids))
    results = cursor.fetchall()
    if len(results) != len(servico_ids):
        found_ids = {row[0] for row in results}
        missing_ids = set(servico_ids) - found_ids
        raise ValueError(f"Serviços com IDs {missing_ids} não encontrados.")
    return [(row[0], Decimal(row[1])) for row in results]

def _insert_agendamento_servicos(cursor, agendamento_id: int, servicos_com_preco: List[Tuple[int, Decimal]]):
    """Insere os registros na tabela de junção Agendamento_Servicos."""
    if not servicos_com_preco:
        return
    sql_insert_servicos = """
        INSERT INTO Agendamento_Servicos (agendamento_id, servico_id, preco_registrado)
        VALUES (%s, %s, %s);
    """
    values_to_insert = [(agendamento_id, servico_id, preco) for servico_id, preco in servicos_com_preco]
    cursor.executemany(sql_insert_servicos, values_to_insert)

def _get_servicos_for_agendamento(cursor, agendamento_id: int) -> List[AgendamentoServicoDetalhe]:
    """Busca os detalhes dos serviços associados a um agendamento."""
    sql = """
        SELECT ags.servico_id, s.nome, ags.preco_registrado, ags.observacoes
        FROM Agendamento_Servicos ags
        JOIN Servicos s ON ags.servico_id = s.servico_id
        WHERE ags.agendamento_id = %s;
    """
    cursor.execute(sql, (agendamento_id,))
    rows = cursor.fetchall()
    return [
        AgendamentoServicoDetalhe(
            servico_id=row[0],
            nome_servico=row[1],
            preco_registrado=Decimal(row[2]),
            observacoes=row[3]
        )
        for row in rows
    ]

# --- Funções CRUD Principais ---

def create_agendamento(agendamento: AgendamentoCreate) -> Optional[Agendamento]:
    """Cria um novo agendamento e associa os serviços usando SQL puro e transação."""
    new_agendamento_id = None
    try:
        with get_db_cursor(commit=True) as cursor:
            servicos_com_preco = _fetch_servicos_details(cursor, agendamento.servicos_ids)
            sql_insert_agendamento = """
                INSERT INTO Agendamentos (animal_id, funcionario_id, data_hora_agendamento, status, observacoes)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING agendamento_id, data_hora_criacao;
            """
            cursor.execute(sql_insert_agendamento, (
                agendamento.animal_id,
                agendamento.funcionario_id,
                agendamento.data_hora_agendamento,
                agendamento.status,
                agendamento.observacoes
            ))
            result = cursor.fetchone()
            if not result:
                raise Exception("Falha ao criar agendamento, não retornou ID.")
            new_agendamento_id, data_hora_criacao = result
            _insert_agendamento_servicos(cursor, new_agendamento_id, servicos_com_preco)
            servicos_detalhes = _get_servicos_for_agendamento(cursor, new_agendamento_id)

        return Agendamento(
            agendamento_id=new_agendamento_id,
            animal_id=agendamento.animal_id,
            funcionario_id=agendamento.funcionario_id,
            data_hora_agendamento=agendamento.data_hora_agendamento,
            data_hora_criacao=data_hora_criacao,
            status=agendamento.status,
            observacoes=agendamento.observacoes,
            servicos=servicos_detalhes
        )

    except (psycopg2.Error, ValueError, Exception) as e:
        print(f"Erro ao criar agendamento: {e}")
        if isinstance(e, psycopg2.Error) and e.pgcode == '23503':
            print(f"Verifique se o animal_id ({agendamento.animal_id}) ou funcionario_id ({agendamento.funcionario_id}) existem.")
        elif isinstance(e, ValueError):
            print(f"Erro de dados: {e}")
    return None

def get_agendamento_by_id(agendamento_id: int) -> Optional[Agendamento]:
    """Busca um agendamento completo pelo ID usando SQL puro."""
    sql_agendamento = """
        SELECT agendamento_id, animal_id, funcionario_id, data_hora_agendamento, data_hora_criacao, status, observacoes
        FROM Agendamentos
        WHERE agendamento_id = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql_agendamento, (agendamento_id,))
            row_agendamento = cursor.fetchone()
            if not row_agendamento:
                return None

            servicos_detalhes = _get_servicos_for_agendamento(cursor, agendamento_id)

            return Agendamento(
                agendamento_id=row_agendamento[0],
                animal_id=row_agendamento[1],
                funcionario_id=row_agendamento[2],
                data_hora_agendamento=row_agendamento[3],
                data_hora_criacao=row_agendamento[4],
                status=row_agendamento[5],
                observacoes=row_agendamento[6],
                servicos=servicos_detalhes
            )

    except psycopg2.Error as e:
        print(f"Erro ao buscar agendamento por ID: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar agendamento por ID: {e}")
    return None

def get_agendamentos(
    skip: int = 0, limit: int = 100,
    animal_id: Optional[int] = None,
    funcionario_id: Optional[int] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    status: Optional[str] = None
) -> List[Agendamento]:
    """Busca agendamentos com filtros e paginação, incluindo nomes, valor total e serviços."""
    sql_base = """
        SELECT 
            a.agendamento_id,
            a.animal_id,
            a.funcionario_id,
            a.data_hora_agendamento,
            a.data_hora_criacao,
            a.status,
            a.observacoes,
            ani.nome AS animal_nome,
            c.nome AS cliente_nome,
            COALESCE(f.nome, '') AS funcionario_nome,
            COALESCE((
                SELECT SUM(ags.preco_registrado)
                FROM Agendamento_Servicos ags
                WHERE ags.agendamento_id = a.agendamento_id
            ), 0) AS valor_total
        FROM Agendamentos a
        JOIN Animais ani ON a.animal_id = ani.animal_id
        JOIN Clientes c ON ani.cliente_id = c.cliente_id
        LEFT JOIN Funcionarios f ON a.funcionario_id = f.funcionario_id
    """
    conditions = []
    params = []

    if animal_id is not None:
        conditions.append("a.animal_id = %s")
        params.append(animal_id)
    if funcionario_id is not None:
        conditions.append("a.funcionario_id = %s")
        params.append(funcionario_id)
    if data_inicio is not None:
        conditions.append("a.data_hora_agendamento >= %s")
        params.append(data_inicio)
    if data_fim is not None:
        conditions.append("a.data_hora_agendamento <= %s")
        params.append(data_fim)
    if status is not None:
        conditions.append("a.status = %s")
        params.append(status)

    if conditions:
        sql_base += " WHERE " + " AND ".join(conditions)

    sql_final = sql_base + " ORDER BY a.data_hora_agendamento DESC LIMIT %s OFFSET %s;"
    params.extend([limit, skip])

    agendamentos = []
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql_final, tuple(params))
            rows = cursor.fetchall()
            for row in rows:
                servicos_detalhes = _get_servicos_for_agendamento(cursor, row[0])
                agendamentos.append(Agendamento(
                    agendamento_id=row[0],
                    animal_id=row[1],
                    funcionario_id=row[2],
                    data_hora_agendamento=row[3],
                    data_hora_criacao=row[4],
                    status=row[5],
                    observacoes=row[6],
                    animal_nome=row[7] or None,
                    cliente_nome=row[8] or None,
                    funcionario_nome=row[9] or None,
                    valor_total=Decimal(row[10]) if row[10] is not None else None,
                    servicos=servicos_detalhes
                ))
    except psycopg2.Error as e:
        print(f"Erro ao buscar agendamentos: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar agendamentos: {e}")
    return agendamentos

def update_agendamento(agendamento_id: int, agendamento_update: AgendamentoUpdate) -> Optional[Agendamento]:
    """Atualiza um agendamento existente, incluindo a lista de serviços (se fornecida)."""
    update_data = agendamento_update.model_dump(exclude_unset=True, exclude={'servicos_ids'})
    servicos_ids_to_update = agendamento_update.servicos_ids

    if not update_data and servicos_ids_to_update is None:
        return get_agendamento_by_id(agendamento_id)

    try:
        with get_db_cursor(commit=True) as cursor:
            if update_data:
                set_parts = []
                values = []
                for key, value in update_data.items():
                    set_parts.append(f"{key} = %s")
                    values.append(value)
                values.append(agendamento_id)
                sql_update = f"""
                    UPDATE Agendamentos
                    SET {", ".join(set_parts)}
                    WHERE agendamento_id = %s;
                """
                cursor.execute(sql_update, tuple(values))
                if cursor.rowcount == 0:
                    raise ValueError(f"Agendamento com ID {agendamento_id} não encontrado para atualização.")

            if servicos_ids_to_update is not None:
                if not servicos_ids_to_update:
                    raise ValueError("Um agendamento deve ter pelo menos um serviço.")

                servicos_com_preco = _fetch_servicos_details(cursor, servicos_ids_to_update)
                sql_delete_old_servicos = "DELETE FROM Agendamento_Servicos WHERE agendamento_id = %s;"
                cursor.execute(sql_delete_old_servicos, (agendamento_id,))
                _insert_agendamento_servicos(cursor, agendamento_id, servicos_com_preco)

        return get_agendamento_by_id(agendamento_id)

    except (psycopg2.Error, ValueError, Exception) as e:
        print(f"Erro ao atualizar agendamento ID {agendamento_id}: {e}")
        if isinstance(e, psycopg2.Error) and e.pgcode == '23503':
            print(f"Verifique se o animal_id ou funcionario_id existem.")
        elif isinstance(e, ValueError):
            print(f"Erro de dados: {e}")
    return None

def delete_agendamento(agendamento_id: int) -> bool:
    """Deleta um agendamento pelo ID usando SQL puro."""
    sql = "DELETE FROM Agendamentos WHERE agendamento_id = %s RETURNING agendamento_id;"
    deleted_id = None
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (agendamento_id,))
            result = cursor.fetchone()
            if result:
                deleted_id = result[0]
                print(f"Agendamento ID {deleted_id} deletado com sucesso.")
            else:
                print(f"Agendamento ID {agendamento_id} não encontrado para deleção.")

    except psycopg2.Error as e:
        print(f"Erro ao deletar agendamento: {e}")
    except Exception as e:
        print(f"Erro inesperado ao deletar agendamento: {e}")

    return deleted_id is not None