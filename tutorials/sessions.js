const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')

const MongoStrore = require('connect-mongo')(session)

const app = express()
const dbUri = DB_URI
const dbOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

//make connection object
const connection = mongoose.createConnection(dbUri, dbOptions)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Config session storage
const sessionStore = new MongoStrore({
    mongooseConnection: connection,
    collection: 'sessions'
})

//configure and dispatch session
app.use(session({
secret: 'some sting',
resave: false,
store: sessionStore,
cookie: {
    maxAge: 1000 * 60* 60 * 24 * 365 //1 year lifespan cookie
}
}))

//get homepage
app.get('/', (req, res, next) =>{
    res.send('<h1>Hello world</h1>')
})

app.listen(3000)