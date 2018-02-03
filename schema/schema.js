'use strict'
// import the mongoose package
const mongoose = require('mongoose')

const db = {
	user: 'top_chef',
	pass: 'P4ssword'
}

mongoose.connect(`mongodb://${db.user}:${db.pass}@ds223578.mlab.com:23578/top-chef`)


mongoose.Promise = global.Promise
const Schema = mongoose.Schema

//restaurantLinks Schema creation
const restaurants = new Schema({
  name: String,
  stars: String,
  url:String,
  address: String,
  praticalInfo: String,
  transport:  String,
  phone: String,
  websiteUrl: String,
  cuisineType: String,
  price:String,
  grade: {
    average: Number,
    tableQuality: Number,
    service: Number,
    surroundings: Number,
    rateQualityPrice: Number,
    ambiance: Number,
    drinks: Number
  },
  menuLink: String
})

//export this model so it can be used in the application
exports.Restaurants = mongoose.model('Restaurants', restaurants)
