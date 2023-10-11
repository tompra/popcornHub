const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

let movieSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre: {
        name: String,
        description: String
    },
    director:{
        name: String,
        bio: String,
        birth: Date,
        death: Date
    },
    actors: [String],
    imagePath: String,
    featured: Boolean
})

let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    birthday: Date,
    favoriteMovies:[{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
})

userSchema.statics.hashPassword = (pwd) => {
    return bcrypt.hashSync(pwd, 10);
}

userSchema.methods.validatePassword = function(pwd) {
    return bcrypt.compareSync(pwd, this.password)
}

let Movie = mongoose.model('Movie', movieSchema)
let User = mongoose.model('User', userSchema)

module.exports.Movie = Movie;
module.exports.User = User;