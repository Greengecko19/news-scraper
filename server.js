var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');
var request = require("request");
var cheerio = require("cheerio");

var app = express();

var collections = ["scrapedData"];


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models/Index");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware
//app.set ('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

app.get('/', function (req, res) {
  const data = {};

  db.Item.find({}, function(err, data) {
    if (err) {
      console.log(err)
    } else {
    res.render('home', {listings: data});
    }
  })
});

app.get("/scrape", function(req, res) {
  return axios.get('https://washingtondc.craigslist.org/d/electronics/search/ela')
    .then(function (response) {
      var $ = cheerio.load(response.data);

      $("hrdlnk").each(function(i, element) {
      var result = {};
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

        db.items.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
      });
    })
    .catch(function (error) {
      console.log(error);
    });

})


/* $("hrdlnk").each(function(i, element) {;
  // Save an empty result object;
  var result = {};

  // Add the text and href of every link, and save them as properties of the result object;
  result.title = $(this);
    .children("a");
    .text();
  result.link = $(this);
    .children("a");
    .attr("href");

  // Create a new Article using the `result` object built from scraping;
  db.Article.create(result);
    .then(function(dbArticle) {;
      // View the added result in the console;
      console.log(dbArticle);
    });
    .catch(function(err) {;
      // If an error occurred, send it to the client;
      return res.json(err);
    });
});
 */
  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  