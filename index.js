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
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
    flags: 'a',
});

//Configuration
const PORT = process.env.PORT || 8000;
const secrets = require('./secret.json');
let allowedOrigins = [
    `http://localhost:8000`,
    'https://popcornhub-api.onrender.com/',
];

//Middlewares
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                let message = `The CORS policy for this application doesn't allow access from origin ${origin}`;
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
        await Movie.find()
            .then(movies => {
                res.status(201).json(movies);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Error retrieving all movies: ${err}`);
            });
    }
);

// Get movies by title
app.get(
    '/movies/:title',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movie.findOne({ title: req.params.title })
            .then(movie => {
                !movie
                    ? res.status(400).send(`Movie doesn't exists`)
                    : res.status(201).json(movie);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(
                    `Error in retrieving movie by title ${err}`
                );
            });
    }
);

// Get movie by genre's name
app.get(
    '/movies/genre/:genreName',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movie.findOne({ 'genre.name': req.params.genreName })
            .then(movie => {
                !movie
                    ? res.status(400).send("Movie by that genre doesn't exists")
                    : res.status(201).json(movie.genre);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Error retrieving movie by genre: ${err}`);
            });
    }
);

// Get movie by director
app.get(
    '/movies/director/:directorName',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movie.findOne({ 'director.name': req.params.directorName })
            .then(movie => {
                !movie
                    ? res.status(400).send(`Director doesn't exist`)
                    : res.status(201).json(movie.director);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Error retrieving directors name`);
            });
    }
);

//Get a user by username
app.get(
    '/users/:username',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await User.findOne({ username: req.params.username })
            .then(user => {
                console.log('user', user);
                !user
                    ? res
                          .status(400)
                          .send(`User: ${req.params.username} doesn't exist.`)
                    : res.status(200).json(user);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Error getting Username: ${err}`);
            });
    }
);

// Add new user
app.post(
    '/users',
    [
        check('username', 'Username is required')
            .isLength({ min: 5 })
            .withMessage('User should be at least 5 characters long'),
        check(
            'username',
            'Username contains non alphanumeric characters - not allowed'
        ).isAlphanumeric(),
        check('password', 'Password is required')
            .not()
            .isEmpty()
            .withMessage('Password is required'),
        check(
            'password',
            'Password must be at at least 8 characters long'
        ).isLength({ min: 8 }),
        check('email', 'Email does not appear to be valid').isEmail(),
    ],
    async (req, res) => {
        // check the validation object for erros
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            //status code 422 - unprocessable content
            return res.status(422).json({ errors: errors.array() });
        }
        const hashedPassword = User.hashPassword(req.body.password);
        await User.findOne({ username: req.body.username })
            .then(user => {
                if (user) {
                    return res
                        .status(400)
                        .send(`${req.body.username} already exists.`);
                } else {
                    User.create({
                        username: req.body.username,
                        password: hashedPassword,
                        email: req.body.email,
                        birthday: req.body.birthday,
                    })
                        .then(user => res.status(201).json(user))
                        .catch(err => {
                            console.error(err);
                            res.status(500).send(`Error: ${err}`);
                        });
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    }
);

// Update user information
app.put(
    '/users/:username',
    [
        check('username', 'Username is required')
            .isLength({ min: 5 })
            .withMessage('User should be at least 5 characters long'),
        check(
            'username',
            'Username contains non alphanumeric characters - not allowed'
        ).isAlphanumeric(),
        check('password', 'Password is required')
            .notEmpty()
            .withMessage('Password is required'),
        check(
            'password',
            'Password must be at at least 8 characters long'
        ).isLength({ min: 8 }),
        check('email', 'Email does not appear to be valid').trim().isEmail(),
    ],
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        //handle errors of validation
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            //status code 422 - unprocessable content
            return res.status(422).json({ errors: errors.array() });
        }
        if (req.user.username !== req.params.username) {
            return res.status(400).send('Permission denied');
        }
        await User.findOneAndUpdate(
            { username: req.params.username },
            {
                $set: {
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    birthday: req.body.birthday,
                },
            },
            { new: true }
        )
            .then(user => {
                res.status(201).json(user);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Error updating user information: ${err}`);
            });
    }
);

// Users add movie to favorite list
app.post(
    '/users/:username/movies/:movieID',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await User.findOneAndUpdate(
            {
                username: req.params.username,
                favoriteMovies: { $ne: req.params.movieID },
            },
            { $addToSet: { favoriteMovies: req.params.movieID } },
            { new: true }
        )
            .then(user => {
                !user
                    ? res
                          .status(400)
                          .send(`Movie is already in the favorite list`)
                    : res.json(user);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(
                    `Error adding movie to favorite list: ${err}`
                );
            });
    }
);

// Users remove movie from favorite list
app.delete(
    '/users/:username/movies/:movieID',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await User.findOneAndUpdate(
            { username: req.params.username },
            { $pull: { favoriteMovies: req.params.movieID } },
            { new: true }
        )
            .then(user => {
                !user
                    ? res.status(400).send(`Movie is not in the list`)
                    : res.json(user);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(
                    `Error adding movi to removing list: ${err}`
                );
            });
    }
);

// Remove user
app.delete(
    '/users/:username',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await User.findOneAndRemove({ username: req.params.username })
            .then(user => {
                !user
                    ? res.status(400).send(`${req.params.username} not found`)
                    : res.status(200).json(user);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(`Error in deleting user: ${err}`);
            });
    }
);

// Error handlings for every request. It must go at the very end
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is wrong!');
});

// Calling the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running in port ${PORT}...`);
});
