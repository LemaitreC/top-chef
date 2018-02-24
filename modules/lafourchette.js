const request = require('request')
const mongo = require('./mongodb')
const pMap = require('p-map')
const pReflect = require('p-reflect')
const cheerio = require('cheerio')

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

/* Search by autocomplete */
function searchAutoRestaurant(currentRestaurant) {
  return new Promise(function(resolve, reject) {
    name = escape(encodeURIComponent(currentRestaurant.name))
    //the query doesn't work if it's too long so we check if the name is bigger than 49
    if (name.length > 49) {
      //if it is we short the name
      name = name.substring(0, 50)
    }
    const url = `https://m.lafourchette.com/api/restaurant-prediction?name=` + name;
    getRestaurant(url).then(function(restaurants) {
      return findRestaurant(currentRestaurant, restaurants, currentRestaurant.address.zipcode)
    }).then(function(restaurant) {
      return getDescrciption(restaurant)
    }).then(function(data) {
      resolve(data)
      console.log("ee")
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
    const config = {
      'uri': url,
      'headers': {
        'cookie': 'datadome=AHrlqAAAAAMAKsjo1_t5VGEALtotww'
      }
    }
    request.get(config, function(err, res, body) {
      if (err) reject(err)
      restaurants = JSON.parse(body)
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
    console.log("current :")
    // console.log(current)
    // console.log(zipcode)
    //console.log(restaurants)
    if (restaurants.length <= 0) {
      reject(new Error("Error : No restaurant were found"))
    } else {
      const restaurant = restaurants.find(function(restaurant) {
        return restaurant.address.postal_code === zipcode
      })


      if (restaurant == null) {
        console.log("no match")
        reject(new Error("Error : No restaurant are corresponding to zipcode"))}
      console.log(restaurant)
      current.idLaFourchette = restaurant.id
      resolve(current)
    }
  })
}

/** Get the information on the disconts available for a specific restaurant
 * @param {object} currentRestaurant - The current restaurant we are looking a discount for
 */
function getDescrciption(currentRestaurant) {
  return new Promise(function(resolve, reject) {
    let id = currentRestaurant.idLaFourchette
    const url = `https://m.lafourchette.com/api/restaurant/${id}/sale-type`
    const config = {
      'uri': url,
      'headers': {
        'cookie': 'datadome=AHrlqAAAAAMAKsjo1_t5VGEALtotww'
      }
    }
    request.get(config, function(err, res, body) {
      if (err) reject(err)
       console.log(body)
      currentRestaurant.discount = JSON.parse(body)
      resolve(currentRestaurant)
    })
  })
}


exports.addDiscounts = function(callback) {
  mongo.getAllRestaurants().then(function(data) {

    const promises = []
    let restaurants
    let other
    data.forEach(function(restaurant) {
      promises.push(searchAutoRestaurant(restaurant))
    })

    return Promise.all(promises.map(pReflect))
  }).then((result) => {
    restaurants = result.filter(x => x.isFulfilled).map(x => x.value)
    other = result.filter(x => x.isRejected).map(x => x.value)
    const promises2 = []
    promises2.push(restaurants)
    promises2.push(other)
    for (var r in restaurants) {
      promises2.push(mongo.updateDiscount(restaurants[r].idLaFourchette, restaurants[r].discount, restaurants[r].name))
    }

    return pMap(promises2, pReflect, {
      concurrency: 100
    })
    // return result
  }).then((res) => {
    //  console.log(restaurants.length)
    console.log(res)

    callback(null, res)
  }).catch((err) => {
    ///console.log(err)
    callback(err)
  })
}
