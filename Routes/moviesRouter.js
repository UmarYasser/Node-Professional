const express = require('express')
const moviesCon = require('../Controllers/moviesControllers.js');
const authCon = require('./../Controllers/authController.js');
//HTTP Requests

const moviesRouter = express.Router();

//moviesRouter.param('id',moviesCon.checkID);
moviesRouter.route('/highest-rated').get(moviesCon.highestRated,moviesCon.getAllMovies);

moviesRouter.route('/movie-stats').get(authCon.protect,moviesCon.getStats);
moviesRouter.route('/movie-genre/:genre').get(authCon.protect,moviesCon.getGenre);
moviesRouter.route('/')
    .get(/*authCon.protect,*/moviesCon.getAllMovies)      
    .post(authCon.protect,authCon.restrict('admin'),moviesCon.addMovie) // for admins
//

moviesRouter.route('/:id')
    .get(authCon.protect,moviesCon.getMovie)
    .patch(authCon.protect,authCon.restrict('admin'),moviesCon.updateMovie)// for admins
    .delete(authCon.protect,authCon.restrict('admin','test'),moviesCon.deleteMovie);// for admins
//

module.exports = moviesRouter