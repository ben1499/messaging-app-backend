const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
require("dotenv").config();

// Pass the global passport object into the configuration function
require("./config/passport")(passport);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");

const app = express();

app.use(cors());

// Set up rate limiter: maximum of twenty requests per minute
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
});
// Apply rate limiter to all requests
app.use(limiter);

// Compress all routes
app.use(compression()); 

// Add helmet to the middleware chain.
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'"],
      "img-src": ["'self'", "res.cloudinary.com"],
    },
  }),
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// mongoose setup
mongoose.set("strictQuery", false);
const mongoDb = process.env.MONGODB_URI;

main().catch((err) => console.log(err))
async function main() {
  await mongoose.connect(mongoDb);
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/messages", messagesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // show error message
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" })
});

module.exports = app;
