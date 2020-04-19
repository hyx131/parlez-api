const express = require('express')
const validatePassword = require('../middleware/validate-password')


// TODO: params validations
const router = express.Router()
module.exports = (db) => {
  router.post('/login', validatePassword(db), async (req, res) => {
    const { user } = req
    req.session.user_id = user.id
    res.json({ user_id: user.id, logged_in: true })
  })

  router.get('/login/check', (req, res) => {
    try {
      if (!req.session.user_id) throw new Error()
      res.json({ user_id: req.session.user_id, logged_in: true })
    } catch (err) {
      // TODO: CUSTOM ERROR HANDLING
      throw new Error('You are not logged in.')
    }
  })

  router.get('/logout', (req, res) => {
    req.session.user_id = null
    res.json({ message: 'You have been logged out.' })
  })

  return router
}
