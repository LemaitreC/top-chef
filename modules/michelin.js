const cheerio = require('cheerio')
const request = require('request')

const urlLocale = 'file:///C:/Users/cocol/Desktop/Ecoles/Annee4/Semestre%202/Web-Application-Architecture-s-/top-chef/Restaurants%201%20%C3%A9toile%202%20%C3%A9toiles%203%20%C3%A9toiles,%20France%20_%20MICHELIN%20Restaurants.html'
const urlWeb = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin'


exports.getAllRestaurant = (callback) => {
  pagesnumber(urlWeb).then(pages => {
    // return getRestaurants(1)
    const promises = []
    for (var i = 1; i <= pages; i++) {
      promises.push(getRestaurants(i))
    }
    return Promise.all(promises)
  }).then(links => {
    //return saveToDatabase(links)
    callback(null, links)
  }).catch(err => {
    callback(err)
  })
}

function pagesnumber(url) {
  return new Promise(function(resolve, reject) {
    request.get(url, (err, res, body) => {
      if (err) reject("page access error : trying to get the page number\n " + err)

      const $ = cheerio.load(body, {
        decodeEntities: false
      })

      pageNumberPath = '#panels-content-main-leftwrapper > div.panel-panel.panels-content-main-left > div > div > div > div.item-list-first > div > ul > li.mr-pager-item.mr-pager-placeholder'
      if ($(pageNumberPath)) {
        resolve(parseInt($(pageNumberPath).next().text()))
      } else {
        reject(new Error("unable to acces the maximum page number"))
      }
    })
  })
}

function getRestaurants(page) {
  return new Promise(function(resolve, reject) {
    let urlBis = urlWeb
    if (page > 1) {
      urlBis += '/page-' + page
    }

    request.get(urlBis, (err, res, body) => {
      if (err) reject("page access error : trying to get all starred restaurant \n " + err)

      const $ = cheerio.load(body, {
        decodeEntities: false
      })

      itemsPath = '#panels-content-main-leftwrapper > div.panel-panel.panels-content-main-left > div > div > ul > li'
      let linksOnPage = []
      $(itemsPath).each(function(i, link){
        linksOnPage.push($(link).children().children().attr('href'))
      })

      resolve(linksOnPage)
    })
  })
}
