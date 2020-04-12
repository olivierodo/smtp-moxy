const SMTPServer = require("smtp-server").SMTPServer
const simpleParser = require('mailparser').simpleParser
const nodemailer = require('nodemailer')

module.exports = function(config) {

  let r = new RegExp(`@${config.smtp.mockRecepientDomain}$`)

  let transportOptions = {
    ...config.smtp.forwardTo,
    tls: {
      rejectUnauthorized: false
    }
  }

  let smtpTransport

  function sendEmail (mail) {
    if (!smtpTransport) {
      console.log(transportOptions)
      smtpTransport = nodemailer.createTransport(transportOptions)
    }

    let options = {
      from: mail.from.text,
      to: mail.to.text,
      subject: mail.subject,
      html: mail.textAsHtml
    }

    smtpTransport.sendMail(options, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    })
  }

  let options = {
    authOptional: true,
    maxAllowedUnauthenticatedCommands: 1000,
    onAuth(auth, session, callback) {
      transportOptions.auth = {
        user: auth.username,
        pass: auth.password
      }
      callback(null, { user: 'dummy'})
    },
    async onData(stream, session, callback) {
      try {
        let mail = await simpleParser(stream)
        mail.headers = Object.fromEntries(mail.headers)
        mail.to.value.forEach(to => {
          if (to.address.match(r)) {
            config.storage.put(to.address, mail)
          } else {
            sendEmail(mail)
          }
        })
        callback()
      } catch(err) {
        callback(err)
      }
    }
  }

  let server = new SMTPServer(options)
  server.on("error", err => {
    console.log("Error %s", err.message);
  })

  return server
}
