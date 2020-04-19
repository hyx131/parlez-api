const bcrypt = require('bcrypt')


const createHashPw = (pw) => bcrypt.hashSync(pw, 10)

module.exports = { createHashPw }
