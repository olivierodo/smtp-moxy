const Storage = require('./server/utils/storage')
const { Http, Smtp } = require('./server')

const http = require('http')

const {
  HTTP_PORT,
  SMTP_PORT,
  MOCK_DOMAINE_NAME,
  FORWARD_SMTP_SERVER_HOST,
  FORWARD_SMTP_SERVER_PORT,
  FORWARD_SMTP_SERVER_SECURE,
  CACHE_TTL
} = process.env

const config = {
  storage: new Storage({ ttl: CACHE_TTL }),
  ttl: 60,
  http: {
    port: HTTP_PORT || 8080
  },
  smtp: {
    mockRecepientDomain: MOCK_DOMAINE_NAME || 'restqa.io',
    forwardTo: {
      host: FORWARD_SMTP_SERVER_HOST,
      port: FORWARD_SMTP_SERVER_PORT,
      secure: (FORWARD_SMTP_SERVER_SECURE && Boolean(FORWARD_SMTP_SERVER_SECURE)) || false
    },
    port: SMTP_PORT || 465
  }
}

const smtpServer = new Smtp(config)
const httpServer = new Http(config)

config.storage.put('oli@test.com', { foo: 'bar' })

http
  .createServer(httpServer)
  .listen(config.http.port, () => {
    smtpServer.listen(config.smtp.port, () => {
      console.log(`> The server http is running on the port ${config.http.port}`)
      console.log(`> The server smtp is running on the port ${config.smtp.port}`)
    })
  })
