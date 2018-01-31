const request = require('request')

/** Gets all the restaurants available on lafourchette.com for a specific name
 * @param {string} name - name/keyword of the restaurant we're looking for
 * @param {string} zipcode - The zipcode of the restaurant we're looking for
 * @param   {function} callback - Returned callback.
 */
exports.matchRestaurant = function(name, zipcode, callback) {
  name = name.replace(" ", "%20")
  const url = `https://www.lafourchette.com/recherche/autocomplete?searchText=${name}`;

  console.log(url)
  getRestaurant(url).then(function(restaurants) {
    return findRestaurant(restaurants, zipcode)
  }).then(function(id_restaurant) {
    return getDescrciption(id_restaurant)
  }).then(function(data) {
    return callback(null, data)
  }).catch(function(err) {
    return callback(new Error(err))
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
 * @param {objects} restaurants - Array of restaurant found on lafourchette.com for a specific name
 * @param {string} zipcode - The zipcode of the restaurant we're looking for
 */
function findRestaurant(restaurants, zipcode) {
  return new Promise(function(resolve, reject) {
    if (restaurants.length <= 0) reject("Error : No restaurant were found")
    var restaurant = restaurants.find(function(restaurant) {
      return restaurant.zipcode === zipcode
    })
    if (restaurant == null) reject("Error : No restaurant are corresponding")
    resolve(restaurant.id_restaurant)
  })
}

/** Get the information on the disconts available for a specific restaurant
 * @param {number} id - The id of the restaurant on lafourchette.com
 */
function getDescrciption(id) {
  return new Promise(function(resolve, reject) {
    const url = `https://www.lafourchette.com/reservation/module/date-list/${id}`
    request.get(url, function(err, res, body) {
      if (err) reject(err)
      data = JSON.parse(body).data.bestSaleTypeAvailable
      resolve(data)
    })
  })
}
