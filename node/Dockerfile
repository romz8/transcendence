
FROM node:22

WORKDIR /home/dtome-pe/node

COPY res/package*.json ./
COPY res/entrypoint.sh ./
COPY res/vite.config.js ./
COPY res/index.html ./
COPY . .


# Instala las dependencias de la aplicación
RUN npm install

RUN apt-get update && apt-get install -y nginx
RUN mkdir /etc/nginx/ssl/
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/ssl/key.pem /etc/nginx/ssl/key.pem
COPY nginx/ssl/cert.pem /etc/nginx/ssl/cert.pem

RUN chmod +x ./entrypoint.sh

EXPOSE 3001

#CMD ["nginx", "-g", "daemon off;"]
ENTRYPOINT ["./entrypoint.sh"]
