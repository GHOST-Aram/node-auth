const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const LocalStrategy = require('passport-local')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)

const app = express()
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const DB_URI = 'mongodb://devuser:123@localhost:27017/general_dev'

const connection = mongoose.createConnection(DB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String
})


const User = mongoose.model('User', UserSchema)

passport.use(new LocalStrategy(
    async(username, password, done) =>{
        try {
            const user = await User.findOne({ username: username})
    
            if(!user){
                return done(null, false, { message: 'username not registered' })
            }
    
            const isValidPassword = comparePasswords(password, user.hash, user.salt)
            if(isValidPassword){
                return done(null, user, {
                    message: 'Login was successful'
                })
            } else{
                return done(null, false, {
                    message: 'Incorrect Password'
                })
            }
        } catch (error) {
            return done(error)
        }
    }
))

passport.serializeUser((user, done) =>{
    process.nextTick(() =>{
        return done(null, user.id)

    })
})

passport.deserializeUser((id, done) =>{
    process.nextTick(async ()=>{
        try {
            const user = await User.findById(id)
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    })
})
// _________________________Session setup______________

const sessionStore = new MongoStore({
    mongooseConnection: connection,
    collection: 'Sessions'
})
//Initalize session
app.use(session({
    secret: 'Keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
    store: sessionStore
}))

// __________________________Passport Authentication_________________

app.use(passport.initialize())
// app level authentication using session stategy
app.use(passport.session())

// ----------------Routes____________________
//Login route authentication
app.post('/login/password', passport.authenticate('local',{
    failureRedirect: '/login-failure',
    failureMessage: true,
    successRedirect: '/login-success',
    successMessage: true 
}), (err, req, res, next) =>{
    if(err) next(err)
})

app.post('/register', async(req, res, next) =>{
    try {
        
        const saltHash = generatePassword(req.body.password)
    
        const salt = saltHash.salt
        const hash = saltHash.hash
    
        const newUser = new User({
            username: req.body.username,
            hash: hash,
            salt: salt
        })
        
        await newUser.save()
        
        res.redirect('/login')

    } catch (error) {
        next(err)
    }
})

app.get('/protected-route', (req, res, next)=>{
    if(req.isAuthenticated){
        res.send('Access granted')
    } else {
        res.redirect('/login')
    }
})

app.get('/logout', (req, res, next) =>{
        req.logout()
        res.redirect('/login')
    }
)

app.get('/login-success', (req, res, next) =>{
        res.send('Acess Granted')
    }
)

app.get('/login-failure', (req, res, next) =>{
    res.send('You entered the wrong password.')
})

app.listen(3000)