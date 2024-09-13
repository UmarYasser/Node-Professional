const Movie = require('./../Models/movieModel')
class ApiFeatures{
  constructor(query,queryStr){
    this.query = query;
    this.queryStr = queryStr
  }
  filter(){
    let queryString = JSON.stringify(this.queryStr);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g,(m) => `$${m}`)
   let queryObj = JSON.parse(queryString);
    delete queryObj.sort
    delete queryObj.fields
    delete queryObj.page
    delete queryObj.limit;

    this.query = this.query.find(queryObj)    

    return this;
    //We return the whole instance, to able to chain methods on it like sort(), becatuse a method like sort will only work on the class instances 
  }

  sort(){
    if(this.queryStr.sort){
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy)
    }else{
      this.query  = this.query.sort('createdAt')
    }
    return this;
  }

  fields(){
    if(this.queryStr.fields){
      const fieldsSort = this.queryStr.fields.split(',').join(' ')
      this.query = this.query.select(fieldsSort);
    }else{
      this.query = this.query.select('-__v');
    }
    if(this.queryStr.includeVirtuals === 'true'){
      this.query = this.query.setOptions({virtuals:true});
    }
    return this;
  }

  paginate(){
    const page = this.queryStr.page || 1;
    const limit = this.queryStr.limit || 10;
    const skip = (page-1) * limit;

    if(this.queryStr.page){
      const movieCount = Movie.countDocuments;
      if(skip>=movieCount){
        throw new Error('Nothing to show here!')
      }
    }
    
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
  //class
}

module.exports = ApiFeatures