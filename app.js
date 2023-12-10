const path = require('path');
const dotenv = require('dotenv');
const db = require('./utils/database');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
dotenv.config();
const bodyParser = require('body-parser');
const globalErrorHandler = require('./controllers/errorController');
const rootDir = require('./utils/path');


// ROUTES
const flowersRouter = require('./routes/flowersRouter');
const usersRouter = require('./routes/usersRouter');
const reviewsRouter = require('./routes/reviewsRouter');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));




app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARE
app.use(express.json({limit: '10kb'}));

// DATA SANITIZATION AGAINST NOSQL
app.use(mongoSanitize());
// DATA SANITIZATION AGAINST XSS

// PARAMS POLUTION PREVENTION
app.use(hpp({
   whitelist: [
       'expenditure'
   ]
}));

app.use(morgan('dev'));

const limiter = rateLimit({
   max: 250,
   windowMs: 1000 * 60 * 60,
   message: 'Too many requests from this IP. Please try again in an hour'
});

app.use('/api', limiter);

app.get('/', (req, res) => {
   res.status(200).render('base', {
      flower: 'Iris',
      head: 'Peter'
   });
});

app.use('/api/v1/flowers', flowersRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

app.use('*', (req, res, next) => {
   res.render('404')
});


app.use(globalErrorHandler)



module.exports = app;
