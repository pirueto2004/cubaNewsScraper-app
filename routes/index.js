// const express = require("express");
// const axios = require("axios");
// const cheerio = require("cheerio");
// const router = express.Router();

// let db = require("../models");

// // ROUTES
// const index = require("./routes/index");
// const saved = require("./routes/saved");

// // app.use("/", index);

// // app.use("/saved", saved);

// //GET route for populating the scraped articles on the Home page
// router.get("/", function(req, res, next){
    
//     const scrapedUrl = "http://en.granma.cu";
//     //Create empty array for pushing the scraped articles into
//     const newArticles = [];
//     let totalCounts = 0;
 
//     // First, we grab the body of the html with axios
//     axios.get(scrapedUrl).then(function(response) {
//       // Load the html body from axios into cheerio and save it to $ for a shorthand selector
      
//       const $ = cheerio.load(response.data);
  
//       //Grabbing the site heading article
//       const siteHeadingArticle = $("div.g-big-story");
  
//       //Building the heading article
//       const headingArticle = {};
//       headingArticle.title = siteHeadingArticle.find("h2").text().trim();
//       //We grab the string provided in href
//       const href = siteHeadingArticle.find("h2").children().attr("href"); 
//       //Build the actual link by prepending the website url to the href string
//       headingArticle.link = "http://en.granma.cu/" + `${href}`;
//       headingArticle.intro =  siteHeadingArticle.find("h2").next().text().trim();
//       //Push article into the array of newArticles
//       newArticles.push(headingArticle);
  
//         // Now, we grab every 'article' tag within 'div' with 'g-regular-story' class, and do the following:
//         const siteArticles = $("div.g-regular-story article");
  
//             siteArticles.each(function(i, element) {
  
//                   // Add the h2 text and href of every link, and the p tag with 'sumario' class, and save them as properties of the result object
//                   let thisTitle = $(element).find("h2").text().trim();
  
//                   //Grab the string provided in href
//                   let href = $(element).find("h2 a").attr("href");
  
//                   //Build the actual link by prepending the website url to the string provided in href
//                   let thisLink = "http://en.granma.cu" + `${href}`;
  
//                   let thisIntro = $(element).find(".sumario p").text().trim();
  
//                   // if these are present in the scraped data, create an article in the database collection
//                   // Create a new Article using the `result` object built from scraping
//                     if (thisTitle && thisLink && thisIntro) {
  
//                       // Create a new article
//                       let article = {
//                         index: i,
//                         title: thisTitle,
//                         link: thisLink,
//                         intro: thisIntro,
//                         saved: false
//                       };
  
//                       //Push article into the array of newArticles
//                       newArticles.push(article);
//                     };
//               });
                  
//             // Send a "Scrape Complete" message to the browser
//             console.log("Scrape finished.");
//             console.log(newArticles);
//             totalCounts = newArticles.length;
            
//             res.render("index", {
//                 title: "NewsPeek  - News Scraper App",
//                 articles: newArticles,
//                 counts: totalCounts
//             });
     
//   });
    
// });

// //Route for setting an article to saved
// router.post("/saved", function(req, res) {
//     db.Article.create(req.body)
//           .then(function(dbArticle) {
//             // View the added result in the console
//             console.log(dbArticle);
//           })
//           .catch(function(err) {
//             // If an error occurred, log it
//             console.log(err);
//           });
//   });
  
//   //Route for retrieving all the saved articles in the database.
//   router.get("/saved", function (req, res) {
//     db.Article.find({
//       saved: true
//     })
//     // ..and populate all of the comments associated with it
//     .populate("comment")
//     .then(function(dbArticle) {
//       // if successful, then render with the handlebars saved page
//       res.render("saved", {
//         articles: dbArticle
//       })
//     })
//     .catch(function(err) {
//       // If an error occurs, send the error back to the client
//       res.json(err);
//     })
//     // res.send('About birds')
//   });

// //GET Scrape page
// // router.get("/scrape", function(req, res, next){
// //     res.render("index", {
// //         title: "NewsPeek  - Scraped Articles",
// //         articles: [
// //             {title: "Yehuda", link: "Katz", intro: "Intro"},
// //             {title: "Carl", link: "Lerche", intro: "Intro"},
// //             {title: "Alan", link: "Johnson", intro: "Intro"}
// //         ],
// //     });
// // });

// let db = require("./models");


// // // ROUTES
// // const index = require("./routes/index");

// // app.use("/", index);


// // Route for getting all Articles from the db
// // app.get("/articles", function(req, res) {
// //   // Grab every document in the Articles collection
// //   db.Article.find({})
// //     .then(function(dbArticle) {
// //       // If we were able to successfully find Articles, send them back to the client
// //       res.json(dbArticle);
// //     })
// //     .catch(function(err) {
// //       // If an error occurred, send it to the client
// //       res.json(err);
// //     });
// // });

// //Retrieve all articles from the database that are not saved and display them in the home page
// // app.get("/", function(req, res) {
// //   db.Article.find({
// //       saved: false
// //     },
// //     function(error, dbArticle) {
// //       if (error) {
// //         console.log(error);
// //       } else {
// //         res.render("index", {
// //           articles: dbArticle
// //         });
// //       }
// //     })
// // });

// // // route for retrieving all the saved articles in the database.
// // app.get("/saved", function(req, res) {
// //   db.Article.find({
// //       saved: true
// //     })
// //     // ..and populate all of the comments associated with it
// //     .populate("comment")
// //     .then(function(dbArticle) {
// //       // if successful, then render with the handlebars saved page
// //       res.render("saved", {
// //         articles: dbArticle
// //       })
// //     })
// //     .catch(function(err) {
// //       // If an error occurs, send the error back to the client
// //       res.json(err);
// //     })

// // });



// // Route for saving/updating an Article's associated Comment
// // app.post("/articles/:id", function(req, res) {
// //   // Create a new comment and pass the req.body to the entry
// //   db.Comment.create(req.body)
// //     .then(function(dbComment) {
// //       // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
// //       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
// //       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
// //       return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
// //     })
// //     .then(function(dbArticle) {
// //       // If we were able to successfully update an Article, send it back to the client
// //       res.json(dbArticle);
// //     })
// //     .catch(function(err) {
// //       // If an error occurred, send it to the client
// //       res.json(err);
// //     });
// // });

// // route for saving a new comment to the db and associating it with an article
// // app.post("/submit/:id", function(req, res) {
// //   db.Comment.create(req.body)
// //     .then(function(dbComment) {
// //       let articleIdFromString = mongoose.Types.ObjectId(req.params.id)
// //       return db.Article.findByIdAndUpdate(articleIdFromString, {
// //         $push: {
// //           comments: dbComment._id
// //         }
// //       })
// //     })
// //     .then(function(dbArticle) {
// //       res.json(dbComment);
// //     })
// //     .catch(function(err) {
// //       // If an error occurs, send it back to the client
// //       res.json(err);
// //     });
// // });

// // // route to find a comment by ID
// // app.get("/comments/article/:id", function(req, res) {
// //   db.Article.findOne({"_id":req.params.id})
// //     .populate("comments")
// //     .exec (function (error, data) {
// //         if (error) {
// //             console.log(error);
// //         } else {
// //           res.json(data);
// //         }
// //     });        
// // });


// // app.get("/comments/:id", function(req, res) {

// //   db.Comment.findOneAndRemove({_id:req.params.id}, function (error, data) {
// //       if (error) {
// //           console.log(error);
// //       } else {
// //       }
// //       res.json(data);
// //   });
// // });

// module.exports = router;