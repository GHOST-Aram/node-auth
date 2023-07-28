const express = require('express')
const path = require('path')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const app = express()
const Schema = mongoose.Schema

const mongoDB = 'mongodb+srv://ghostaramic:bjka3yOdNV61Y9Y3@cluster0.ojzzyly.mongodb.net/node-auth?retryWrites=true&w=majority'
mongoose.connect(mongoDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

const db = mongoose.connection
db.on('error', console.error.bind('mongo connection error'))

const User = mongoose.model('User',new Schema({
    username: { type: String, required: true},
    password: { type: String, required: true}
}))

app.set('views', __dirname)
app.set('view engine', 'ejs')

app.use(session({ secret: 'cats', reserve: false, saveUninitialized: true}))

passport.use(
    new LocalStrategy(async( username, password, done) =>{
        try {
            const user = await User.findOne({ username: username})
            if(!user){
                return done(null, false, {
                    message: "Incorrect username" 
                })
            }
            bcrypt.compare(password, user.password, (err, res) =>{
                if(res){
                    return done(null, user)
                } else {
                    return done( null, false,  {
                        message: 'Incorrect password'
                    })
                }
            })
        } catch (error) {
            return done(err)
        }
    })
)
passport.serializeUser((user, done) =>{
    done(null, user.id)
})

passport.deserializeUser(async(id, done) =>{
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (err) {
        done(err)
    }
})
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({extended: false}))


app.listen(3000, () =>{
    console.log('App listening on port 3000')
})

app.use((req, res, next) =>{
    res.locals.currentUser = req.user
    next()
})

app.get('/', (req, res) =>{
    res.render('index', { user: req.user })
})

app.get('/sign-up', (req, res) =>{
    res.render('sign-up-form')
})

app.post('/sign-up',  async(req, res, next) =>{
    try {
        bcrypt.hash(req.body.password, 10, async(err, hashedPassword) =>{
            if(err){
                throw err
            }else{
                const user = new User({
                    username: req.body.username,
                    password: hashedPassword
                })
                await user.save()
            }
        })

    } catch (error) {
        return next(error)
    }
})

app.post('/log-in', passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/'
}))

app.get('/log-out', (req, res, next) =>{
    req.logout((err) =>{
        if(err){
            return next(err)
        }
        res.redirect('/')
    })
})