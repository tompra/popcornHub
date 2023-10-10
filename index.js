const express = require('express')
const app = express()
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
const bodyParser = require('body-parser')
const uuid = require('uuid')
const mongoose = require('mongoose')
const Models = require('./models.js')
const Movies = Models.Movie;
const Users = Models.User
const cors = require('cors')
const port = 8000
let allowedOrigins = [`http://localhost:${port}`, 'http://testsite.com']
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = `The CORS policy for this applicaiton doesn't allow access from origin ${origin}`
            return callback(new Error(message), false)
        }
        return callback(null,true)
    }
}))
// Using body parser to parse the body request of incominng HTTP requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const auth = require('./auth.js')(app)
const passport = require('passport')
require('./passport.js')

// Using morgan middleware for making a stream of number of requests with timestamp and id
app.use(morgan('combined', { stream: accessLogStream}))

//Connect the database 
mongoose.connect('mongodb://localhost:27017/popcornhub', { useNewUrlParser: true, useUnifiedTopology: true});

// Retrieving static files
app.use(express.static(__dirname + '/public'))

// Getting response for the default endpoint
app.get('/', (req, res) =>{})
// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async(req, res) =>{
    await Movies.find()
        .then((movies) =>{
            res.status(201).json(movies)
        })
        .catch((err) =>{
            console.error(err)
            res.status(500).send(`Error retrieving all movies: ${err}`)
        })

})

// Get movies by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req,res) =>{
    await Movies.findOne({ Title: req.params.Title})
        .then((movie) =>{
            !movie ?
            res.status(400).send(`Movie doesn't exists`) :
            res.status(201).json(movie)
    
        })
        .catch((err) =>{
            console.error(err)
            res.status(500).send(`Error in retrieving movie by title ${err}`)
        })
   
})

// Get movie by genre's name
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req,res) =>{
    await Movies.findOne({ "Genre.Name" : req.params.genreName})
        .then((movie) =>{
            !movie ? 
            res.status(400).send('Movie by that genre doesn\'t exists') :
            res.status(201).json(movie.Genre)
        })
        .catch((err) =>{
            console.error(err)
            res.status(500).send(`Error retrieving movie by genre: ${err}`)
        })


})

// Get movie by director
app.get('/movies/director/:directorsName', passport.authenticate('jwt', { session: false }), async (req,res) =>{
    await Movies.findOne({ "Directors.Name": req.params.directorsName })
        .then((movie) =>{
            !movie ?
            res.status(400).send(`Director doesn't exist`) :
            res.status(201).json(movie.Directors)
        })
        .catch((err) => {
            console.error(err)
            res.status(500).send(`Error retrieving directors name`)
        })
})



//Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }) ,async(req, res) =>{
    await Users.findOne({ Username: req.params.Username})
        .then((user) =>{
            res.json(user)
        })
        .catch((err) => {
            console.error(err)
            res.status(500).send(`Error getting Username: ${err}`)
        })
})


// Add new user
app.post('/users', async (req, res) => {
     let hashedPassword = Users.hashedPassword(req.body.Password)
     await Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if(user){
                return res.status(400).send(`${req.body.Username} already exists.`)
            }else{
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }).then((user) => res.status(201).json(user))
                .catch((err) => {
                    console.error(err)
                    res.status(500).send(`Error: ${err}`)
                })
            }
        }).catch((err) => {
            console.error(err)
            res.status(500).send(`Error: ${err}`)
        })
})

// Update user information
app.put('/users/:Username', passport.authenticate('jwt', { session: false} ), async (req,res) => {
    let message = `User ${req.params.Username} was updated.`
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set: 
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    }, { new: true })
        .then((user) =>{
            res.status(201).send(message)
        })
        .catch((err) =>{
            console.error(err)
            res.status(500).send(`Error updating user information: ${err}`)
        })

})

// Users add movie to favorite list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) =>{
    await Users.findOneAndUpdate({ Username: req.params.Username, FavoriteMovies: {$ne: req.params.MovieID } }, {$addToSet: { FavoriteMovies: req.params.MovieID }}, { new: true})
        .then((movie) =>{
            !movie ?
            res.status(400).send(`Movie is already in the favorite list`) :
            res.json(movie)
        })
        .catch((err) =>{
            console.error(err)
            res.status(500).send(`Error adding movi to favorite list: ${err}`)
        })

})

// Users remove movie from favorite list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }) , async (req,res) =>{
    let message = `Movie removed from list`
   await Users.findOneAndUpdate({ Username: req.params.Username }, {$pull: { FavoriteMovies: req.params.MovieID }}, { new: true})
        .then((movie) =>{
            !movie ?
            res.status(400).send(`Movie is not in the list`) :
            res.json(message)
        })
        .catch((err) =>{
            console.error(err)
            res.status(500).send(`Error adding movi to removing list: ${err}`)
        })
})

// Remove user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) =>{
    await Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) =>{
            !user ?
            res.status(400).send(`${req.params.Username} not found`) :
            res.status(200).send(`${req.params.Username} was deleted`)
        })
        .catch((err) =>{
            console.error(err)
            res.status(500).send(`Error in deleting user: ${err}`)
        })
})

// Error handlings for every request. It must go at the very end
app.use((err, req, res, next) =>{
    console.error(err.stack)
    res.status(500).send('Something is wrong!')
})

// Calling the server
app.listen(port, ()=>{
    console.log(`Server is running in port ${port}...`)
})

