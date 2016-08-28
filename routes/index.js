/**
 * Get core dependencies.
 */
const express = require('express'),
      router = express.Router();

/**
 * Get services.
 */
var HomePage = require('../services/homepage');

/**
 * Homepage.
 */
router.get('/', function(req, res, next) {
  HomePage.render(req, res);
});

/**
 * Export router.
 */
module.exports = router;
