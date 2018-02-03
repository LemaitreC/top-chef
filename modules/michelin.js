const cheerio = require('cheerio')
const request = require('request')

/* importing the database module */
const mongodb = require('./mongoDB')



const urlWeb = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin'


exports.getAllRestaurant = (callback) => {
  pagesnumber(urlWeb).then(pages => {
    const promises = []
    for (var i = 1; i <= 2; i++) {
      promises.push(getRestaurantsLinks(i))
    }
    return Promise.all(promises)
  }).then((links) => {
    const promises = []

    for (var i = 0; i < links.length; i++) {
      for (var j = 0; j < links[i].length; j++) {
        promises.push(getDescription(links[i][j]))
      }
      console.log(i)
    }
    return Promise.all(promises)
  }).then(restaurants => {
    // return mongodb.saveRestaurants(restaurants)
    callback(null, restaurants)
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
        reject(new Error("unable to access the maximum page number"))
      }
    })
  })
}

function getRestaurantsLinks(page) {
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
      $(itemsPath).each(function(i, link) {
        linksOnPage.push($(link).children().children().attr('href'))
      })

      resolve(linksOnPage)
    })
  })
}

function getDescription(link) {
  console.log(link)
  return new Promise(function(resolve, reject) {
    request.get('https://restaurant.michelin.fr/'+link, (err, res, body) => {
      if (err) reject("page access error : trying the description of a restaurant \n " + err)

      const $ = cheerio.load(body, {
        decodeEntities: false
      })

      item = {}

      pagePath = 'body > div.l-page > div > div.l-main > div > div.panel-display.panels-michelin-content-layout.panels-michelin-2colsidebar.clearfix'
      if ($(pagePath)) {
        item.name = clean($(pagePath + '> div.panels-content-main.panels-content-main_regionone > div > div.panels-content-main-left > div > div > div > div > h1').text())
        item.stars = parseInt($('#node_poi-guide-wrapper > div.node_poi-distinction-section > ul > li:nth-child(1) > div.content-wrapper').text().charAt(0))
        item.url = link
        item.address = clean($(pagePath + '> div.panels-content-main.panels-content-main_regionone > div > div.panels-content-main-left > div > div > div > div > div.poi_intro-display-address').text())
        item.praticalInfo = clean($('#node_poi-info-wrapper > div.node_poi-info.opt-mich__info-items > div').text())
        item.transport = clean($('#map-location > ul').text())
        item.phone = clean($('#node_poi-info-wrapper > div.node_poi-contact.node_poi-row.node_poi-general.opt-mich__info-items > div.full-display-contact-details > div.tel').text())
        item.websiteUrl = clean($('#node_poi-info-wrapper > div.node_poi-contact.node_poi-row.node_poi-general.opt-mich__info-items > div.full-display-contact-details > div.website> a').text())
        item.cuisineType =clean( $('#node_poi-menu-wrapper > div.node_poi-menu-intro.node_poi-row > div.node_poi-cooking-types').text())
        item.grade={}
        item.price = clean($(pagePath + '> div.panels-content-main.panels-content-main_regionone > div > div.panels-content-main-left > div > div > div > div > div.poi_intro-display-prices').text())
        item.grade.average = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-avg-rating > span.avg-rating-points').text())
        item.grade.tableQuality = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(1) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.service = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(2) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.surroundings = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(3) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.rateQualityPrice = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(4) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.ambiance = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(5) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.grade.drinks = parseFloat($('#node_poi-review-wrapper > div.node_poi-review.node_poi-row > div.node_poi-restaurant-rating > div:nth-child(6) > div.poi_node-items-rating > span.avg-rating-points').text())
        item.menuLink = clean($(pagePath + '#node_poi-info-wrapper > div.node_poi-contact.node_poi-row.node_poi-general.opt-mich__info-items > div.full-display-contact-details > div.website> a').text())

        console.log(item)
        resolve(item)
      } else {
        reject(new Error("unable to access description of the restaurant" + link))
      }
    })
  })
}

function clean(string){
  return string.replace("\n","").replace(/  /g,"")
}
