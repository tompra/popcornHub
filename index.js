
const express = require('express')
const app = express()
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let topBooks = [
    {
        title: 'Harry Potter and the Sorcerer\'s Stone',
        author: 'J.K. Rowling'
    },
    {
        title: 'Lord of the Rings',
        author: 'J.R.R. Tolkien'
    },
    {
        title: 'Twilight',
        author: 'Stephanie Meyer'
    }
]

// const myLogger = (request, response, next) =>{
//     console.log('myLogger, request the URL', request.url)
//     next()
// }

// const requestTime = (request, response, next) =>{
//     request.requestTime = new Date();
//     next();
// }


app.use(morgan('combined', { stream: accessLogStream}))

// GET requests
app.get('/', (request, response) =>{
    response.send('Welcome to my app!')
})

app.get('/documentation', (request, response) =>{
    response.sendFile('/documentation.html', {root: __dirname})
})

app.get('/books', (request, response) =>{
    response.json(topBooks)
})

app.listen(8080, ()=>{
    console.log('Server is runnning on port 8080')
})












// const http = require('http'),
// fs = require('fs'),
// url = require('url'),
// port = 8000

// // Server
// const server = http.createServer((request, response) => {
//     let addr = request.url,
//     // Parses the request.url string as first argument, second argument set to true to parse the query string intp an object
//     q = url.parse(addr, true),
//     filePath = ''


//     // Incoming requests, if !documentation then home page
//     if(q.pathname.includes('documentation')){
//         filePath = (`${__dirname}/documentation.html`)
//     }else{
//         filePath = 'index.html'
//     }
//     //Read the files in the directory
//     fs.readFile(filePath, (err, data) =>{
//         if(err) throw err
//         response.writeHead(200, {'Content-type': 'text/html'})
//         response.write(data)
//         response.end()
//     })
//     //Timestamp everytime a request is being made
//     fs.appendFile('log.txt', `Timestamp: ${new Date()} \n`,(err) =>{
//         err ? console.error(err) : console.log('Added to log')
//     })

    
// })

// server.listen(port, () =>{
//     console.log(`Server is up and running on http://127.0.0.1:${port}/`)
// })