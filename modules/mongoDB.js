const mongo = require('mongodb');

/** Saves all the restaurant into the MLab MongoDB database, updating by removing and then adding the restaurant
  * @param {Array} restaurants - The restaurants to save in the database
 **/
exports.saveRestaurants = (restaurants) => new Promise(function (resolve, reject) {
  mongo.connect('mongodb://top_chef:P4ssword@ds223578.mlab.com:23578/top-chef', function (err1, db) {
    if (err1) {
      reject(err1);
    }

    //First we remove all restaurants
    db.collection('restaurants').remove({}, function (err2, res) {
      if (err2) {
        reject(err2);
      }
      //Then we save all the restaurants
      db.collection('restaurants').insertMany(restaurants, function (error, respond) {
        if (error) {
          reject(error);
        }
        console.log('Number of documents inserted: ' + respond.insertedCount);
        resolve('Number of documents inserted: ' + respond.insertedCount);
        db.close();
      });
    });
  });
});

exports.getAllRestaurants = () => {
  return new Promise(function (resolve, reject) {
    mongo.connect('mongodb://top_chef:P4ssword@ds223578.mlab.com:23578/top-chef', function (err, db) {
      if (err) {
        reject(err);
      }
      db.collection('restaurants').find({}).toArray(function (error, docs) {
        if (error) {
          reject(error);
        }
        resolve(docs);
      });
    });
  });
};

exports.updateDiscount = (id, restDiscount, restaurantName, update) => {
  return new Promise(function (resolve, reject) {
    mongo.connect('mongodb://top_chef:P4ssword@ds223578.mlab.com:23578/top-chef', function (err, db) {
      if (err) {
        reject(err);
      }
      db.collection('restaurants').updateOne({
        'name': restaurantName
      }, {
        '$set': {
          'idLaFourchette': id,
          'discount': restDiscount,
          'lastUpdate': update.toUTCString()
        }
      }, function (error, result) {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  });
};

/** returns all the restaurants having a deal according to specific filters
  * @param {string} filter - Filters to filtrate all the deals.
  * @param {string} stars - Number of stars of the restaurants having a deal.
 **/
exports.getRestaurants = (filter, stars, callback) => {
  mongo.connect('mongodb://top_chef:P4ssword@ds223578.mlab.com:23578/top-chef', function (err, db) {
    if (err) {
      callback(err, null);
    }
    const config = getconfig(stars);

    db.collection('restaurants').find(config).toArray(function (error, docs) {
      if (error) {
        callback(err, null);
      }
      let deals = [];

      for (var i = 0; i < docs.length; i++) {
        for (var j = 0; j < docs[i].discount.length; j++) {
          var restaurant = JSON.parse(JSON.stringify(docs[i]));

          restaurant.discount = docs[i].discount[j];
          if (setFilter(restaurant, filter)) {
            deals.push(restaurant);
          }
        }
      }
      callback(null, deals);
    });
  });
};

/** Returns the mongo parameter to resquest the deals in the database
 * @param {string} stars - The number of stars of the restaurant coresspondign to the deals.
 **/
function getconfig (stars) {
  let config = {};

  config.discount = {
    '$gt': []
  };
  switch (stars) {
  case '1':
    config.stars = 1;
    break;
  case '2':
    config.stars = 2;
    break;
  case '3':
    config.stars = 3;
    break;
  default:
    break;
  }
  return config;
}

/** Returns a boolean to check if the restaurant has to be shown on the view
 * @param {object} restaurant - the restaurant that we need to check before adding it to the view.
 * @param {string} filter - The filter that the restaurant has to correspond to in order to be shown.
 **/
function setFilter (restaurant, filter) {
  let bool = true;

  if (filter !== 'all') {
    bool = false;
    if (filter.includes('special_offer')) {
      if (restaurant.discount.is_special_offer) {
        bool = true;
      } else {
        return false;
      }
    }
    if (filter.includes('menu')) {
      if (restaurant.discount.is_menu) {
        bool = true;
      } else {
        return false;
      }
    }
    if (filter.includes('brunch')) {
      if (restaurant.discount.is_brunch) {
        bool = true;
      } else {
        return false;
      }
    }
  }
  return bool;
}
