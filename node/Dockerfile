
FROM node:22

WORKDIR /home/apriego-/node

COPY res/package*.json ./

# Instala las dependencias de la aplicación
# RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
