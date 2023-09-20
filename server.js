const http = require('http'),
fs = require('fs'),
url = require('url')

// Server
http.createServer((request, response) => {
    let addr = request.url,
    q = url.parse(addr, true),
    filePath = ''

    //Retrieves the URL object
    // console.log('q:', q)
    // the host name
    // console.log('host:', q.host)
    // the pathname 
    console.log('pathname:', q.pathname)
    // the search made
    // console.log('search:', q.search)
    
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


    
}).listen(8080)

console.log('Server up and running...')