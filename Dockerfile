FROM node:20-alpine

# Diretório de trabalho no container
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências de produção
RUN npm install --production

# Copia todo o código fonte
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando de execução
CMD ["node", "server.js"]
