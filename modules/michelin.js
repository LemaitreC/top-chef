const cheerio = require('cheerio')
const request = require('request')

/* importing the database module */
const mongodb = require('./mongoDB')

const urlWeb = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin'


/* SCREEN SCRAPPING */
exports.getAllRestaurant = (callback) => {
  pagesnumber(urlWeb).then(pages => {
    const promises = []
    //for (var i = 1; i <= pages; i++) {
    for (var i = 1; i <= 1; i++) {
      promises.push(getRestaurantsLinks(i))
    }
    return Promise.all(promises)
  }).then((links) => {
    const promises = []

    for (var i = 0; i < links.length; i++) {
      for (var j = 0; j < links[i].length; j++) {
        promises.push(getDescription(links[i][j]))
      }
    }
    return Promise.all(promises)
  }).then(restaurants => {
    //We save all these restaurant into a mongo database
    return mongodb.saveRestaurants(restaurants)
  }).then(string => {
    callback(null, string)
  }).catch(err => {
    callback(err)
  })
}

/** Gets the number of page displaying all the starred restaurant on the michelin.fr website.
 * @param {string} url - the url to make the resquest from displaying all the starred restaurant
 */
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
        reject(new Error("unable to access the maximum page number"))
      }
    })
  })
}

/** Gets the link of all description pages of every starred restaurants
 * @param {Integer} page - the number of page to go through to see all the starred restaurant
 */
function getRestaurantsLinks(page) {
  return new Promise(function(resolve, reject) {
    let url = urlWeb
    if (page > 1) {
      url += '/page-' + page
    }

    request.get(url, (err, res, body) => {
      if (err) reject("page access error : trying to get all starred restaurant \n " + err)

      const $ = cheerio.load(body, {
        decodeEntities: false
      })

      itemsPath = '#panels-content-main-leftwrapper > div.panel-panel.panels-content-main-left > div > div > ul > li'
      let linksOnPage = []
      $(itemsPath).each(function(i, link) {
        linksOnPage.push($(link).children().children().attr('href'))
      })

      resolve(linksOnPage)
    })
  })
}

/** Gets data from the restaurant page description by scrapping the page.
 * @param {string} link - url of the restaurant page description on which to scrap data
*/
function getDescription(link) {
  return new Promise(function(resolve, reject) {
    request.get('https://restaurant.michelin.fr' + link, (err, res, body) => {
      if (err) reject("page access error : trying the description of a restaurant \n " + err)

      console.log(link)
      const $ = cheerio.load(body, {
        decodeEntities: false
      })
      item = {}

      pagePath = 'body > div.l-page > div > div.l-main > div > div.panel-display.panels-michelin-content-layout.panels-michelin-2colsidebar.clearfix'
      if ($(pagePath)) {

        //We get all the data needed by scrapping the page/body returned from the get request
        item.name = clean($(pagePath + '> div.panels-content-main.panels-content-main_regionone > div > div.panels-content-main-left > div > div > div > div > h1').text())
        item.stars = parseInt($('#node_poi-guide-wrapper > div.node_poi-distinction-section > ul > li:nth-child(1) > div.content-wrapper').text().charAt(0))
        item.url = link
        item.idLaFourchette= null
        item.address = {}
        item.address.street = clean($(pagePath + ' > div.panels-content-main.panels-content-main_regionone > div > div.panels-content-main-left > div > div > div > div > div.poi_intro-display-address > div > div > div > div.street-block > div').text())
        item.address.zipcode = $(pagePath + ' > div.panels-content-main.panels-content-main_regionone > div > div.panels-content-main-left > div > div > div > div > div.poi_intro-display-address > div > div > div > div.addressfield-container-inline.locality-block.country-FR > span.postal-code').text()
        item.address.town = $(pagePath + ' > div.panels-content-main.panels-content-main_regionone > div > div.panels-content-main-left > div > div > div > div > div.poi_intro-display-address > div > div > div > div.addressfield-container-inline.locality-block.country-FR > span.locality').text()
        item.cuisineType = clean($('#node_poi-menu-wrapper > div.node_poi-menu-intro.node_poi-row > div.node_poi-cooking-types').text())
        item.grade = {}
        item.price = clean($(pagePath + '> div.panels-content-main.panels-content-main_regionone > div > div.panels-content-main-left > div > div > div > div > div.poi_intro-display-prices').text())
        item.grade.average = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-avg-rating > span.avg-rating-points').text())
        item.grade.tableQuality = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(1) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.service = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(2) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.surroundings = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(3) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.rateQualityPrice = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(4) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.ambiance = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(5) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.drinks = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(6) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.discount ={}

        resolve(item)
      } else {
        reject(new Error("unable to access description of the restaurant" + link))
      }
    })
  })
}

/** Used to take off the space and other inconvenient charatacter from a string
 * @param {string} string The string we want to clean
 */
function clean(string) {
  return string.replace("\n", "").replace(/  /g, "")
}
