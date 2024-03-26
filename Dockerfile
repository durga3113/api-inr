FROM node:slim

RUN apt-get update && \
    apt-get install -y libxkbcommon0 libgbm1 libatk-bridge2.0-0 git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

RUN apt-get install -y wget ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatspi2.0-0 libgtk-3-0 libnspr4 libnss3 xdg-utils

RUN npm install puppeteer

EXPOSE 3034

CMD ["npm", "start"]
