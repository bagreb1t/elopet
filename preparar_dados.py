import pandas as pd
import os

def processar_dados_direto():
    arquivo_entrada = 'elopet.csv'
    arquivo_saida = 'dados_tratados.json'
    
    if not os.path.exists(arquivo_entrada):
        print(f"Erro: O arquivo {arquivo_entrada} não foi encontrado!")
        return

    print("Pandas processando a planilha de dados...")
    df = pd.read_csv(arquivo_entrada)
    
    # 1. Filtra a linha de instruções ('OPÇÕES ACEITAS:') e remove registros sem nome
    df = df[df['nome'] != 'OPÇÕES ACEITAS:'].dropna(subset=['nome'])
    
    # 2. Tratamento das colunas de texto
    colunas_validar = ['nome', 'porte', 'espaco_necessario', 'temperamento']
    for col in colunas_validar:
        df[col] = df[col].astype(str).str.strip()
        
    # 3. Tratamento da coluna numérica de energia
    df['energia'] = pd.to_numeric(df['energia'], errors='coerce').fillna(3).astype(int)

    # 4. Exportação para JSON
    df.to_json(arquivo_saida, orient='records', force_ascii=False, indent=4)
    print(f"Concluído, {len(df)} pets mapeados para matchmaking em '{arquivo_saida}'")

if __name__ == "__main__":
    processar_dados_direto()