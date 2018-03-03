const request = require('request');
const mongo = require('./mongodb');
const pReflect = require('p-reflect');

exports.addDiscounts = function (callback) {
  console.log('Updating Discounts ...');
  mongo.getAllRestaurants().then(function (data) {
    const promises = [];

    for (var i in data) {
      promises.push(searchAutoRestaurant(data[i]));
    }
    return Promise.all(promises.map(pReflect));
  }).then(result => {
    let restaurants = result.filter(x => x.isFulfilled).map(x => x.value);
    const promises2 = [];

    //The restaurants found on lafourchette are storred in the mongo databasewith their discount
    for (var r in restaurants) {
      promises2.push(mongo.updateDiscount(restaurants[r].idLaFourchette, restaurants[r].discount, restaurants[r].name, new Date()));
    }

    return Promise.all(promises2.map(pReflect));
  }).then((res) => {
    callback(null, res);
  }).catch((err) => {
    callback(err);
  });
};

/** Search with autocomplete mobile API
 * @param {object} currentRestaurant - The Restaurant (coming from the michelins' website) we are looking for on lafourchettes' website
 **/
function searchAutoRestaurant (currentRestaurant) {
  return new Promise(function (resolve, reject) {
    let name = escape(encodeURIComponent(currentRestaurant.name));

    //the query doesn't work if it's too long so we check if the name is bigger than 49
    if (name.length > 49) {
      //if it is we short the name
      name = name.substring(0, 50);
    }

    const url = 'https://m.lafourchette.com/api/restaurant-prediction?name=' + name;

    getRestaurant(url).then(function (restaurants) {
      return findRestaurant(currentRestaurant, restaurants, currentRestaurant.address.zipcode);
    }).then(function (restaurant) {
      return getDescrciption(restaurant);
    }).then(function (data) {
      resolve(data);
    }).catch(function (err) {
      reject(err);
    });
  });
}
/** Gets all the restaurants available on lafourchette.com from a get http request (auto complete)
 * @param {string} url - the url to make the resquest from.
 */
function getRestaurant (url) {
  return new Promise(function (resolve, reject) {
    const config = {
      'uri': url,
      'headers': {
        'cookie': 'datadome=AHrlqAAAAAMAKsjo1_t5VGEALtotww'
      }
    };

    request.get(config, function (err, res, body) {
      if (err) {
        reject(new Error('GET Restaurant error:' + err));
      }
      let restaurants = JSON.parse(body);

      resolve(restaurants);
    });
  });
}

/** Finds the right restaurant corresponding to his zipcode in an array of restaurants
 * @param {object} current - Current restaurant coming from michelin database
 * @param {objects} restaurants - Array of restaurant found on lafourchette.com for a specific name
 * @param {string} zipcode - The zipcode of the restaurant we're looking for
 */
function findRestaurant (current, restaurants, zipcode) {
  return new Promise(function (resolve, reject) {
    //if no restaurant corresponding to the name were found we throw an error
    if (restaurants.length <= 0) {
      reject(new Error('Looking for a restaurant: No restaurant were found'));
    } else {
      //We look in the results from the search by name which resturant we're looking for with his zipcode
      const restaurant = restaurants.find(function (res) {
        return res.address.postal_code === zipcode;
      });

      //if no restaurant in the list is corresponding to the zipcode we throw an error
      if (restaurant === null) {
        reject(new Error('Looking for a restaurant: No restaurant are corresponding to zipcode'));
      }

      //If we find a corresponding restaurant we save his id on idLaFourchette website
      current.idLaFourchette = restaurant.id;
      resolve(current);
    }
  });
}

/** Get the information on the disconts available for a specific restaurant
 * @param {object} currentRestaurant - The current restaurant we are looking a discount for
 */
function getDescrciption (currentRestaurant) {
  return new Promise(function (resolve, reject) {
    let id = currentRestaurant.idLaFourchette;
    const url = `https://m.lafourchette.com/api/restaurant/${id}/sale-type`;
    const config = {
      'uri': url,
      'headers': {
        'cookie': 'datadome=AHrlqAAAAAMAKsjo1_t5VGEALtotww'
      }
    };

    request.get(config, function (err, res, body) {
      if (err) {
        reject(err);
      }
      currentRestaurant.discount = JSON.parse(body);
      resolve(currentRestaurant);
    });
  });
}
