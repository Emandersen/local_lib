var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var catalogRouter = require('./routes/catalog');

var app = express();


const envs = {
  port: process.env.PORT,
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASS,
  collection: process.env.MONGODB_COLLECTION
};

for (const [key, value] of Object.entries(envs)) {
  if (!value) {
    console.error(`Missing environment variable: ${key}`);
    console.error('If you are running this app locally, make sure to populate the .env file in the root directory with the following content:');
    for (const [key, value] of Object.entries(envs)) {
      console.error(`${key}=<value>`);
    };
    process.exit(1);
  } else {
    console.log(`Environment variable found: ${key} = ${value}`);
  }
}


// setup mongoDB connection
mongoose.set('strictQuery', false);
var mongoDB = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.eehabcx.mongodb.net/${process.env.MONGODB_COLLECTION}?retryWrites=true&w=majority&appName=Cluster0`;


main().catch(err => console.log(err));
async function main() {
  try {
    await mongoose.connect(mongoDB);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/catalog', catalogRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  if (!res.headersSent) {
    next(createError(404));
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
