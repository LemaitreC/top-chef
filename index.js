const lafourchette = require('./modules/lafourchette')
const michelin = require('./modules/michelin')


michelin.getAllRestaurant((err,data)=>{
  console.log("Status :" +data)
})


// lafourchette.matchRestaurant('Le Chiberta','75008', (err, data)=>{
//   console.log(data)
// })
