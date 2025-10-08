import csv
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

def connect_to_database():
    """Estabelece conexão com o banco de dados MySQL"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', 3306),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME', 'protestos_db')
        )
        if connection.is_connected():
            print("Conectado ao banco de dados MySQL")
            return connection
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None

def create_cliente(connection, nome, cpf_cnpj, tipo_conta, cidade):
    """Insere ou retorna um cliente existente"""
    cursor = connection.cursor()
    
    # Verifica se o cliente já existe
    cursor.execute("SELECT id FROM clientes WHERE cpf_cnpj = %s", (cpf_cnpj,))
    result = cursor.fetchone()
    
    if result:
        # Cliente já existe, retorna o ID
        return result[0]
    else:
        # Insere novo cliente
        insert_cliente = """
        INSERT INTO clientes (nome, cpf_cnpj, tipo_conta, cidade)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(insert_cliente, (nome, cpf_cnpj, tipo_conta, cidade))
        connection.commit()
        return cursor.lastrowid

def create_contrato(connection, cliente_id, numero_contrato_sisbr, numero_contrato_legado, especie, ponto_atendimento):
    """Insere ou retorna um contrato existente"""
    cursor = connection.cursor()
    
    # Tenta encontrar um contrato existente baseado no número (priorizando o sisbr)
    if numero_contrato_sisbr:
        cursor.execute("SELECT id FROM contratos WHERE numero_contrato_sisbr = %s", (numero_contrato_sisbr,))
    else:
        cursor.execute("SELECT id FROM contratos WHERE cliente_id = %s AND numero_contrato_legado = %s", 
                      (cliente_id, numero_contrato_legado))
    
    result = cursor.fetchone()
    
    if result:
        # Contrato já existe, retorna o ID
        return result[0]
    else:
        # Insere novo contrato
        insert_contrato = """
        INSERT INTO contratos (cliente_id, numero_contrato_sisbr, numero_contrato_legado, especie, ponto_atendimento)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_contrato, (cliente_id, numero_contrato_sisbr, numero_contrato_legado, especie, ponto_atendimento))
        connection.commit()
        return cursor.lastrowid

def create_avalista(connection, nome, cpf_cnpj, protesto_id):
    """Insere um avalista"""
    cursor = connection.cursor()
    
    insert_avalista = """
    INSERT INTO avalistas (nome, cpf_cnpj, protesto_id)
    VALUES (%s, %s, %s)
    """
    cursor.execute(insert_avalista, (nome, cpf_cnpj, protesto_id))
    connection.commit()
    return cursor.lastrowid

def create_protesto(connection, valores):
    """Insere um protesto"""
    cursor = connection.cursor()
    
    insert_protesto = """
    INSERT INTO protestos (valor_protestado, numero_parcela, data_registro, protocolo, 
                          status, situacao, data_baixa_cartorio, contrato_id)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_protesto, valores)
    connection.commit()
    return cursor.lastrowid

def parse_date(date_str):
    """Converte string de data para formato YYYY-MM-DD"""
    if not date_str or date_str.isspace():
        return None
    try:
        # Tenta formatar DD/MM/AAAA para AAAA-MM-DD
        day, month, year = date_str.split('/')
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    except:
        return None

def import_csv_to_database(csv_file_path):
    """Importa dados do CSV para o banco de dados"""
    connection = connect_to_database()
    if not connection:
        print("Falha na conexão com o banco de dados. Importação cancelada.")
        return

    try:
        with open(csv_file_path, encoding='utf-8', newline='') as csvfile:
            # O CSV usa ponto e vírgula como delimitador
            reader = csv.DictReader(csvfile, delimiter=';')
            
            # Contador para acompanhar o progresso
            row_count = 0
            successful_imports = 0
            
            for row in reader:
                try:
                    # Processa os dados da linha
                    devedor_nome = row['DEVEDOR'].strip()
                    avalista_nome = row['AVALISTA'].strip() if row['AVALISTA'] else None
                    valor_protestado_str = row['VALOR PROTESTADO'].replace(',', '.')
                    try:
                        valor_protestado = float(valor_protestado_str)
                    except:
                        print(f"Valor inválido: {valor_protestado_str}")
                        continue
                        
                    numero_parcela = row['NUMERO DA PARCELA'].strip() if row['NUMERO DA PARCELA'] else None
                    data_registro = parse_date(row['DATA REGISTRO'])
                    ponto_atendimento = row['PONTO ATENDIMENTO'].strip() if row['PONTO ATENDIMENTO'] else None
                    contrato_sisbr = row['CONTRATO SISBR'].strip() if row['CONTRATO SISBR'] else None
                    contrato_legado = row['NUMERO CONTRATO LEGADO'].strip() if row['NUMERO CONTRATO LEGADO'] else None
                    especie = row['ESPECIE'].strip() if row['ESPECIE'] else None
                    cidade = row['CIDADE'].strip() if row['CIDADE'] else None
                    protocolo = row['PROTOCOLO'].strip() if row['PROTOCOLO'] else None
                    status = row['STATUS'].strip() if row['STATUS'] else 'PROTESTADO'
                    tipo_conta = row['TIPO DE CONTA'].strip() if row['TIPO DE CONTA'] else None
                    cpf_cnpj = row['CPFCNPJ'].strip() if row['CPFCNPJ'] else None
                    situacao = row['SITUACAO'].strip() if row['SITUACAO'] else None
                    data_baixa_cartorio = parse_date(row['DATA DA BAIXA CARTORIO']) if row['DATA DA BAIXA CARTORIO'] else None

                    # Cria o cliente
                    cliente_id = create_cliente(connection, devedor_nome, cpf_cnpj, tipo_conta, cidade)

                    # Cria o contrato
                    contrato_id = create_contrato(connection, cliente_id, contrato_sisbr, contrato_legado, especie, ponto_atendimento)

                    # Cria o protesto
                    protesto_valores = (
                        valor_protestado,
                        numero_parcela,
                        data_registro,
                        protocolo,
                        status,
                        situacao,
                        data_baixa_cartorio,
                        contrato_id
                    )
                    protesto_id = create_protesto(connection, protesto_valores)

                    # Se houver avalista, cria o registro
                    if avalista_nome:
                        # Para simplificação, usaremos o CPF/CNPJ do devedor para o avalista também
                        # Na prática, o CSV não fornece CPF/CNPJ do avalista, então usamos o do devedor
                        create_avalista(connection, avalista_nome, cpf_cnpj, protesto_id)

                    successful_imports += 1
                    row_count += 1
                    
                    if row_count % 1000 == 0:
                        print(f"Processadas {row_count} linhas...")

                except Exception as e:
                    print(f"Erro ao processar linha {row_count + 1}: {e}")
                    continue

        print(f"\nImportação concluída!")
        print(f"Linhas processadas: {row_count}")
        print(f"Importações bem-sucedidas: {successful_imports}")
        
    except FileNotFoundError:
        print(f"Arquivo CSV não encontrado: {csv_file_path}")
    except Exception as e:
        print(f"Erro durante a importação: {e}")
    finally:
        if connection.is_connected():
            connection.close()
            print("Conexão com o banco de dados fechada")

if __name__ == "__main__":
    # Caminho para o arquivo CSV
    csv_file_path = "protesto2.csv"
    import_csv_to_database(csv_file_path)