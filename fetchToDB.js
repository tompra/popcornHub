const baseURL = 'https://api.themoviedb.org/3/';
const imagePath = 'https://image.tmdb.org/t/p/w500/';
const fs = require('fs')
const { access_token_auth } = require('./secret.json')
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: access_token_auth
  }
};
const totalPages = 100;

const getAllMovieData = async() =>{
  //Put all data together
  let allData = []
  //Fetch for every movie page
  for(let page = 1; page <= totalPages; page++){
    const fetchData = await fetch(`${baseURL}movie/top_rated?language=en-US&page=${page}`, options)
                      .then(response => response.json())
                      .then(response => mapMoviesArr(response))
                      .catch(err => console.error(err));
    //Concatenating all the data into one array
    allData = allData.concat(fetchData)
    
    //Save data
    const movieData = `movie-data/all-data.json`
    fs.writeFileSync(movieData, JSON.stringify(allData, null, 2))
  }
  console.log('Data fetching and saving completed')
}
                      
async function mapMoviesArr(response){
    const responseData = response.results;
    //Keys to filter from response
    const keysToExtract = ['title', 'id', 'genre_ids', 'overview', 'poster_path', 'release_date', 'vote_average']
    //Array to store all the movies objects
    const mappedDataArray = []
    //Calling the getGenres to fetch the genres array
    const genresArr = await getGenres()
    //Loop inside of the array
    for(const movieObjects of responseData){
      //Empty object to for the mapped information extraction
      const mappedMovies = {}
      //Loop inside of the objects
      for(const key of keysToExtract){
        //adding to the image the complete path to render the images
        if(key === 'poster_path'){
          if(movieObjects[key] !== undefined){
            mappedMovies[key] = `${imagePath}${movieObjects[key]}`
          }
        }else if(key === 'genre_ids'){
         mappedMovies[key] = movieObjects[key].map(genreID => {
            const genre = genresArr.find(genre => genre.id === genreID)
            return genre ? genre.name : ''
         })
        }
        else{
          if(movieObjects[key] !== undefined){
            mappedMovies[key] = movieObjects[key]
          }
        }
      }
      mappedDataArray.push(mappedMovies)
    }
    return mappedDataArray
}

const getGenres = async() => {
  const fetchGenres = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options)
        .then(response => response.json())
        .then(response => response.genres)
        .catch(err => console.error(err));
  return fetchGenres
}

getGenres()
getAllMovieData();