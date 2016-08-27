/**
 * Get dependencies.
 */
const express = require('express'),
      path = require('path'),
      favicon = require('serve-favicon'),
      logger = require('morgan');

/**
 * Get lib.
 */
const errorHandler = require('./lib/errorHandler');

/**
 * Create routes.
 */
const routes = require('./routes/index');

/**
 * Create app.
 */
const app = express();

/**
 * Setup view engine.
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/**
 * Middlewares.
 */
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Use routes.
 */
app.use('/', routes);
app.use(errorHandler);

/**
 * Export app.
 */
module.exports = app;
