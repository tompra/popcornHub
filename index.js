
const express = require('express')
const app = express()
const port = 8000
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let topMovies = [
     {
        title: "2001: A Space Oddyssey",
        director: 'Stanley Kubrick',
        id: 1
     },
    {
         title: "The Lord of the Rings: The Fellowship of the Ring",
        director: 'Peter Jackson',
        id: 2
    },
    {
        title: 'The Matrix',
        author: 'Wachowski Sisters',
        id: 3
    },
    {
        title: 'Joker',
        author: 'Todd Phillips',
        id: 4
    },
    {
        title: 'Princess Mononoke',
        author: 'Hayao Miyazaki',
        id: 5
    },
    {
        title: 'Fight Club',
        author: 'David Fincher',
        id: 6
    },
    {
        title: 'City of God',
        author: 'Fernando Meirelles',
        id: 7
    },
    {
        title: 'Parasite',
        author: 'Bong Joon Ho',
        id: 8
    },
    {
        title: 'Alien',
        author: 'Ridley Scott',
        id: 9
    },{
        title: 'Lein',
        author: 'Luc Besson',
        id: 10
    },
]
// Using morgan middleware for making a stream of number of requests with timestamp and id
app.use(morgan('combined', { stream: accessLogStream}))

// GET requests

// Retrieving static files
app.use(express.static('public'))

// Getting response for the default endpoint
app.get('/', (req, res) =>{
    res.send(`<h1> Welcome to PopcornHub! </h1>`)
})

app.get('/movies', (req, res) =>{
    res.json(topMovies)
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

