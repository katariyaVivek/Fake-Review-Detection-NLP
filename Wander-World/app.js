
require("dotenv").config();
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  Wanderworld = require("./models/wanderworld"),
  Comment = require("./models/comment"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  User = require("./models/user"),
  methodOverride = require("method-override"),
  flash = require("connect-flash");

// Requiring routes
var commentRoutes = require("./routes/comments"),
  wanderworldRoutes = require("./routes/wanderworlds"),
  indexRoutes = require("./routes/index");
mongoose.Promise = global.Promise;

const databaseUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017";

mongoose
  .connect(databaseUri, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database connection error:', $err.message));


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIG
app.use(
  require("express-session")({
    secret: "What a wonderful world to live.",
    resave: false,
    saveUninitialized: false,
  })
);
app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/wanderworlds", wanderworldRoutes);
app.use("/wanderworlds/:id/comments", commentRoutes);

app.get("*", function (req, res) {
  res.render("error");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("listening on http://localhost:3000/");
});