FROM node:18

# Instala Python 3 e Pandas no servidor
RUN apt-get update && apt-get install -y python3 python3-pandas

# Define o diretório interno do servidor
WORKDIR /usr/src/app

# Copia as dependências do Node
COPY package*.json ./
RUN npm install

# Copia todo o projeto (index.html, script.js, server.js, preparar_dados.py, etc)
COPY . .

# Expõe a porta do servidor
EXPOSE 3000

# Executa o seu servidor principal
CMD ["node", "server.js"]