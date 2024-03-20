FROM node:20-slim

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines

COPY tsconfig.json ./
COPY ./src ./src
RUN yarn build

EXPOSE 8080
CMD ["yarn", "start"]
