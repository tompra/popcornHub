const http = require('http'),
fs = require('fs'),
url = require('url'),
port = 8000

// Server
const server = http.createServer((request, response) => {
    let addr = request.url,
    // Parses the request.url string as first argument, second argument set to true to parse the query string intp an object
    q = url.parse(addr, true),
    filePath = ''


    // Incoming requests, if !documentation then home page
    if(q.pathname.includes('documentation')){
        filePath = (`${__dirname}/documentation.html`)
    }else{
        filePath = 'index.html'
    }
    //Read the files in the directory
    fs.readFile(filePath, (err, data) =>{
        if(err) throw err
        response.writeHead(200, {'Content-type': 'text/html'})
        response.write(data)
        response.end()
    })
    //Timestamp everytime a request is being made
    fs.appendFile('log.txt', `Timestamp: ${new Date()} \n`,(err) =>{
        err ? console.error(err) : console.log('Added to log')
    })

    
})

server.listen(port, () =>{
    console.log(`Server is up and running on http://127.0.0.1:${port}/`)
})