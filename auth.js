import { User } from './user.js'
import passport from 'passport'
import LocalStrategy from 'passport-local'

const authenticate = () => passport.authenticate('local',{
       successRedirect: '/',
       failureRedirect: '/login'
   }
)
const authSessions = passport.session()

const Authentication = new LocalStrategy(verifyUserInfo)

const comparePasswords = (password, savedPassword) =>{
    return bcrypt.compare(password, savedPassword, (err, res) =>{
        if(err){
            throw err
        }
        res ? true : false
    })
}

const createUser = async(req) =>{
    const hashedPassword = await hashPassword(req.body.password)
    await User.create({
        username: req.body.username,
        password: hashedPassword
    })
}

const findUser = async(username) =>{
    return await User.findOne({ username: username})
}

const hashPassword = async (password) =>{
    return bcrypt.hash(password, 10, 
        async(err, hashedPassword) =>{
            if(err){
                throw err
            }
            return hashedPassword
        }
    )
}

const initializedsessions = () => passport.initialize()

const useAuthentication = () => {
    passport.use(Authentication)
}

//Find user with the entered username then 
// compare incoming password with stored password   
const verifyUserInfo = async( username, password, done) =>{
    try {
        const user = await findUser(username)
        if(!user){
            return done(null, false, {
                message: "Incorrect username" 
            })
        }
        const isValidPassword = comparePasswords(password, user.password)
        if(isValidPassword){
            return done(null, user)
        } else {
            return done(null, false, {
                message: "Incorrect password" 
            })
        }
    } catch (error) {
        return done(err)
    }
}
const serializeUser = () =>passport.serializeUser((user, done) =>{
    done(null, user.id)
})

const deserializeUser = () =>passport.deserializeUser(async(id, done) =>{
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (err) {
        done(err)
    }
})

export { 
    authenticate, 
    useAuthentication, 
    createUser,
    deserializeUser,
    serializeUser, 
    initializedsessions,
    authSessions
}