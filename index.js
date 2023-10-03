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
const port = 8000

// Using body parser to parse the body request of incominng HTTP requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Using morgan middleware for making a stream of number of requests with timestamp and id
app.use(morgan('combined', { stream: accessLogStream}))

//Connect the database 
mongoose.connect('mongodb://localhost:27017/popcornhub', { useNewUrlParser: true, useUnifiedTopology: true});


// Retrieving static files
app.use(express.static('public'))

// Getting response for the default endpoint
app.get('/', (req, res) =>{
    res.send(`<h1> Welcome to PopcornHub! </h1>`)
})
// Get all movies
app.get('/movies', async(req, res) =>{
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
app.get('/movies/:title', async (req,res) =>{
    await Movies.findOne({ Title: req.params.title})
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
app.get('/movies/genre/:genreName', async (req,res) =>{
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
app.get('/movies/director/:directorsName', async (req,res) =>{
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
app.get('/users/:Username', async(req, res) =>{
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
app.post('/users', async (req, res) =>{
     await Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if(user){
                return res.status(400).send(`${req.body.Username} already exists.`)
            }else{
                Users.create({
                    Username: req.body.Username,
                    Password: req.body.Password,
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
app.put('/users/:username', async (req,res) =>{
    let message = `User ${req.params.username} was updated.`
    await Users.findOneAndUpdate({ Username: req.params.username }, { $set: 
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    }, { new: true })
        .then((user) =>{
            res.status(201).json(message)
        })
        .catch((err) =>{
            console.error(err)
            res.status(500).send(`Error updating user information: ${err}`)
        })

})

// Users add movie to favorite list
app.post('/users/:username/movies/:movieID', async (req, res) =>{
    await Users.findOneAndUpdate({ Username: req.params.username, FavoriteMovies: {$ne: req.params.movieID } }, {$addToSet: { FavoriteMovies: req.params.movieID }}, { new: true})
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
app.delete('/users/:username/movies/:movieID', async (req,res) =>{
    let message = `Movie removed from list`
   await Users.findOneAndUpdate({ Username: req.params.username }, {$pull: { FavoriteMovies: req.params.movieID }}, { new: true})
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
app.delete('/users/:username', async (req, res) =>{
    await Users.findOneAndRemove({ Username: req.params.username })
        .then((user) =>{
            !user ?
            res.status(400).send(`${req.params.username} not found`) :
            res.status(200).send(`${req.params.username} was deleted`)
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

