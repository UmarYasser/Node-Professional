const ApiFeatures = require('./../Utils/ApiFeatures')
const Movie = require('./../Models/movieModel');
const {asyncErHandler} = require('./GlobalErrorHandler');
const CustomError=  require('./../Utils/CustomError')
//middleware ==> getAllMovies(moviesCon.highestRated,moviesCon...)


const highestRated = (req,res,next) =>{ 
  req.query.limit = '5';
  req.query.sort = '-rating'
  next();
}
const getAllMovies =asyncErHandler(async(req, res,next) =>{
    let features  = new ApiFeatures(Movie.find(),req.query).filter().sort().fields().paginate()
    // Execute the query
    const movies = await features.query;

    // Response
    res.status(200).json({
      status: 'success',
      count: movies.length,
      data: {
        movies,
      },
    });  
})

const getMovie = asyncErHandler( async(req,res,next)=>{
  let features  = new ApiFeatures(Movie.findById(req.params.id),req.query).filter().fields()
  
  const movie = await features.query
  if(!movie){
    const err = new CustomError('No Movie with that ID was found',404)
    return next(err)
  }
  
  res.status(200).json({
    status:'success',
    data:{
      movie
    }
    })
})

const addMovie = asyncErHandler( async(req,res,next)=>{
  const addedMovie = await Movie.create(req.body)
    res.status(201).json({
      status:'success',
      data:{
        addedMovie
      }
    }) 
})

const updateMovie = asyncErHandler( async(req,res,next) =>{
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});

  if(!updatedMovie){
    return next(new CustomError('No Movie with that ID was found..',404))
  }
    res.status(201).json({
      status:'success',
      data: {
        updatedMovie
      }
    })
})

const deleteMovie = asyncErHandler (async(req,res,next)=>{
   const deletedMovie = await Movie.findByIdAndDelete(req.params.id);   
    if(!deletedMovie){
      console.log(`Can't find movie with ID ${req.params.id}`)
      return next(new CustomError('No Moive with that ID was found',404))
    }  
    console.log('Movie Deleted!')
  res.status(200).json({
    status:'success',
    data: null
  })
  
})

const getStats = asyncErHandler( async(req,res) =>{
  const stats = await Movie.aggregate([
    {$match : {rating : 8.7}},
    {$group :{
        _id:'null',
        avgprice: {$avg: '$price'},
        minprice: {$min: '$price'},
        maxprice: {$max: '$price'},
        totalprice: {$sum: '$price'},
        totalmovies: {$sum: 1}        
    }}
  ])
  res.status(200).json({
    status:'success',
    count:stats.length,
    data:{
      stats
  }
})
})
const getGenre = asyncErHandler( async(req,res) => {
  const genre = req.params.genre;
  const result = await Movie.aggregate([
    {$unwind:'$genres'},
    {$group: {
      _id:'$genres',
      movies:{$push: '$name'},
      moviesCount: {$sum:1}
    }},
    {$addFields:{genre: '$_id'}},
    {$project : {_id : 0}},
    {$sort : {moviesCount: 1}},
    {$match: {genre:genre}}
  ])
        res.status(200).json({
      status:'success',
      count:result.length,
      data:{
        result
      }   
    })

})

module.exports = {
  highestRated,
  getAllMovies,
  getMovie,
  addMovie,
  updateMovie,
  deleteMovie,
  getStats,
  getGenre
}