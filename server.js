// require dependencies
var express = require("express");
var mongoose = require("mongoose");
var request = require("request");
var axios = require("axios");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

var port = process.env.PORT || 3000;

// initialize Express
var app = express();

// use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json({
  type: "application/json"
}));

// serve the public directory
app.use(express.static("public"));

//Database configuration. Use promises with Mongo and connect to the database
var databaseUrl = "news";

// mongoose.Promise = Promise; 
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/"+ databaseUrl;
mongoose.connect(MONGODB_URI);
mongoose.connect('mongodb://localhost:27017/myapp', {useNewUrlParser: true});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

db.once("open", function(){
  console.log("Connected to Mongoose!");
});

// use handlebars
app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");


// Hook mongojs configuration to the db variable
var db = require("./models");

//Retrieve all articles from the database that are not saved
app.get("/", function(req, res) {
  db.Article.find({
      saved: false
    },
    function(error, dbArticle) {
      if (error) {
        console.log(error);
      } else {
        res.render("index", {
          articles: dbArticle
        });
      }
    })
});


// Scrape data from the site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request via axios for the news section
  axios.get("http://en.granma.cu").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
  // request("http://en.granma.cu/", function(error, response, html) {
    // Load the html body from request into cheerio
    // var $ = cheerio.load(html);
    // For each element with a "g-big-story" class
    $("div.g-regular-story article").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find("h2")
        .text()
        .trim();
      result.href = $(this)
        .find("h2 a")
        .attr("href");
      result.link = "http://en.granma.cu" + result.href;
      result.intro = $(this)
        .find(".sumario p")
        .text()
        .trim();

      // trim() removes whitespace because the items return \n and \t before and after the text
      // var title = $(element).find("h2").text().trim();
      // var href = $(element).find("h2 a").attr("href");
      // var link = "http://en.granma.cu" + href;
      // var intro = $(element).find(".sumario p").text().trim();
      // var intro = $(element).children("div.sumario").text().trim();
      console.log("Title: " + result.title);
      console.log("Link: " + result.link);
      console.log("Summary: " + result.intro);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
      });

      // if these are present in the scraped data, create an article in the database collection
    //   if (result.title && result.link && result.intro) {
    //     db.Article.create({
    //       result
    //         // title: title,
    //         // link: link,
    //         // intro: intro
    //       },
    //       function(err, inserted) {
    //         if (err) {
    //           // log the error if one is encountered during the query
    //           console.log(err);
    //         } else {
    //           // otherwise, log the inserted data
    //           console.log(inserted);
    //         }
    //       });
    //     // if there are 10 articles, then return the callback to the frontend
    //     console.log(i);
    //     if (i === 10) {
    //       return res.sendStatus(200);
    //     }
    //   }
    // });
    // Send a "Scrape Complete" message to the browser
   res.send("Scrape Complete");
  });
   
});

// route for retrieving all the saved articles
app.get("/saved", function(req, res) {
  db.Article.find({
      saved: true
    })
    .then(function(dbArticle) {
      // if successful, then render with the handlebars saved page
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    })

});

// route for setting an article to saved
app.put("/saved/:id", function(req, res) {
  db.Article.findByIdAndUpdate(
      req.params.id, {
        $set: req.body
      }, {
        new: true
      })
    .then(function(dbArticle) {
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// route for saving a new comment to the db and associating it with an article
app.post("/submit/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {
      var articleIdFromString = mongoose.Types.ObjectId(req.params.id)
      return db.Article.findByIdAndUpdate(articleIdFromString, {
        $push: {
          comments: dbComment._id
        }
      })
    })
    .then(function(dbArticle) {
      res.json(dbComment);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// route to find a comment by ID
app.get("/comments/article/:id", function(req, res) {
  db.Article.findOne({"_id":req.params.id})
    .populate("comments")
    .exec (function (error, data) {
        if (error) {
            console.log(error);
        } else {
          res.json(data);
        }
    });        
});


app.get("/comments/:id", function(req, res) {

  db.Comment.findOneAndRemove({_id:req.params.id}, function (error, data) {
      if (error) {
          console.log(error);
      } else {
      }
      res.json(data);
  });
});

// listen for the routes
app.listen(port, function() {
  console.log("App is listening on PORT " + port);
});