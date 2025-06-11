import psycopg2
from typing import List, Optional

from app.db.database import get_db_cursor
from app.models.animal import Animal, AnimalCreate, AnimalUpdate


def create_animal(animal: AnimalCreate) -> Optional[Animal]:
    """Cria um novo animal no banco de dados usando SQL puro."""
    sql = """
        INSERT INTO Animais (cliente_id, nome, especie, raca, data_nascimento, observacoes)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING animal_id, cliente_id, nome, especie, raca, data_nascimento, observacoes;
    """
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (
                animal.cliente_id,
                animal.nome,
                animal.especie,
                animal.raca,
                animal.data_nascimento,
                animal.observacoes
            ))
            row = cursor.fetchone()
            if row:
                return Animal(
                    animal_id=row[0],
                    cliente_id=row[1],
                    nome=row[2],
                    especie=row[3],
                    raca=row[4],
                    data_nascimento=row[5],
                    observacoes=row[6]
                )
    except psycopg2.Error as e:
        if e.pgcode == '23503': 
             print(f"Erro ao criar animal: Cliente com ID {animal.cliente_id} não existe.")
        else:
            print(f"Erro de banco de dados ao criar animal: {e}")
    except Exception as e:
        print(f"Erro inesperado ao criar animal: {e}")
    return None

def get_animal_by_id(animal_id: int) -> Optional[Animal]:
    """Busca um animal pelo ID usando SQL puro."""
    sql = """
        SELECT animal_id, cliente_id, nome, especie, raca, data_nascimento, observacoes
        FROM Animais
        WHERE animal_id = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (animal_id,))
            row = cursor.fetchone()
            if row:
                return Animal(
                    animal_id=row[0],
                    cliente_id=row[1],
                    nome=row[2],
                    especie=row[3],
                    raca=row[4],
                    data_nascimento=row[5],
                    observacoes=row[6]
                )
    except psycopg2.Error as e:
        print(f"Erro ao buscar animal por ID: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar animal por ID: {e}")
    return None

def get_animais_by_cliente(cliente_id: int, skip: int = 0, limit: int = 100) -> List[Animal]:
    """Busca animais pertencentes a um cliente específico com paginação."""
    sql = """
        SELECT animal_id, cliente_id, nome, especie, raca, data_nascimento, observacoes
        FROM Animais
        WHERE cliente_id = %s
        ORDER BY nome
        LIMIT %s OFFSET %s;
    """
    animais = []
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (cliente_id, limit, skip))
            rows = cursor.fetchall()
            for row in rows:
                animais.append(Animal(
                    animal_id=row[0],
                    cliente_id=row[1],
                    nome=row[2],
                    especie=row[3],
                    raca=row[4],
                    data_nascimento=row[5],
                    observacoes=row[6]
                ))
    except psycopg2.Error as e:
        print(f"Erro ao buscar animais por cliente: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar animais por cliente: {e}")
    return animais

def get_animais(skip: int = 0, limit: int = 100) -> List[Animal]:
    """Busca uma lista de todos os animais com paginação."""
    sql = """
        SELECT animal_id, cliente_id, nome, especie, raca, data_nascimento, observacoes
        FROM Animais
        ORDER BY nome
        LIMIT %s OFFSET %s;
    """
    animais = []
    try:
        with get_db_cursor() as cursor:
            cursor.execute(sql, (limit, skip))
            rows = cursor.fetchall()
            for row in rows:
                animais.append(Animal(
                    animal_id=row[0],
                    cliente_id=row[1],
                    nome=row[2],
                    especie=row[3],
                    raca=row[4],
                    data_nascimento=row[5],
                    observacoes=row[6]
                ))
    except psycopg2.Error as e:
        print(f"Erro ao buscar todos os animais: {e}")
    except Exception as e:
        print(f"Erro inesperado ao buscar todos os animais: {e}")
    return animais

def update_animal(animal_id: int, animal_update: AnimalUpdate) -> Optional[Animal]:
    """Atualiza um animal existente usando SQL puro."""
    update_data = animal_update.model_dump(exclude_unset=True)
    if not update_data:
        return get_animal_by_id(animal_id)

    set_parts = []
    values = []
    for key, value in update_data.items():
        set_parts.append(f"{key} = %s")
        values.append(value)

    values.append(animal_id)

    sql = f"""
        UPDATE Animais
        SET {", ".join(set_parts)}
        WHERE animal_id = %s
        RETURNING animal_id, cliente_id, nome, especie, raca, data_nascimento, observacoes;
    """

    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, tuple(values))
            row = cursor.fetchone()
            if row:
                return Animal(
                    animal_id=row[0],
                    cliente_id=row[1],
                    nome=row[2],
                    especie=row[3],
                    raca=row[4],
                    data_nascimento=row[5],
                    observacoes=row[6]
                )
    except psycopg2.Error as e:
        print(f"Erro ao atualizar animal: {e}")
    except Exception as e:
        print(f"Erro inesperado ao atualizar animal: {e}")
    return None

def delete_animal(animal_id: int) -> bool:
    """Deleta um animal pelo ID usando SQL puro."""
    # AGENDAMENTOS ASSOCIADOS SERÃO REMOVIDOS
    sql = "DELETE FROM Animais WHERE animal_id = %s RETURNING animal_id;"
    deleted_id = None
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(sql, (animal_id,))
            result = cursor.fetchone()
            if result:
                deleted_id = result[0]
    except psycopg2.Error as e:
        print(f"Erro ao deletar animal: {e}")
    except Exception as e:
        print(f"Erro inesperado ao deletar animal: {e}")

    return deleted_id is not None

