# Usa una imagen base de Node.js
FROM node:14

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /home/apriego-/node

# Copia los archivos de package.json y package-lock.json (si existe) al directorio de trabajo
COPY res/package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto de los archivos de la aplicación al directorio de trabajo
COPY res ./

# Expone el puerto 3000 (puerto en el que la aplicación escucha)
EXPOSE 3000

# Comando por defecto para ejecutar la aplicación
CMD ["npm", "start"]
