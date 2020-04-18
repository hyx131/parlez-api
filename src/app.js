require('util').inspect.defaultOptions.depth = null

const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const cors = require('cors')
const http = require('http')
const socket = require('socket.io')
const { Pool } = require('pg')
const config = require('../config')

const login = require('./routes/login')
const register = require('./routes/register')
const msgSocket = require('./socket')


const db = new Pool(config.db)
const app = express()
const io = socket(http.Server(app))

// enable cors
// enable Access-Control-Allow-Origin: *
app.use(cors())
app.options('*', cors())

app.use(morgan('dev'))
app.use(express.json({ extended: true }))

app.use(
  session({
    secret: 'lhl parlez',
    resave: true,
    saveUninitialized: true,
  }),
)

app.use('/auth/', login(db))
app.use('/auth/register', register(db))
app.use(msgSocket(db, io))

module.exports = app
