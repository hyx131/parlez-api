const { app, server } = require('./app')


const port = process.env.PORT || '3003'
app.listen(port, () => console.log(`Listening on port ${port}`))
server.listen(8080)
