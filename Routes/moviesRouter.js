const express = require('express')
const moviesCon = require('../Controllers/moviesControllers.js');

//HTTP Requests

const moviesRouter = express.Router();

//moviesRouter.param('id',moviesCon.checkID);
moviesRouter.route('/highest-rated').get(moviesCon.highestRated,moviesCon.getAllMovies);

moviesRouter.route('/movie-stats').get(moviesCon.getStats);
moviesRouter.route('/movie-genre/:genre').get(moviesCon.getGenre);
moviesRouter.route('/')
    .get(moviesCon.getAllMovies)      
    .post(moviesCon.addMovie)
//

moviesRouter.route('/:id')
    .get(moviesCon.getMovie)
    .patch(moviesCon.updateMovie)
    .delete(moviesCon.deleteMovie);
//

module.exports = moviesRouter