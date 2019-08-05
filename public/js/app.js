$(document).ready(function() {
  
   $(".bg-article.container").empty();
   
    // when the save button is clicked, get its parent element title, link, and intro and build the article to be saved
    $(".save-btn").on("click", function(event) {
      event.preventDefault();
      // let $index = $(this).attr("data-count");
      
      $(this).removeClass("btn-success").addClass("btn-danger").text("Article Saved");
      $(this).attr("data-save",true);
      let $title = $(this).parent("div").find(".card-title").text();
      let $link = $(this).parent("div").find("a.card-link").attr("href");
      let $intro = $(this).parent("div").find(".card-text").text();
 
      let newSavedArticle = {
              title : $title,
              link :  $link,
              intro : $intro,
              saved : true
          };
       
      //POST request to save the article in the database
      $.ajax("/saved", {
        type: "POST",
        data: newSavedArticle
      }).then(function(data) {
          location.reload();
        }
      );
    });
  
  //click event to scrape new articles
  $('.scrape-new').on('click', function (e){
    e.preventDefault();
    $.ajax({
      url: '/scrape',
      type: 'GET',
      success: function (response) {
        $('#numArticles').text(response.count);
      },
      error: function (error) {
        console.log(error);
      },
      complete: function (result){
        // alert("Scrape finished.");
        //  window.location.reload();
         window.location.href = "/scrape";
      }
    });
  });//end of #scrape click event


  // Removing Saved Articles from the database
	$(document).on("click", ".unsave-btn", function(e) {
    e.preventDefault();
    var newUnsavedArticle = $(this).data();
      var id = $(this).attr("data-articleid");
      newUnsavedArticle.saved = false;
      $.ajax("/saved/" + id, {
        type: "PUT",
        data: newUnsavedArticle
      }).then(
        function(data) {
          location.reload();
        }
      );
	});
  
   // generate the text inside the comments modal
    function createModalHTML(data) {
      var modalText = data.title;
      $("#comment-modal-title").text("Comments for article: " + data.title);
      var commentItem;
      var commentDeleteBtn;
      console.log("data comments length ", data.comments.length)
      for (var i = 0; i < data.comments.length; i++) {
        commentItem = $("<li class='list-group-item'>").text(data.comments[i].body);
        commentItem.addClass("comment-item-list");
        commentItem.attr("id", data.comments[i]._id);
        
        commentDeleteBtn = $("<button> Delete </button>").addClass("btn btn-danger delete-comment-modal");
        commentDeleteBtn.attr("data-commentId", data.comments[i]._id);
        commentItem.prepend(commentDeleteBtn, " ");
        $(".comments-list").append(commentItem);
      }
    }
  
    // when the add comment button is clicked on the saved articles page, show a modal. Empty the contents first.
    $(".comment-modal-btn").on("click", function(event) {
      var articleId = $(this).attr("data-articleId");
      $("#add-comment-modal").attr("data-articleId", articleId);
      $("#comment-modal-title").empty();
      $(".comments-list").empty();
      $("#comments-body").val("");
      $.ajax("/comments/article/" + articleId, {
        type: "GET"
      }).then(
        function(data) {
          createModalHTML(data);
        }
      );
  
      // show the modal
      $("#add-comment-modal").modal("toggle");
    });
  
    // save a comment into the database
    $(document).on("click", ".comment-save-btn", function(event) {
    // $(".comment-save-btn").on("click", function(event) {
      event.preventDefault();
      // Grab the id associated with the article from the submit button
      // var thisId = $(this).attr("data-id");
      var articleId = $("#add-comment-modal").attr("data-articleId");
      // var articleId = $(this).attr("data-articleId");
      var newComment = {
        body: $("#comment-body").val().trim()
      }
      console.log(newComment);
      $.ajax("/submit/" + articleId, {
        type: "POST",
        data: newComment
      })
       // With that done
      .then(function(data) {
        // Log the response
      console.log(data);
      });
      // Also, remove the values entered in the input and textarea for comment entry
      $("#comment-body").val("");
    });
  
    // delete the comment that was clicked and remove the whole <li> because the text and delete button are included
    $(document).on("click", ".delete-comment-modal", function(event) {
      var commentID = $(this).attr("data-commentId");
  
      $.ajax("/comments/" + commentID, {
        type: "GET"
      }).then(
        function(data) {
          $("#" + commentID).remove();
        })
    });
  
  });

  function renderArticles(articles) {
    let $target = $("#articles");
    $target.empty()
      articles.forEach(function(i,element) {
        let $card = $(`<div class="card bg-light mb-3">`)
                        .html(`<div class="card bg-light mb-3">
                          <div class="card-body">
                            <h5 class="card-title">${title}</h5>
                            <a href="${link}" class="card-link" target="_blank">View article on Granma International</a>
                            <p class="card-text">${intro}...</p>
                            <a data-articleId="${_id}" class="btn btn-success btn-md save-btn">Save article</a>
                          </div>
                        </div>`)
                        $target.append($card)
        
      });
  };

 