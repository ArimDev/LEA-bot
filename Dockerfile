# Dockerfile
FROM node:22.12.0

ARG webPort

# Nastavení pracovního adresáře v kontejneru
WORKDIR /

# Zkopíruj package.json a package-lock.json
COPY package.json /

# Nainstaluj závislosti
RUN npm install --production

# Zkopíruj zbytek kódu bota
COPY . /

# Definuj příkaz k spuštění
CMD ["node", "--no-warnings", "index.js", "start"]

# Expose port (pokud boty využívají HTTP porty pro interakci)
EXPOSE ${webPort}