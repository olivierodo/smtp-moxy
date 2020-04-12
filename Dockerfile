# The instructions for the first stage
FROM node:12-alpine as builder
LABEL maintainer="RestQa <team@restqa.io>"
LABEL app="smtp_proxy"
LABEL name="smtp moxy"
LABEL description="A light mail proxy to support your End to End automation test"
LABEL repository="https://github.com/restqa/smtp-moxy"
LABEL url="https://restqa.io/smtp-moxy"

RUN apk --no-cache add python make g++

COPY package*.json ./
RUN npm install --production
RUN npm ci --only=production


# The instructions for second stage
FROM node:12-alpine

WORKDIR /usr/src/app
COPY --from=builder node_modules node_modules

ENV NODE_ENV=production

COPY . .

CMD [ "npm", "start" ]
