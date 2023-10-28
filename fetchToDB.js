const baseURL = 'https://api.themoviedb.org/3/';
const imagePath = 'https://image.tmdb.org/t/p/w500';
const secrets = require('./secret.json');
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: secrets.access_token_auth,
    },
};
// TO DO:
// Function to fetch movies
// Function to get all data
// Function to append the movie data to the database
// Function to get description of actors
// Function to get description of directors
// Function to append the image file to actor, director and movie
// Function to add the genre description
// Function random number generator until x number

// Get ALL DATA
const getMoviesWithDetails = async (movieID) => {
    try {
        const apiURL = `${baseURL}movie/${movieID}?api_key=R${secrets.api_key}8&language=en-US&append_to_response=credits`;
        const response = await fetch(apiURL, options);
        if (!response.ok) {
            throw new Error(`Failed to fetch movie details for ID ${movieID}`);
        }
        const data = await response.json();
        return movieDetails(data);
    } catch (err) {
        console.error(err);
    }
};

getMoviesWithDetails(500);

// GET PERSON DATA
const getPersonById = async (personID) => {
    try {
        const apiURL = `${baseURL}/person/${personID}-?language=en-US`;
        const response = fetch(apiURL, options);
        if (!response.ok) {
            throw Error(`Error retrieving person ${personID}`);
        }
        const data = await response.json();
        const mappedPerson = {};
        const keysToExtract = [
            'biography',
            'birthday',
            'deathday',
            'name',
            'id',
            'place_of_birth',
        ];
        for (const key of keysToExtract) {
            if (data[key] !== undefined) {
                mappedPerson[key] = data[key];
            }
        }
        return mappedPerson;
    } catch (err) {
        console.error(err);
    }
};

// GET MOVIE DETAILS
const movieDetails = async (data) => {
    const [director, actors] = await Promise.all([
        getDirectorDetails(data),
        getActorsDetails(data),
    ]);
    const movieData = {
        genres: getGenresNameAndDescription(data.genres),
        title: data.title,
        release_date: data.release_date,
        description: data.overview,
        directors: director,
        imageUrl: `${imagePath}${data.poster_path}`,
        actors: actors,
    };
    return console.log(movieData);
};

// Fetch director details
const getDirectorDetails = async (data) => {
    const director = data.credits.crew
        .filter((item) => item.job === 'Director')
        .map((item) => getPersonById(item.id));
    return Promise.all(director);
};

// Fetch actors details
const getActorsDetails = async (data) => {
    const actor = data.credits.cast
        .filter(
            (item) => item.order < 3 && item.known_for_department === 'Acting'
        )
        .map((item) => getPersonById(item.id));

    return Promise.all(actor);
};

// Append to the genres a description
const genres = [
    {
        genre_name: 'Action',
        genre_description:
            'Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats. The genre tends to feature a mostly resourceful hero struggling against incredible odds, which include life-threatening situations, a dangerous villain, or a pursuit which usually concludes in victory for the hero.',
    },
    {
        genre_name: 'Adventure',
        genre_description:
            'An adventure film is a form of adventure fiction, and is a genre of film. Subgenres of adventure films include swashbuckler films, pirate films, and survival films. Adventure films may also be combined with other film genres such as action, comedy, drama, fantasy, science fiction, family, horror, war, or the medium of animation',
    },
    {
        genre_name: 'Animation',
        genre_description:
            'Animation is the method that encompasses myriad filmmaking techniques, by which still images are manipulated to create moving images. In traditional animation, images are drawn or painted by hand on transparent celluloid sheets (cels) to be photographed and exhibited on film. Animation has been recognized as an artistic medium, specifically within the entertainment industry. Many animations are computer animations made with computer-generated imagery (CGI). Stop motion animation, in particular claymation, has continued to exist alongside these other forms.',
    },
    {
        genre_name: 'Comedy',
        genre_description:
            'A comedy film is a category of film which emphasizes on humor. These films are designed to make the audience laugh in amusement. Films in this style traditionally have a happy ending. Comedy is one of the oldest genres in the film and it is derived from classical comedy in theatre.',
    },
    {
        genre_name: 'Crime',
        genre_description:
            'Crime films, in the broadest sense, is a film genre inspired by and analogous to the crime fiction literary genre. Films of this genre generally involve various aspects of crime and its detection.',
    },
    {
        genre_name: 'Documentary',
        genre_description:
            'A documentary film or documentary is a non-fictional motion-picture intended to "document reality, primarily for the purposes of instruction, education or maintaining a historical record". Bill Nichols has characterized the documentary in terms of "a filmmaking practice, a cinematic tradition, and mode of audience reception [that remains] a practice without clear boundaries".',
    },
    {
        genre_name: 'Drama',
        genre_description:
            "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.[1] The drama of this kind is usually qualified with additional terms that specify its particular super-genre, macro-genre, or micro-genre,[2] such as soap opera, police crime drama, political drama, legal drama, historical drama, domestic drama, teen drama, and comedy-drama (dramedy). These terms tend to indicate a particular setting or subject matter, or they combine a drama's otherwise serious tone with elements that encourage a broader range of moods. To these ends, a primary element in a drama is the occurrence of conflict—emotional, social, or otherwise—and its resolution in the course of the storyline",
    },
    {
        genre_name: 'Family',
        genre_description:
            "A children's film, or family film, is a film genre that contains children or relates to them in the context of home and family. Children's films are made specifically for children and not necessarily for a general audience, while family films are made for a wider appeal with a general audience in mind.",
    },
    {
        genre_name: 'Fantasy',
        genre_description:
            'Fantasy films are films that belong to the fantasy genre with fantastic themes, usually magic, supernatural events, mythology, folklore, or exotic fantasy worlds. The genre is considered a form of speculative fiction alongside science fiction films and horror films, although the genres do overlap.[1] Fantasy films often have an element of magic, myth, wonder, escapism, and the extraordinary.',
    },
    {
        genre_name: 'History',
        genre_description:
            ' Historical films are work set in a past time period, usually used in the context of film and television, which presents historical events and characters with varying degrees of fictional elements such as creative dialogue or fictional scenes which aim to compress separate events or illustrate a broader factual narrative. The biographical film is a type of historical drama which generally focuses on a single individual or well-defined group. Historical dramas can include romances, adventure films, and swashbucklers',
    },
    {
        genre_name: 'Horror',
        genre_description:
            'Horror is a film genre that seeks to elicit fear or disgust in its audience for entertainment purposes. Horror films often explore dark subject matter and may deal with transgressive topics or themes. Broad elements include monsters, apocalyptic events, and religious or folk beliefs. Horror films have existed for more than a century.',
    },
    {
        genre_name: 'Music',
        genre_description:
            'Musical film is a film genre in which songs by the characters are interwoven into the narrative, sometimes accompanied by dancing. The songs usually advance the plot or develop the film\'s characters, but in some cases, they serve merely as breaks in the storyline, often as elaborate "production numbers".',
    },
    {
        genre_name: 'Mystery',
        genre_description:
            'A mystery film is a genre of film that revolves around the solution of a problem or a crime. It focuses on the efforts of the detective, private investigator or amateur sleuth to solve the mysterious circumstances of an issue by means of clues, investigation, and clever deduction. By 2022, mystery films are generally referred to as detective fiction.',
    },
    {
        genre_name: 'Romance',
        genre_description:
            'Romance films involve romantic love stories recorded in visual media for broadcast in theatres or on television that focus on passion, emotion, and the affectionate romantic involvement of the main characters. Typically their journey through dating, courtship or marriage is featured. These films make the search for romantic love the main plot focus.',
    },
    {
        genre_name: 'Science Fiction',
        genre_description:
            'Science fiction (or sci-fi) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, dinosaurs, mutants, interstellar travel, time travel, or other technologies. Science fiction films have often been used to focus on political or social issues, and to explore philosophical issues like the human condition',
    },
    {
        genre_name: 'TV Movie',
        genre_description:
            'A television film, alternatively known as a television movie, made-for-TV film/movie, telefilm, telemovie or TV film/movie, is a feature-length film that is produced and originally distributed by or to a television network, in contrast to theatrical films made for initial showing in movie theaters, and direct-to-video films made for initial release on home video formats. In certain cases, such films may also be referred to and shown as a miniseries, which typically indicates a film that has been divided into multiple parts or a series that contains a predetermined, limited number of episodes',
    },
    {
        genre_name: 'Thriller',
        genre_description:
            "Thriller film, also known as suspense film or suspense thriller, is a broad film genre that evokes excitement and suspense in the audience.[1] The suspense element found in most films' plots is particularly exploited by the filmmaker in this genre. Tension is created by delaying what the audience sees as inevitable, and is built through situations that are menacing or where escape seems impossible",
    },
    {
        genre_name: 'War',
        genre_description:
            'War film is a film genre concerned with warfare, typically about naval, air, or land battles, with combat scenes central to the drama.[1][2] Themes explored include combat, survival and escape, camaraderie between soldiers, sacrifice, the futility and inhumanity of battle, the effects of war on society, and the moral and human issues raised by war. The stories told may be fiction, historical drama, or biographical',
    },
    {
        genre_name: 'Western',
        genre_description:
            'The Western is a genre of fiction typically set in the American frontier between the California Gold Rush of 1849 and the closing of the frontier in 1890, and commonly associated with folk tales of the Western United States, particularly the Southwestern United States, as well as Northern Mexico and Western Canada.',
    },
];

// Get genre name and description
const getGenresNameAndDescription = (data) => {
    const displayGenre = [];
    data.forEach((item) => {
        const matchGenre = genres.find(
            (genre) => genre.genre_name === item.name
        );
        if (matchGenre) {
            displayGenre.push({
                genre_name: matchGenre.genre_name,
                genre_description: matchGenre.genre_description,
            });
        }
    });
    return displayGenre;
};

//Create a random number betwenn 1 to 1000 to get movies

const getRandomNumber = (movies) => {};
