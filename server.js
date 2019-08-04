//Required dependencies
//============================================
const express = require("express");
const mongoose = require("mongoose");
const request = require("request");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
var method = require("method-override");


//Defining the port variable
const port = process.env.PORT || 3000;

//Initializing Express App
const app = express();

//Get an instance of Express Router
const router = express.Router();

//Middleware 
//============================================
//Serve the public directory
app.use(express.static("public"));

//Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: "application/json"}));
app.use(bodyParser.text());
app.use(method("_method"));

// Setting up the Handlebars View Engine
//======================================
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("views",path.join(__dirname,"views"));
app.set("view engine", "handlebars");



//Set up promises with mongoose
mongoose.Promise = Promise; 

//if there's a shell environment variable named MONGODB_URI (deployed), use it; otherwise, connect to localhost
const dbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/news";

mongoose.connect(dbUrl, {useNewUrlParser: true});

let dbConnection = mongoose.connection;
dbConnection.on("error", console.error.bind(console, "Connection error:"));

dbConnection.once("open", function(){
  console.log("Connected to Mongoose!");
});

let db = require("./models");

var Comment = require("./models/Comment");
var Article = require("./models/Article");

// ROUTES
// ==============================================

// apply the routes to our application
app.use("/", router);

router.get("/", function(req, res, next) {
	Article.find({}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("index", {
        title: "NewsPeek - News Scraper App",
        message: "There's nothing scraped yet. Please click \"Get Latest Articles\" for fresh and delicious news."
      });
		}
		else{
			res.render("index", {
                      title: "NewsPeek - News Scraper App",
                      articles: data
                      // counts: totalCounts
                  });
		}
	});
});

//GET route for populating the scraped articles on the Home page
// router.get("/", function(req, res, next){
    
//   const scrapedUrl = "http://en.granma.cu";
//   //Create empty array for pushing the scraped articles into
//   const newArticles = [];
//   let totalCounts = 0;

//   // First, we grab the body of the html with axios
//   axios.get(scrapedUrl).then(function(response) {
//     // Load the html body from axios into cheerio and save it to $ for a shorthand selector
    
//     const $ = cheerio.load(response.data);

//     //Grabbing the site heading article
//     const siteHeadingArticle = $("div.g-big-story");

//     //Building the heading article
//     const headingArticle = {};
//     headingArticle.title = siteHeadingArticle.find("h2").text().trim();
//     //We grab the string provided in href
//     const href = siteHeadingArticle.find("h2").children().attr("href"); 
//     //Build the actual link by prepending the website url to the href string
//     headingArticle.link = "http://en.granma.cu/" + `${href}`;
//     headingArticle.intro =  siteHeadingArticle.find("h2").next().text().trim();
//     //Push article into the array of newArticles
//     newArticles.push(headingArticle);

//       // Now, we grab every 'article' tag within 'div' with 'g-regular-story' class, and do the following:
//       const siteArticles = $("div.g-regular-story article");

//           siteArticles.each(function(i, element) {

//                 // Add the h2 text and href of every link, and the p tag with 'sumario' class, and save them as properties of the result object
//                 let thisTitle = $(element).find("h2").text().trim();

//                 //Grab the string provided in href
//                 let href = $(element).find("h2 a").attr("href");

//                 //Build the actual link by prepending the website url to the string provided in href
//                 let thisLink = "http://en.granma.cu" + `${href}`;

//                 let thisIntro = $(element).find(".sumario p").text().trim();

//                 // if these are present in the scraped data, create an article in the database collection
//                 // Create a new Article using the `result` object built from scraping
//                   if (thisTitle && thisLink && thisIntro) {

//                     // Create a new article
//                     let article = {
//                       title: thisTitle,
//                       link: thisLink,
//                       intro: thisIntro,
//                       saved: false
//                     };

//                     //Push article into the array of newArticles
//                     newArticles.push(article);
//                   };
//             });
                
//           // Send a "Scrape Complete" message to the browser
//           console.log("Scrape finished.");
//           console.log(newArticles);
//           totalCounts = newArticles.length;
          
//           res.render("index", {
//               title: "NewsPeek  - News Scraper App",
//               articles: newArticles,
//               counts: totalCounts
//           });
   
// });
  
// });


//GET route for populating the scraped articles on the Home page
router.get("/scrape", function(req, res, next){
    
  const scrapedUrl = "http://en.granma.cu";
  //Create empty array for pushing the scraped articles into
  const newArticles = [];
  let totalCounts = 0;

  // First, we grab the body of the html with axios
  axios.get(scrapedUrl).then(function(response) {
    // Load the html body from axios into cheerio and save it to $ for a shorthand selector
    
    const $ = cheerio.load(response.data);

    //Grabbing the site heading article
    const siteHeadingArticle = $("div.g-big-story");

    //Building the heading article
    const headingArticle = {};
    headingArticle.title = siteHeadingArticle.find("h2").text().trim();
    //We grab the string provided in href
    const href = siteHeadingArticle.find("h2").children().attr("href"); 
    //Build the actual link by prepending the website url to the href string
    headingArticle.link = "http://en.granma.cu/" + `${href}`;
    headingArticle.intro =  siteHeadingArticle.find("h2").next().text().trim();
    //Push article into the array of newArticles
    newArticles.push(headingArticle);

      // Now, we grab every 'article' tag within 'div' with 'g-regular-story' class, and do the following:
      const siteArticles = $("div.g-regular-story article");

          siteArticles.each(function(i, element) {

                // Add the h2 text and href of every link, and the p tag with 'sumario' class, and save them as properties of the result object
                let thisTitle = $(element).find("h2").text().trim();

                //Grab the string provided in href
                let href = $(element).find("h2 a").attr("href");

                //Build the actual link by prepending the website url to the string provided in href
                let thisLink = "http://en.granma.cu" + `${href}`;

                let thisIntro = $(element).find(".sumario p").text().trim();

                // if these are present in the scraped data, create an article in the database collection
                // Create a new Article using the `result` object built from scraping
                  if (thisTitle && thisLink && thisIntro) {

                    // Create a new article
                    let article = {
                      title: thisTitle,
                      link: thisLink,
                      intro: thisIntro,
                      saved: false
                    };

                    //Push article into the array of newArticles
                    newArticles.push(article);
                  };
            });
                
          // Send a "Scrape Complete" message to the browser
          console.log("Scrape finished.");
          console.log(newArticles);
          totalCounts = newArticles.length;
          
          res.render("index", {
              title: "NewsPeek  - Scraped Articles",
              articles: newArticles,
              counts: totalCounts
          });
   
});
  
});


//Route for setting an article to saved
router.post("/saved", function(req, res) {
  db.Article.create(req.body)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          res.render("saved", {
            articles: dbArticle
          })
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
});

//Route for retrieving all the saved articles in the database.
  router.get("/saved", function (req, res) {
    db.Article.find({
      saved: true
    })
    // ..and populate all of the comments associated with it
    .populate("comment")
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

 //Route for removing a saved articles in the database.
  router.put("/saved/:id", function(req, res) {
    db.Article.deleteOne({_id:req.params.id}, function (error, data) {
      if (error) {
          console.log(error);
      } else {
      }
      res.json(data);
    });
  });

  // // Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

  // // Route for saving/updating an Article's associated Comment
router.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {$set: { comment: dbComment._id, new: true }});
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

  // // route for saving a new comment to the db and associating it with an article
router.post("/submit/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {
      let articleIdFromString = mongoose.Types.ObjectId(req.params.id)
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

// // // route to find a comment by ID
router.get("/comments/article/:id", function(req, res) {
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


router.get("/comments/:id", function(req, res) {

  db.Comment.deleteOne({_id:req.params.id}, function (error, data) {
      if (error) {
          console.log(error);
      } else {
      }
      res.json(data);
  });
});


app.listen(port, function() {
  console.log(`App is listening on http://localhost:${port}`);
});