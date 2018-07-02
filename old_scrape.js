var axios = require('axios');
var cheerio = require('cheerio');

var scrape = function() {
  return axios.get('https://washingtondc.craigslist.org/d/electronics/search/ela')
  .then(function (response) {
    var $ = cheerio.load(response.data);
    var $hdrlnk = $(".hdrlnk");
    var results = [];
    if($hdrlnk.length) {
      $hdrlnk.each(function(i, element) {
        var title = $(element).text();
        var link = $(element).attr('href');
        results.push({ title, link });
      });
    }
    db.Item.create(results)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
      res.send("Scrape Complete");
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      return res.json(err);
  });
  })
  .catch(function (error) {
    console.log(error);
  });
}

module.exports = scrape;
