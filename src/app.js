require('util').inspect.defaultOptions.depth = null

const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const cors = require('cors')
const http = require('http')
const webSoc = require('socket.io')
const { Pool } = require('pg')
const config = require('../config')
// TODO: find the bug that's causing potential resource leakage
require('events').defaultMaxListeners = 15

const login = require('./routes/login')
const register = require('./routes/register')
const msgSocket = require('./socket')


const db = new Pool(config.db)
const app = express()
const io = webSoc(http.Server(app))

// TODO: rid credentials
const corsConfig = {
  origin: 'http://localhost:3000',
  methods: 'GET,PUT,POST,DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig))

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

module.exports = { app, server: http.Server(app) }
