
const express = require('express')
const app = express()
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
const bodyParser = require('body-parser')
const uuid = require('uuid')
const port = 8000

let users = [
    {
        userName : 'DFang',
        password: '123456',
        email: 'dfang@mail.co',
        birthDate: '12-12-1990',
        favoriteMovies: [],
        id: 1
    },
    {
        userName : 'turNst',
        password: '123456',
        email: 'tunrs@mail.co',
        birthDate: '12-01-1991',
        favoriteMovies: [],
        id: 2
    },
    
]

let topMovies = [
     {
        title: "2001: A Space Oddyssey",
        director: 'Stanley Kubrick',
        genre: 'science fiction',
        image: 'https://imgs.search.brave.com/Il2YAGN2py3tbvdcS-Rmllxse3grDrwEtTXEUwy2iFc/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pcnMu/d3d3Lndhcm5lcmJy/b3MuY29tL2tleWFy/dC1qcGVnL21vdmll/cy9tZWRpYS9icm93/c2VyLzIwMDFfYV9z/cGFjZV9vZHlzc2V5/XzIwMDB4MzAwMC5q/cGc' ,
        description: 'After uncovering a mysterious artifact buried beneath the Lunar surface, a spacecraft is sent to Jupiter to find its origins: a spacecraft manned by two men and the supercomputer HAL 9000.',
        id: 1
     },
    {
        title: "The Lord of the Rings: The Fellowship of the Ring",
        director: 'Peter Jackson',
        genre: 'Adventure',
        image: 'https://imgs.search.brave.com/Uiz3YvnK5rt0iNHGjREZwUdEOsxCzc27L7AEwaGICDQ/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pcnMu/d3d3Lndhcm5lcmJy/b3MuY29tL2tleWFy/dC1qcGVnL21vdmll/cy9tZWRpYS9icm93/c2VyL2xvcmRfb2Zf/dGhlX3JpbmdzX2Zl/bGxvd3NoaXBfb2Zf/dGhlX3JpbmdfMjAw/MHgzMDAwLmpwZw',
        description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
        id: 2
    },
    {
        title: 'The Matrix',
        author: 'Wachowski Sisters',
        genre: 'Science Fiction',
        image: 'https://imgs.search.brave.com/hsBTYPyG2YRJOBlrxRiXILc3-T_TnR-AsdRDc9qEjnU/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pcnMu/d3d3Lndhcm5lcmJy/b3MuY29tL2tleWFy/dC1qcGVnL21vdmll/cy9tZWRpYS9icm93/c2VyL01hdHJpeF8y/MDAweDMwMDAuSlBF/Rw',
        description:'The story of Neo, a computer hacker who discovers that the reality he knows is an illusion created by sentient machines. He joins a group of rebels fighting against the machines and enters the virtual world of the Matrix, where gravity-defying martial arts and a battle for the future of humanity unfold',
        id: 3
    },
    {
        title: 'Joker',
        author: 'Todd Phillips',
        genre: 'Action',
        image: 'https://imgs.search.brave.com/xCNhunXIHWfrPYCVq0irwOItr0FcdYZfyVmGYfR4ql0/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2Jh/dG1hbi9pbWFnZXMv/NS81OS9Kb2tlcl9N/b3ZpZV9Qb3N0ZXJf/RGlzY292ZXJfSXRf/SW5fRG9sYnlfQ2lu/ZW1hLmpwZy9yZXZp/c2lvbi9sYXRlc3Qv/c2NhbGUtdG8td2lk/dGgtZG93bi8xNTA_/Y2I9MjAxOTA5MjMx/MzI5NTI.jpeg',
        description: 'The life of Arthur Fleck, a troubled and marginalized man who descends into madness and becomes the infamous criminal mastermind, the Joker.',
        id: 4
    },
    {
        title: 'Princess Mononoke',
        author: 'Hayao Miyazaki',
        genre: 'Animated',
        image: 'https://imgs.search.brave.com/oVh3UogUS6tpwYdCJj6VssurIG47ZYNG39_U-G7gI6Y/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vYXNpYW4t/bW92aWVzLW9ubGlu/ZS5jb20vd3AtY29u/dGVudC91cGxvYWRz/LzkzLmpwZz9maXQ9/NTYwLDc4NiZzc2w9/MQ',
        description: 'The tale of Ashitaka, a young warrior who becomes embroiled in a conflict between the spirits of the forest and the industrializing human civilization. The film explores themes of nature, balance, and the consequences of human actions on the environment.',
        id: 5
    },
    {
        title: 'Fight Club',
        author: 'David Fincher',
        genre: 'Thriller',
        image: 'https://imgs.search.brave.com/DQPlA81_RZOdW0rpuaQEr965tNA-7K_kf7GYy9AM2P0/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzUxaU9BTmp0Q1FM/LmpwZw',
        description: 'The story of an insomniac office worker who forms an underground fight club with the enigmatic Tyler Durden. The film delves into themes of masculinity, consumerism, and the dark side of modern society.',
        id: 6
    },
    {
        title: 'City of God',
        author: 'Fernando Meirelles',
        genre: 'Crime',
        image: 'https://imgs.search.brave.com/CGTd4cvwTqGox9Mg1rAifrRsljChoXUTiRn_W3tdKbA/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1Qk9UTXdZamM1/Wm1JdFlURmpaQzAw/WkdRM0xUbGtOVE10/TWpaaU5UWmxNV1F6/TnpJNVhrRXlYa0Zx/Y0dkZVFYVnlOemt3/TWpRNU56TUAuanBn',
        description: 'The story of life in the impoverished and dangerous Cidade de Deus (City of God) neighborhood in Rio de Janeiro. It follows the lives of two young friends, Rocket and Lil Dice, as they navigate the treacherous world of crime and violence.',
        id: 7
    },
    {
        title: 'Parasite',
        author: 'Bong Joon Ho',
        genre: 'Thriller',
        image: 'https://imgs.search.brave.com/8go8edH1BFGiPOyL3_YzA33uxz5Z_X0olQtEDtHWsSo/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9oaXBz/LmhlYXJzdGFwcHMu/Y29tL3ZhZGVyLXBy/b2QuczMuYW1hem9u/YXdzLmNvbS8xNTg2/OTAwMjc0LTkxc3Vz/dGZvamJsLWFjLXN5/ODc5LTE1ODY5MDAy/MzguanBnP2Nyb3A9/MC45MzN4dzowLjkw/NHhoOzAuMDM2OXh3/LDAmcmVzaXplPTk4/MDoq',
        description: 'The film revolves around the Kim family, who infiltrate the lives of the wealthy Park family by posing as various domestic workers. It explores themes of class struggle, social inequality, and the consequences of deception.',
        id: 8
    },
    {
        title: 'Alien',
        author: 'Ridley Scott',
        genre: 'Horror',
        image: 'https://imgs.search.brave.com/NKOjjmBzwno8t0y5BYSd883r3gVyGHUZYivYIAh5INQ/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTYz/MDAyMjk4L3Bob3Rv/L21vdmllLWFydC1m/b3ItdGhlLXRoZS1m/aWxtLWFsaWVuLTE5/NzkuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPW1NRzNVajBf/dmF4QzlrX2NQeE8z/NjFMVk9Mb3Q5RTZE/MnJkXzZsUTRGMVE9',
        description: 'The crew of the spaceship Nostromo as they encounter a deadly extraterrestrial creature on a distant planet. The film is known for its suspenseful atmosphere and iconic design of the xenomorph alien.',
        id: 9
    },{
        title: 'Leon: The Professional',
        author: 'Luc Besson',
        genre: 'Crime',
        image: 'https://imgs.search.brave.com/MPMIqamybbK8bVe7SZH13TYMOoLufkN-P6k9ZdLSrm4/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1Qk9UZ3lNV1Ew/WldVdE4yUTJNUzAw/Tm1ZMExXSTNPV010/TmpGa016WmxORFpq/TlRrMFhrRXlYa0Zx/Y0dkZVFYVnlNalV6/T1RZMU5UY0AuanBn',
        description: 'The film centers on Léon, a professional hitman, and Mathilda, a young girl seeking revenge against corrupt DEA agents who killed her family. The film explores the unconventional relationship between the two characters and delves into themes of morality and redemption.',
        id: 10
    },
]
// Using morgan middleware for making a stream of number of requests with timestamp and id
app.use(morgan('combined', { stream: accessLogStream}))
// 

// GET requests
// Retrieving static files
app.use(express.static('public'))

// Getting response for the default endpoint
app.get('/', (req, res) =>{
    res.send(`<h1> Welcome to PopcornHub! </h1>`)
})
// Get all movies
app.get('/movies', (req, res) =>{
    res.status(200).json(topMovies)
})

//





// Error handlings for every request. It must go at the very end
app.use((err, req, res, next) =>{
    console.error(err.stack)
    res.status(500).send('Something is wrong!')
})

// Calling the server
app.listen(port, ()=>{
    console.log(`Server is running in port ${port}...`)
})

