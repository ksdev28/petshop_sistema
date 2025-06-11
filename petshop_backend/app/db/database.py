import psycopg2
import os
from contextlib import contextmanager

# --- CONFIGURAR CONEXÃO COM BANCO ---

DB_HOST = "localhost"
DB_PORT = "5434"    # ALTERE PARA A SUA PORTA PADRÃO, NÃO SEI PQ O MEU POSTGRES RODA NESSA '5434'  
DB_NAME = "petshop"
DB_USER = "postgres"
DB_PASSWORD = "root"

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

@contextmanager
def get_db_connection():
    """Fornece uma conexão gerenciada com o banco de dados PostgreSQL."""
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        yield conn
        conn.commit()
    except psycopg2.Error as e:
        print(f"Erro de conexão com o banco de dados: {e}")
        if conn:
            conn.rollback()

        raise
    finally:
        if conn:
            conn.close()

@contextmanager
def get_db_cursor(commit=False):
    """Fornece um cursor gerenciado e opcionalmente faz commit."""
    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        yield cursor
        if commit:
            conn.commit()
    except psycopg2.Error as e:
        print(f"Erro no banco de dados: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

#TESTAR CONEXÃO COM O BANCO
def test_connection():
    """Testa a conexão com o banco de dados."""
    try:
        with get_db_connection() as conn:
            print("Conexão com o banco de dados estabelecida com sucesso!")
            print(f"PostgreSQL Database Version: {conn.server_version}")
        return True
    except Exception as e:
        print(f"Falha ao conectar ao banco de dados: {e}")
        return False

# Se executar este script diretamente, testa a conexão
if __name__ == "__main__":
    print("Testando a conexão com o banco de dados...")
    print("Banco de dados pronto. Lembre-se de configurar seu PostgreSQL.")

