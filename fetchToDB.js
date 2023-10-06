const baseURL = 'https://api.themoviedb.org/3/'
import { access_token_auth } from './secret.json';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: access_token_auth
  }
};

// Transform data to apply to the movie schema database
// Map through the result and push it to the database?
//   // get movies
//   Title: result.title,
//   Description: result.overview,
//   Genre: {
//     Name: 'result.name', 
//     Description: 'not available', 
//   },
//   //Get person
//   Directors: {
//     Name: 'Director Name', 
//     Bio: 'not available', 
//     Birth: not available, 
//     Death: not available, 
//   },
//   Actors: [], 
//   ImagePath: result.poster_path,
//   Featured: false, 

// FETCH FOR MOVIES, GENRE and PERSONS
// FETCH FROM THE x page THE MOST POPULAR MOVIES
// results retrieve only the x page giving the title, description and images. No actors, directors or genre involve. 
const getMovies  = async () => {
   await fetch(`${baseURL}movie/popular?language=en-US&page=1`, options)
  .then(response => response.json())
  .then(response => {
    return console.log(response)
  })
  .catch(err => console.error(err));
}
getMovies()

// FETCH PERSON (ACTORS & DIRECTOR) BY SEARCH (STRING)
// results for knowing if actor or director: "known_for_department" : "acting or directing"
// no description available (bio, birth and death)
// movies made results: 'Known_for"
const getPersons = async () => {
  await fetch(`${baseURL}search/person?query=brad%20pitt&include_adult=false&language=en-US&page=1`)
  .then(response => response.json())
  .then(response =>{
    return console.log(response)
  })
  .catch(err => console.error(`Error in getting person: ${err}`))
}
// getPersons()

// FETCH GENRE ALL AVAILABLE
// results retrieve only name and id no description
const getGenres = async () => {
  await fetch(`${baseURL}genre/movie/list?language=en`)
  .then((response) => response.json())
  .then((response) => console.log(response))
  .catch((err) => console.error(`Error in getting genres: ${err}`))
}
// getGenres()