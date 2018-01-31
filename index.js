const lafourchette = require('./modules/lafourchette')

// console.log(lafourchette.getRestaurant('Le Chiberta','75008'))

lafourchette.matchRestaurant('Le Chiberta','75008', (err, data)=>{
  console.log(data)
})
