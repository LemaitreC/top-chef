const request = require('request')
const mongo = require('./mongodb')
const pMap = require('p-map')
const pReflect = require('p-reflect')


/** Gets all the restaurants available on lafourchette.com for a specific name
 * @param {string} name - name/keyword of the restaurant we're looking for
 * @param {string} zipcode - The zipcode of the restaurant we're looking for
 * @param   {function} callback - Returned callback.
 */
// exports.matchRestaurant = function(name, zipcode, callback) {
//   name = name.replace(" ", "%20")
//   const url = `https://www.lafourchette.com/recherche/autocomplete?searchText=${name}`;
//
//   console.log(url)
//   getRestaurant(url).then(function(restaurants) {
//     return findRestaurant(restaurants, zipcode)
//   }).then(function(id_restaurant) {
//     return getDescrciption(id_restaurant)
//   }).then(function(data) {
//     return callback(null, data)
//   }).catch(function(err) {
//     return callback(new Error(err))
//   })
// }
function searchAutoRestaurant(currentRestaurant) {
  return new Promise(function(resolve, reject) {
    name = escape(encodeURIComponent(currentRestaurant.name))
    const url = `https://www.lafourchette.com/recherche/autocomplete?searchText=`+name;
    getRestaurant(url).then(function(restaurants) {
      return findRestaurant(currentRestaurant, restaurants, currentRestaurant.address.zipcode)
    }).then(function(restaurant) {
      return getDescrciption(restaurant)
    }).then(function(data) {
       resolve(data)

    }).catch(function(err) {
       reject(err)
    })

  })
}

/** Gets all the restaurants available on lafourchette.com from a get http request (auto complete)
 * @param {string} url - the url to make the resquest from.
 */
function getRestaurant(url) {
  return new Promise(function(resolve, reject) {
    request.get(url, function(err, res, body) {
      if (err) reject(err)
      restaurants = JSON.parse(body).data.restaurants
      resolve(restaurants)
    })
  })
}

/** Finds the right restaurant corresponding to his zipcode in an array of restaurants
 * @param {object} current - Current restaurant coming from michelin database
 * @param {objects} restaurants - Array of restaurant found on lafourchette.com for a specific name
 * @param {string} zipcode - The zipcode of the restaurant we're looking for
 */
function findRestaurant(current, restaurants, zipcode) {
  return new Promise(function(resolve, reject) {
  //console.log(restaurants)
    if (restaurants.length <= 0) reject("Error : No restaurant were found")
    var restaurant = restaurants.find(function(restaurant) {
      return restaurant.zipcode === zipcode
    })
    if (restaurant == null) reject("Error : No restaurant are corresponding to zipcode")
    current.idLaFourchette = restaurant.id_restaurant
    resolve(current)
  })
}

/** Get the information on the disconts available for a specific restaurant
 * @param {object} currentRestaurant - The current restaurant we are looking a discount for
 */
function getDescrciption(currentRestaurant) {
  return new Promise(function(resolve, reject) {
    let id =currentRestaurant.idLaFourchette
    const url = `https://www.lafourchette.com/reservation/module/date-list/${id}`

    request.get(url, function(err, res, body) {
      if (err) reject(err)
      currentRestaurant.discount = JSON.parse(body).data.bestSaleTypeAvailable
      resolve(currentRestaurant)
    })
  })
}

exports.addDiscounts = function(callback) {
  mongo.getAllRestaurants().then(function(data) {

    const promises = []
    data.forEach(function(restaurant) {
      promises.push(searchAutoRestaurant(restaurant))
    })
    Promise.all(promises.map(pReflect)).then(result =>{
      restaurants =  result.filter(x => x.isFulfilled).map(x => x.value)
      callback(null,restaurants)
    })
  })
}
