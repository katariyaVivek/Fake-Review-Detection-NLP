var Wanderworld = require("../models/wanderworld");
var Comment = require("../models/comment");
var User = require("../models/user");
var middlewareObj = {};

middlewareObj.checkWanderworldOwnership = function(req, res, next) {
  Wanderworld.findById(req.params.id, function(err, foundWanderworld) {
    if (err || !foundWanderworld) {
      req.flash("error", "Sorry, that wanderworld does not exist!");
      res.redirect("/wanderworlds");
    } else if (
      foundWanderworld.author.id.equals(req.user._id) ||
      req.user.isAdmin
    ) {
      req.wanderworld = foundWanderworld;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/wanderworlds/" + req.params.id);
    }
  });
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err || !foundComment) {
      req.flash("error", "Sorry, that comment does not exist!");
      res.redirect("/wanderworlds");
    } else if (
      foundComment.author.id.equals(req.user._id) ||
      req.user.isAdmin
    ) {
      req.comment = foundComment;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/wanderworlds/" + req.params.id);
    }
  });
};

middlewareObj.checkProfileOwnership = function(req, res, next) {
  User.findById(req.params.user_id, function(err, foundUser) {
    if (err || !foundUser) {
      req.flash("error", "Sorry, that user doesn't exist");
      res.redirect("/wanderworlds");
    } else if (foundUser._id.equals(req.user._id) || req.user.isAdmin) {
      req.user = foundUser;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/wanderworlds/" + req.params.user_id);
    }
  });
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that!");
  res.redirect("/login");
};

module.exports = middlewareObj;
