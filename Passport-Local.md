# Passport Local Authentication with TypeScript, NodeJs and Express

## Introduction
Authentication is the process of verifying user credentials to make sure that they are who they say they are before being granted access to specific services within a system, application or platform. There are several ways of authenticating users including:

    - Session based authentication (local authentication), 
    - Json web tokens authentication and 
    - Oauth2.0. 

Several JavaScript Libraries have been developed by the JavaScript developers golbally for authentication purposes. Most of the authentucation libraries are available for free on npm. The authentication libraries help reduce the amount of work needed to implement an authentication system. The libraries come with preprogrammed procedures that take care of the most part of authentication logic. The precoded procedures cover most redundancies that are involved in user authentication. With the redundancies taken care of, we have very little work left to do when we choose to use prebuilt authentication libraries.

Some of the prebuilt authentication libraries available on npm include
    - Passport
    -
    -

Passport library offers hundreds of authentication strategies. One of the strategies that is simplest to understand is the local strategy. Passport local strategy is an authetication strategy based on sessions. In the session based authentication, user logs in using a username and a password. The User is granted access to a service for a specified period of time. Once the time elapsed, the session expires and the user looses access to the service until they log in again. 

# Target Audience
This article is aimed towards new learners of typescript who are looking for information on how to implement session based authentication in Express applications. This article is also helpful to non-typescript learners. If you don't know a thing about typescript, don't worry, this will serve as an introduction. On the other hand you can also ignore the TypeScript part of the code and it will still work as it should.

## Scope and None Scope
The objective of this article is to provide a guide on how to implement user authencation using passport local strategy. This article will cover rendering of simple express js application. This article assumes that you have some basic knowledge on creating simple express application. We assume that you have atleast basic level knowledge on the following topics
    - HTML,
    - CSS,
    - JavaScript and Node
    - TypeScript
    - Express applications
    - Express routing
    - Mongoose and MongoDB
    - Template rendering Engines ej ejs.

This is not an introductory article on any of the above web application technologies. In this case it would be a very good idea for you to find out what these are before continuing if you are not familiar with them.

# Technologies needed

In order to follow along with this tutorial, you need to have installed the following on your computer:
    - NodeJs
    - Express Application generator (installed globally) 
    - NPM(Installs automatically with node)

## Express Application starter

To help us move faster, we will use a github template that I have prepared for us in advance. You can download the template using the following command
    ```npx generate-node-ts-template my-project-name```

Feel free to replace ```my-project-name``` with your prefered project name.The above command will download the template and install its required packages for you.

Since our main concern in this exercise it to implement authentication in the server side, this template comes with all the required HTML forms created and styled for you. 

Before going any further, lets run the application to confirm that everything is working correctly. Fill in your mongodb Uri and port number in .env file and Run the following command to start the application
    ```npm run nodemon```

Open your browser and visit your ```http://localhost:<your-port-number>``` to see the welcome page. If the welcome page loads properly we are good to go, otherwise read your error stack to fix the problem before going on.

## Setting Up Session

Initially we said that passport-local strategy relies on on sessions to grant and revoke user access. In this section we will set up session before we set up passport authentication. In order to achieve this, we will install one dependency from npm called express-session using the following command.
    ```npm install express-session```

Import the installed dependency from app.ts 
    ```import session from "express-session"```

Set up session as follows:
    ```app.use(session({
        secret: process.env.SESSION_SECRETE,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: true,
            maxAge: 24 * 60 *60 * 1000 }, //Cookie life of 1 day
        store: sessionStore
    }))```

Setting up session like this allows our application to grant users access to its protected routes. The window lasts for a period of 24hrs. The session will expire after maxAge has elapsed. After 24hrs, the user has to log in again to access protected routes.

## Install Passport Authentication Dependencies Modules

In this section, we will install passport modules needed for local authentication, import them and set the up.

Install the dependencies using the following command
    ```npm i passport passport-local```
    ```npm i @types/passport``` - for typescript



## Setting Up passport Authentication Strategy

In this section, we implementing the user verification login using passport and LocalStrategy installed and imported in the previous section.

Import passport, LocalStrategy, and bcrypt compareSync  from app.ts.
    ```import passport from "passport"```
    ```import LocalStrategy from "passport-local"```
    ```import { compareSync } from "bcrypt"```
    ```
    passport.use(new LocalStrategy(
        async(username, password, done) =>{
            try {
                const user = await User.findOne({ username: username})
        
                if(!user){
                    return done(null, false)
                }
        
                const isValidPassword = compareSync(password, user.password)
                if(isValidPassword){
                    return done(null, user)
                } else{
                    return done(null, false)
                }
            } catch (error) {
                return done(error)
            }
        }
    ))
    ```
The LocalStrategy is a constructor which takes one asynchronous verify function. The verify function takes username, password and a callback function as parameters. The verify function requires that the incoming user data be called with the specific names, username for username and password for password. This requirement doesnt prevent you from using emails to identify users as long as its registred in request body with a key called username. You can achieve this by setting the field names in HTML form input elements to username and password.


### How the Verify function works
The verify function uses the username to find user from DB with that specific username. The operation can end in 4 different results: 
    - An Error occured while attempting to fetch user from the database
    - User was not found in the DB and no error occured in the operation
    - User was found but passwords are not a match.
    - A User was found and credentials are a match

#### Error While Attempting to find User
If the server encountered an error while trying to find user with the specified username, the verify function throws an error. The error could be a databse connection problem or network interruption. The error is handled in the catch block by returning done(error, false). The callback function takes the error object and a false boolean value to show tha user was not found. The verify function terminates at this point and the authentication is considered a failure. 

#### No Error encountered but User not found in the DB
If user is not found and there was no error, the function returns the callback function (done) with null for error and false for value of user. Returning done(null, false) means that there is no user with that username in the DB. The verify function terminates and the authentication process is considered a failure. The user has not registered with the application.

####  A user was found but password is not a match
In case the user with the provided username is found in the DB, the verify function goes ahead to check the password against the password stored in the DB. In most cases the password is stored as a hashed string of characters. The hashed password is compared against the provided password using a utility function. The password compare function returns false if the passwords are not a match. In this case, the verify function returns done( null, false ). No error occured, with the provided username exists but the user did not enter the correct password. The authentication is considered a failure due to password mismatch.


#### A user with matching password is found.
The verify function has only one possibility of success. If the user with the provided username is found in the database, the saved password is compared against the entered password. If the passwords are a match, the verify function returns the callback function with null for error and user object containing credentials of current user. The authentication process is considered a success and user is granted access to protected routes.


## Initialize Passport
## Authenticate Session

## Create Cookier (Serialize User)
This part of the authentication process takes user object returned from the verification funtion and uses it to create cookier.
    ```passport.serializeUser((user, done) => done(null, user.id))```

The passport serializeUser function takes a callback function which returns userId and null for error. The serializeUser function encodes cookie then sends it to the user's browser.

## Decode Cookie
Passport decodes cookier received from the browser using ```passport.deserializeUser``` function. ```passport.desirailizeUser``` takes userId and a callback function. To decode cookier, ```passport``` retrieves user details from database and returns them in the callback function. 
    ```passport.deserializeUser(async(id, done) =>{
        try{
            const user = await User.findById(id)
            return done(null, user)
        } catch(error){
            return done(error, false)
        }
    })```
On retrieving user details successfully, passport attaches a user property to request object and  assigns user details to it. If an error occurs while retrieving user details, the callback is returned with the error and a false value for user.


# Create User with Hashed Password
Before we begin testing our authentication set up, we need a registered user. To register a user, we will implement a route handler for user registeration. In the real world, user passwords are never saved in the databse and plain text. They are stored as hashed sequence of characters that is hard to read and remember. This is done for safety resons. We will install ```bcrypt js``` to help us with password hashing.

Use the following command to install ```bcrypt```
    ```npm install bcrypt @types/bcrypt```

Import bcrypt ```hash``` function and ```User``` model
    ```import { hash } from "bcrypt```
    ```import { User } from "./user.model"```

Create route handler

const registerUser = async(req, res) =>{
    const { full_name, username, password } = req.body
    hash(password, 10, async(err, hashedPassword) => {
        await User.create({
            full_name,
            username,
            password: hashedPassword
        })
    })
}

//Handle Route
```app.post('/signup', registerUser)```

# Loggin In User
In order to authenticate user login using passport, we need to pass the ```passport.authenticate``` function as the route handler for the login post route.

    app.post('/auth/login', passport.authenticate('local',{
        successRedirect: '/profile',
        failureRedirect: '/auth/login'
    }))

We pass the string ```'local'``` to authenticate function to tell passport that we want it to use the localStrategy that we set up earlier to verify and grant access to our users. If authentication is successfull, user was found and password is a match, the user will be redirected to profile page. If the process failed for any of the reasons we discussed earlier, the user is redirected back to login page.

# Protecting Routes.
The whole purpose of authenticating users is to restrict what they can access based on their authentication status. Currently none of our routes in the app is protected. There are two ways in which routes can be protected. 
    - Check if request object has a user property
        ```app.get('/profile/', (req, res, next) =>{
            if(req.user){
                next()
            } else {
                res.redirect('/auth/login')
            }
        }, (req, res) =>{
            res.send('You are logged in')
        } )```

        
    - Check if request.isAuthenticated Property returns true before   granting access.
        ```app.get('/profile/', (req, res, next) =>{
            if(req.isAuthenticated()){
                next()
            } else {
                res.redirect('/auth/login')
            }
        },  (req, res) =>{
            res.send('You are logged in')
        } )```

In both approaches above, the user is redirected to login page if not authenticated otherwise they are show a message showing that they are logged in successfully. 

A better way to do this is to create a middlewear that stores the protection logic then use it on several routes

    const isLoggedIn = (req, res, next) =>{
        if(req.isAuthenticated()){
            next()
        } else {
            res.redirect('/auth/login')
        }
    }

Usage
    app.get('/profile/', isLoggedIn, (req, res) =>{
        res.send('You are logged in')
    } )

# Conclusion
Finally, there several other ways of authenticating users provided by the passport framework. If you are interested in reading more about passport local and other authentication strategies please feel free to visit the passport documentation.

