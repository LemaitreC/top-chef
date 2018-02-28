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

    const config = getconfig(stars)

    db.collection("restaurants").find(config).toArray(function(err, docs) {
      if (err) {
        callback(err, null)
      }
      let deals = []

      for (var i = 0; i < docs.length; i++) {
        for (var j = 0; j < docs[i].discount.length; j++) {

          var restaurant = JSON.parse(JSON.stringify(docs[i]));
          restaurant.discount=  docs[i].discount[j]
          if(setFilter(restaurant,filter)){
            deals.push(restaurant)
          }
        }
      }
      callback(null, deals)
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

exports.updateDiscount = (id, restDiscount, restaurantName, update) => {
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
          lastUpdate: update.toUTCString()
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

function getconfig( stars) {
  let config = {}
  config.discount = { $gt: [] }
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
  return config
}

function setFilter(restaurant,filter){
let bool = true

  if (filter != "all") {
    bool = false
    if (filter.includes("special_offer")){
      if( restaurant.discount.is_special_offer){
        // console.log("special offer")
        bool =true
      }else{
        return false
      }

    }
    if (filter.includes("menu")) {
      if( restaurant.discount.is_menu){
        // console.log("special offer")
        bool =true
      }else{
        return false
      }
    }
    if (filter.includes('brunch') ) {
      if(restaurant.discount.is_brunch){
        // console.log("special offer")
        bool =true
      }else{
        return false
      }
    }
  }

  return bool
}
