const http = require('http')
const fs = require('fs')
const url = require('url')

http.createServer((request, response) => {
    response.writeHead(200, {'Content-type': 'text/plain'})
    response.end()
}).listen(8080)

console.log('Server up and running...')