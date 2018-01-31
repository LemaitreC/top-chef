const request = require('request');



exports.getRestaurant = function (name) {
  const url = `https://www.lafourchette.com/recherche/autocomplete?searchText=${name}`;
  request.get(url,function(err, res, body) {
    console.log(body) 
  })


}
