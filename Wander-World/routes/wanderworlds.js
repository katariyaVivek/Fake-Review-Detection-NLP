var express = require("express");
var router = express.Router();
var Wanderworld = require("../models/wanderworld");
var middleware = require("../middleware");
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dbe9tmcun",
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
});

var Fuse = require("fuse.js");

// INDEX - show all wanderworlds
router.get("/", function(req, res) {
  var noMatch = null;
  if (req.query.search) {
    Wanderworld.find({}, function(err, allWanderworlds) {
      if (err) {
        console.log(err);
      } else {        
        var options = {
          shouldSort: true,
          threshold: 0.5,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 2,
          keys: ["name", "location"]
        };
        var fuse = new Fuse(allWanderworlds, options);
        var result = fuse.search(req.query.search);
        if (result.length < 1) {
          noMatch = req.query.search;
        }
        res.render("wanderworlds/index", {
          wanderworlds: result,
          noMatch: noMatch
        });
      }
    });
  } else if (req.query.sortby) {
    if (req.query.sortby === "rateAvg") {
      Wanderworld.find({})
        .sort({
          rateCount: -1,
          rateAvg: -1
        })
        .exec(function(err, allWanderworlds) {
          if (err) {
            console.log(err);
          } else {
            res.render("wanderworlds/index", {
              wanderworlds: allWanderworlds,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else if (req.query.sortby === "rateCount") {
      Wanderworld.find({})
        .sort({
          rateCount: -1
        })
        .exec(function(err, allWanderworlds) {
          if (err) {
            console.log(err);
          } else {
            res.render("wanderworlds/index", {
              wanderworlds: allWanderworlds,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else if (req.query.sortby === "priceLow") {
      Wanderworld.find({})
        .sort({
          price: 1,
          rateAvg: -1
        })
        .exec(function(err, allWanderworlds) {
          if (err) {
            console.log(err);
          } else {
            res.render("wanderworlds/index", {
              wanderworlds: allWanderworlds,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else {
      Wanderworld.find({})
        .sort({
          price: -1,
          rateAvg: -1
        })
        .exec(function(err, allWanderworlds) {
          if (err) {
            console.log(err);
          } else {
            res.render("wanderworlds/index", {
              wanderworlds: allWanderworlds,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    }
  } else {
    Wanderworld.find({}, function(err, allWanderworlds) {
      if (err) {
        console.log(err);
      } else {
        res.render("wanderworlds/index", {
          wanderworlds: allWanderworlds,
          currentUser: req.user,
          noMatch: noMatch
        });
      }
    });
  }
});

// CREATE - add new wanderworld to db
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req,res) {
  cloudinary.v2.uploader.upload(
    req.file.path,
    {
      width: 1500,
      height: 1000,
      crop: "scale"
    },
    function(err, result) {
      if (err) {
        req.flash("error", err.message);
        return res.render("error");
      }
      req.body.wanderworld.image = result.secure_url;
      req.body.wanderworld.imageId = result.public_id;
      req.body.wanderworld.booking = {
        start: req.body.wanderworld.start,
        end: req.body.wanderworld.end
      };
      req.body.wanderworld.tags = req.body.wanderworld.tags.split(",");
      req.body.wanderworld.author = {
        id: req.user._id,
        username: req.user.username
      };

      Wanderworld.create(req.body.wanderworld, function(err, wanderworld) {
          if (err) {
            req.flash("error", err.message);
            return res.render("error");
          }
          res.redirect("/wanderworlds");
        });
    //  });
    },
    {
      moderation: "webpurify"
    }
  );
});

// NEW - show form to create new wanderworld
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("wanderworlds/new");
});

// SHOW - shows more information about one wanderworld
router.get("/:id", function(req, res) {
  Wanderworld.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundWanderworld) {
      if (err || !foundWanderworld) {
        console.log(err);
        req.flash("error", "Sorry, that wanderworld does not exist!");
        return res.render("error");
      }
      var ratingsArray = [];

      foundWanderworld.comments.forEach(function(rating) {
        ratingsArray.push(rating.rating);
      });
      if (ratingsArray.length === 0) {
        foundWanderworld.rateAvg = 0;
      } else {
        var ratings = ratingsArray.reduce(function(total, rating) {
          return total + rating;
        });
        foundWanderworld.rateAvg = ratings / foundWanderworld.comments.length;
        foundWanderworld.rateCount = foundWanderworld.comments.length;
      }
      foundWanderworld.save();
      res.render("wanderworlds/show", {
        wanderworld: foundWanderworld
      });
    });
});

// EDIT wanderworld ROUTE
router.get(
  "/:id/edit",
  middleware.isLoggedIn,
  middleware.checkWanderworldOwnership,
  function(req, res) {
    res.render("wanderworlds/edit", {
      wanderworld: req.wanderworld
    });
  }
);

// UPDATE wanderworld ROUTE
router.put(
  "/:id",
  upload.single("image"),
  middleware.checkWanderworldOwnership,
  function(req, res) {
   
    req.body.wanderworld.booking = {
      start: req.body.wanderworld.start,
      end: req.body.wanderworld.end
    };
    req.body.wanderworld.tags = req.body.wanderworld.tags.split(",");
      Wanderworld.findByIdAndUpdate(
        req.params.id,
        req.body.wanderworld,
        async function(err, wanderworld) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("back");
          } else {
            if (req.file) {
              try {
                await cloudinary.v2.uploader.destroy(wanderworld.imageId);
                var result = await cloudinary.v2.uploader.upload(
                  req.file.path,
                  {
                    width: 1500,
                    height: 1000,
                    crop: "scale"
                  },
                  {
                    moderation: "webpurify"
                  }
                );
                wanderworld.imageId = result.public_id;
                wanderworld.image = result.secure_url;
              } catch (err) {
                req.flash("error", err.message);
                return res.render("error");
              }
            }
            wanderworld.save();
            req.flash("success", "Successfully updated your wanderworld!");
            res.redirect("/wanderworlds/" + req.params.id);
          }
        }
      );
    //});
  }
);

// DESTROY wanderworld ROUTE
router.delete("/:id", middleware.checkWanderworldOwnership, function(req, res) {
  Wanderworld.findById(req.params.id, async function(err, wanderworld) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(wanderworld.imageId);
      wanderworld.remove();
      res.redirect("/wanderworlds");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.render("error");
      }
    }
  });
});

module.exports = router;
