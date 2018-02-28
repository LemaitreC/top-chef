const mongo = require('mongodb');

const dbc = {
  user: 'top_chef',
  pass: 'P4ssword'
}

exports.saveRestaurants = (restaurants) => new Promise(function(resolve, reject) {
  mongo.connect('mongodb://top_chef:P4ssword@ds223578.mlab.com:23578/top-chef', function(err, db) {
    if (err) {
      reject(err);
    }

    db.collection("restaurants").remove({}, function(err, res) {


      db.collection("restaurants").insertMany(restaurants, function(err, res) {
        if (err) {
          reject(err);
        }
        console.log("Number of documents inserted: " + res.insertedCount);
        resolve("Number of documents inserted: " + res.insertedCount);
        db.close();
      })
    })
  })
})

exports.getRestaurants = (filter, stars, callback) => {
  mongo.connect('mongodb://top_chef:P4ssword@ds223578.mlab.com:23578/top-chef', function(err, db) {
    if (err) {
      callback(err, null)
    }

    const config = getconfig(filter, stars)

    db.collection("restaurants").find(config).toArray(function(err, docs) {
      if (err) {
        callback(err, null)
      }
      console.log("Found the following records");
      console.log(docs)
      callback(null, docs)
    });

  })
}

exports.getAllRestaurants = () => {
  return new Promise(function(resolve, reject) {
    mongo.connect('mongodb://top_chef:P4ssword@ds223578.mlab.com:23578/top-chef', function(err, db) {
      if (err) {
        reject(err)
      }
      db.collection("restaurants").find({}).toArray(function(err, docs) {
        if (err) {
          reject(err)
        }
        // console.log("Found the following records");
        // console.log(docs)
        resolve(docs)
      })

    })
  })
}

exports.updateDiscount = (id, restDiscount, restaurantName,update) => {
  return new Promise(function(resolve, reject) {
    mongo.connect('mongodb://top_chef:P4ssword@ds223578.mlab.com:23578/top-chef', function(err, db) {
      if (err) {
        reject(err)
      }
      db.collection("restaurants").updateOne({
        name: restaurantName
      }, {
        $set: {
          idLaFourchette: id,
          discount: restDiscount,
          lastUpdate : update.toUTCString()
        }
      }, function(err, result) {
        if (err) {
          reject(err)
        }
        resolve(result)
      })

    })
  })
}

function getconfig(filter, stars) {

  let config = {}
  // Give only restaurant with discounts
  config.discount = { $gt: [] }

  if (filter != "all") {

    if (filter.includes("special_offer")){
      config["discount.0.is_special_offer"] = true
    }
    if (filter.includes("menu")) {
      config["discount.0.is_menu"] = true
    }
    if (filter.includes('brunch')) {
      config["discount.0.is_brunch"]  = true
    }
  }
  switch (stars) {
    case "1":
      config.stars = 1
      break;
    case "2":
      config.stars = 2
      break;
    case "3":
      config.stars = 3
      break;
    default:

      break;
  }
  console.log(config)

  return config
}
