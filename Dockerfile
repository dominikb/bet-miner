FROM node:14

COPY . /opt/bet-miner

WORKDIR /opt/bet-miner

RUN npm ci

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]