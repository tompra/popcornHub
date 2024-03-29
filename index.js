/**
 * Express app for Popcornhub API
 */

// Imported required libraries and modules
const express = require('express');
const app = express();
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { User, Movie } = require('./models.js');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const secrets = require('./secret.json');
const bycrpt = require('bcrypt');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
    flags: 'a',
});

// @middleware
/**
 * Middleware for handling CORS (Cross-Origin Resource Sharing)
 * @callback corsMiddleware
 * @param {string} origin - Origin URL of the incoming request
 * @param {function} callback - Callback function
 * @return {function} - Callback fucntion indicating whether the origin is allowed
 */

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const message = `The CORS policy for this application doesn't allow access from origin ${origin}`;
                return callback(new Error(message), false);
            }
            return callback(null, true);
        },
    })
);
// Body parse middleware to parse JSON and URL encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Morgan middleware for logging HTTP requests
app.use(morgan('combined', { stream: accessLogStream }));

// Passport authentication configuration
const auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

//@database
//Connect to the database
mongoose.connect(process.env.CONNECTION_URI || secrets.CONNECTION_URI_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Retrieving static files
app.use(express.static('public'));

// Endpoints

// @route GET /
// Getting response for the default endpoint
/**
 * Default endpoint route
 * @name GET-/
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/', (req, res) => {});

// Get all movies
/**
 * Route to GET all movies
 * @name GET-/movies
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested movies is complete.
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The array of all movies data in the database
 */
app.get(
    '/movies',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const movies = await Movie.find();
            res.status(200).json(movies);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error retrieving all movies: ${err}`);
        }
    }
);

// Get movies by title
/**
 * Route to GET movie by title
 * @name GET-/movies/:title
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested movies is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the specific movie data in the database
 */
app.get(
    '/movies/:title',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { title } = req.params;
            const movieTitle = await Movie.findOne({ title: title });
            !movieTitle
                ? res.status(400).send(`Movie doesn't exist.`)
                : res.status(200).json(movieTitle);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error in retrieving movie by title ${err}`);
        }
    }
);

// Get movie by genre's name
/**
 * Route to GET specific genre by name
 * @name GET-/movies/genre/:genreName
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested genre is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the genre data in the database
 */
app.get(
    '/movies/genre/:genreName',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { genreName } = req.params;
            const movieGenre = await Movie.findOne({ 'genre.name': genreName });
            !movieGenre
                ? res.status(400).send(`Movie by ${genreName} doesn't exist`)
                : res.status(200).json(movieGenre.genre);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error retrieving movie by genre: ${err}`);
        }
    }
);

// Get movie by director
/**
 * Route to GET specific director by name
 * @name GET-/movies/director/:directorsName
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested genre is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the director data in the database
 */
app.get(
    '/movies/director/:directorName',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { directorName } = req.params;
            const movieDirector = await Movie.findOne({
                'director.name': directorName,
            });
            !movieDirector
                ? res
                      .status(400)
                      .send(`Director by ${directorName} doesn't exist`)
                : res.status(200).json(movieDirector.director);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error retrieving directors name: ${err}`);
        }
    }
);

//Get a user by username
/**
 * Route to GET specific user by name
 * @name GET-/users/:username
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested genre is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the user data in the database
 */
app.get(
    '/users/:username',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { username } = req.params;
            const user = User.findOne({ username: username });
            !user
                ? res.status(400).send(`User: ${username} doesn't exist.`)
                : res.status(200).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error getting Username: ${err}`);
        }
    }
);

// Check for validation for user data
/**
 * Validation for user data
 * @name validateUserData
 * @type {Array}
 */
const validateUserData = [
    check('username', 'Username is required')
        .isLength({ min: 5 })
        .withMessage('User should be at least 5 characters long'),
    check(
        'username',
        'Username contains non-alphanumeric characters - not allowed'
    ).isAlphanumeric(),
    check('password', 'Password is required')
        .not()
        .isEmpty()
        .withMessage('Password is required'),
    check('password', 'Password must be at least 8 characters long').isLength({
        min: 8,
    }),
    check('email', 'Email does not appear to be valid').isEmail(),
];

// Add new user
/**
 * Route to POST a new user
 * @name POST-/users
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the user created is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the user data sent in the response.
 */
app.post('/users', validateUserData, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    try {
        const { username, password, email, birthday } = req.body;
        const hashedPassword = User.hashPassword(password);
        const user = await User.findOne({ username: username });
        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            birthday,
        });
        user
            ? res.status(400).send(`${username} already exist.`)
            : res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error creating new user`);
    }
});

// Users add movie to favorite list
/**
 * @name POST-/users/:username/movies/:movieID
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested genre is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the user data updating the added movie sent in the response.
 */
app.post(
    '/users/:username/movies/:movieID',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { username } = req.params;
            const { movieID } = req.params;
            const addMovie = await User.findOneAndUpdate(
                { username: username, favoriteMovies: { $ne: movieID } },
                { $addToSet: { favoriteMovies: movieID } },
                { new: true }
            );
            !addMovie
                ? res
                      .status(400)
                      .send(`Movie ${movieID} is already in the favorite list`)
                : res.status(201).json(addMovie);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error adding movie to favorite list: ${err}`);
        }
    }
);

// Update user information
/**
 * @name PUT-/users/:username
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested genre is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the user data updating the information sent in the response.
 */
app.put(
    '/users/:username',
    validateUserData,
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        console.log('PUT request received');
        console.log('Request body:', req.body);
        // const errors = validationResult(req);
        // if (!errors.isEmpty())
        //     return res.status(422).json({ errors: errors.array() });
        console.log(req.user, 'req.user.username');
        console.log(req.params.username, 'req.params.username');
        if (req.user.username !== req.params.username) {
            console.log('different username of params');
            return res.status(400).send('Permission denied');
        }
        try {
            const { username, password, email, birthday } = req.body;
            const saltRounds = 10;
            const hashedPassword = await bycrpt.hash(password, saltRounds);
            const updateUser = await User.findOneAndUpdate(
                { username: req.params.username },
                {
                    $set: {
                        username: username,
                        password: hashedPassword,
                        email: email,
                        birthday: birthday,
                    },
                },
                { new: true }
            );
            console.log('Update user:', updateUser);
            res.status(200).json(updateUser);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error updating user information: ${err}`);
        }
    }
);

// Users remove movie from favorite list
/**
 * @name DELETE-/users/:username/movies/:movieID
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested genre is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the user data deleting the movie sent in the response.
 */
app.delete(
    '/users/:username/movies/:movieID',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { username } = req.params;
            const { movieID } = req.params;
            const removeMovie = await User.findOneAndUpdate(
                { username: username },
                { $pull: { favoriteMovies: movieID } },
                { new: true }
            );
            !removeMovie
                ? res.status(400).send(`Movie: ${movieID} is not in the list`)
                : res.status(201).json(removeMovie);
        } catch (err) {
            console.error(err);
            res.status(500).send(
                `Error removing from the favorite list: ${err}`
            );
        }
    }
);

// Remove user
/**
 * @name DELETE-/users/:username
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - A promise that resolves when the requested genre is complete
 * @throws {Error} - If there is an error during the process
 * @returns {Object} - The object of the user data deleted sent in the response.
 */
app.delete(
    '/users/:username',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { username } = req.params;
            const removeUser = await User.findOneAndRemove({
                username: username,
            });
            !removeUser
                ? res.status(400).send(`${username} not found`)
                : res.status(201).json(removeUser);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error in deleting user: ${err}`);
        }
    }
);

// Error handlings for every request.
/**
 * Error handling for request.
 * @function
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next function
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is wrong!');
});

//Configuration
// Define the port for the server to listen
const PORT = process.env.PORT || 8000;

// Define the allowed origins for CORS
const allowedOrigins = [
    'http://localhost:8000',
    'https://popcornhub-api.onrender.com/',
    'http://localhost:1234',
    'http://localhost:5173',
    'http://localhost:4200',
    'https://cinematix.netlify.app',
    'https://tompra.github.io',
    'https://tompra.github.io/filmify/',
];

// Start the server
/**
 * Start the server and listen to the specific port
 * @name listen
 * @function
 * @param {number} PORT - The port number to listen
 * @param {string} '0.0.0.0' - The IP address
 * @param {function} callback - Callback to execute once the server is running
 */
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running in port ${PORT}...`);
});
