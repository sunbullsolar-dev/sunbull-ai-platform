FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . .
RUN npx tsc
EXPOSE 4000
ENV PORT=4000
CMD ["node", "dist/index.js"]
