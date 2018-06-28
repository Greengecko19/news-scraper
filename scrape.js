var axios = require('axios');
var cheerio = require('cheerio');

var scrape = function() {
  return axios.get('https://washingtondc.craigslist.org/d/electronics/search/ela')
  .then(function (response) {
    var $ = cheerio.load(response.data);

    var results = [];
    $("hdrlnk").each(function(i, element) {
      var title = $(element).text();
      var link = $(element).attr('href');
      results.push({ title, link });
    });
  });
  .catch(function (error) {
    console.log(error);
  });
    

module.exports = scrape;
