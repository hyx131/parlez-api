const bcrypt = require('bcrypt')
const { getUserByEmailDB } = require('../util/queries')


module.exports = (db) => async (req, _, next) => {
  const { email, password } = req.body
  const user = await getUserByEmailDB(db, email, next)
  // TODO: err if userlength = 0
  if (bcrypt.compareSync(password, user.password)) {
    req.user = user
  } else {
    throw new Error('Incorrect credentials.')
  }
}
