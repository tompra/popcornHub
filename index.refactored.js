const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User, Movie } = require("./models.js");
const cors = require("cors");
const passport = require("passport");
const { check, validationResult } = require("express-validator");
const auth = require("./auth.js")(app);

const app = express();
const PORT = process.env.PORT || 8000;
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
const allowedOrigins = [
  "http://localhost:8000",
  "https://popcornhub-api.onrender.com/",
];

// Middleware Configurations
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
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));
app.use(passport.initialize());

require("./passport.js");

// Database Connection
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get("/", (req, res) => {
  // Code for the default endpoint can be added here.
});

// More organized and logical groupings of the routes
// Movie routes
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);
app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);
app.get(
  "/movies/director/:directorsName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);

// User routes
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);
app.post("/users", [...checks], async (req, res) => {
  /* ... */
});
app.put(
  "/users/:Username",
  [...checks],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* ... */
  }
);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something is wrong!");
});

// Server Initialization
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}...`);
});
