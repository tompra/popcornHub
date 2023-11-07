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

//Middlewares
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: accessLogStream }));

const auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

//Connect the database
mongoose.connect(process.env.CONNECTION_URI || secrets.CONNECTION_URI_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Retrieving static files
app.use(express.static('public'));

// Getting response for the default endpoint
app.get('/', (req, res) => {});

// Get all movies
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

// Check for validation
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

// Update user information
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

// Users add movie to favorite list
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

// Users remove movie from favorite list
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

// Error handlings for every request. It must go at the very end
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is wrong!');
});

//Configuration
const PORT = process.env.PORT || 8000;
const allowedOrigins = [
    'http://localhost:8000',
    'https://popcornhub-api.onrender.com/',
    'http://localhost:1234',
    'http://localhost:5173',
];

// Calling the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running in port ${PORT}...`);
});
