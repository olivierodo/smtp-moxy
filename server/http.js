const express = require('express')

module.exports = function (config) {
  return express()
    .get('/to/:email', (req, res) => {
      const { email } = req.params
      let result = config.storage.get(email)
      if (!result) {
        result = { message: `The email recipient ${email} didn't receive any email in the last ${config.ttl / 60} minutes` }
      }
      res.json(result)
    })
    .delete('/to/:email', (req, res) => {
      const { email } = req.params
      config.storage.get(email)
      res.status(204)
    })
}
