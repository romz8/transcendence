
FROM node:22

WORKDIR /home/apriego-/node

COPY res/package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
