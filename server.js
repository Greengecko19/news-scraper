var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');
var request = require("request");
var cheerio = require("cheerio");
var app = express();
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

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
    res.render('home'); //, {listing: data});
    }
  })
});

app.get("/scrape", function(req, res) {
 axios.get('https://washingtondc.craigslist.org/d/electronics/search/ela')
  .then(function (response) {
    var $ = cheerio.load(response.data);
    var $hdrlnk = $(".hdrlnk");
    var itemForSale = {};
    // var itemForSale = [];
    if($hdrlnk.length) {
      $hdrlnk.each(function(i, element) {
        var title = $(element).text();
        var link = $(element).attr('href');
        itemForSale = {"title": title , "link": link};
        db.Item.create(itemForSale)
          .then(function(listing) {
            console.log("listing: " + listing);
            // res.send("Scrape Complete");
            // res.render("home", {
            //   "listing": listing
            // })
          })
          .catch(function(err) {
            res.json(err);
          })
        })
      }
    })
  .catch(function (error) {
    console.log(error);
  })
});


app.get("/listings", function(req, res) {
  db.Item.find({})
    .then(function(listing) {
      res.json(listing);
    })
    .catch(function(err) {
      res.json(err);
    });
});



    // })
    // .catch(function (error) {
    //   console.log('THERE WAS AN ERROR')
    //   console.log(error);
    // });
// });


/* $("hrdlnk").each(function(i, element) {;
  // Save an empty itemForSale object;
  var itemForSale = {};

  // Add the text and href of every link, and save them as properties of the itemForSale object;
  itemForSale.title = $(this);
    .children("a");
    .text();
  itemForSale.link = $(this);
    .children("a");
    .attr("href");

  // Create a new Article using the `itemForSale` object built from scraping;
  db.Article.create(itemForSale);
    .then(function(listing) {;
      // View the added itemForSale in the console;
      console.log(listing);
    });
    .catch(function(err) {;
      // If an error occurred, send it to the client;
      return res.json(err);
    });
});
 */
  // Send a "Scrape Complete" message to the browser



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  