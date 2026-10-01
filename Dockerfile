FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY Server/ ./Server/

ENV PORT=5001
ENV NODE_ENV=production

EXPOSE 5001

CMD ["node", "Server/index.js"]
