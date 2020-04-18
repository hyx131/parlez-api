const express = require('express')
const { hasBodyParams } = require('../middleware/validation')
// TODO: rename utils folder
const { getUserByEmailDB, addUserDB, createFriendListDB } = require('../util/auth-queries')
const { createHashPw } = require('../util/helpers')


const router = express.Router()
module.exports = (db) => {
  router.post(
    '/',
    hasBodyParams('username', 'email', 'password', 'confirmPassword'),
    async (req, res) => {
      const {
        username,
        email,
        password,
        confirmPassword,
      } = req.body

      // TODO: have front-end handle pw mismatch
      if (password !== confirmPassword) res.json({ Error: 'Password must match.' })

      const existingEmail = await getUserByEmailDB(email).then((user) => user.email)
      if (existingEmail) throw new Error('Email already used.') // TODO: custum error handling

      // TODO: db rollback if error from here on
      const newUser = await addUserDB(db, username, email, createHashPw(password)).then((r) => r).catch((err) => {
        res.json({ Error: `Failed to register user: ${err.message}` })
      })

      const newFriendList = await createFriendListDB(db, newUser.id).then((r) => r).catch((err) => {
        res.json({ Error: `Failed to register user: ${err.message}` })
      })

      if (newFriendList) req.session.user_id = newUser.id
      res.json({ user_id: newUser.id, logged_in: true })
    },
  )

  return router
}
