/**
 * Get utils components.
 */
const moment = require('moment');

/**
 * Utils object.
 */
var Utils = {
  moment: moment
};

/**
 * Get random value from array.
 */
Utils.getRandomFromArray = function(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
};

/**
 * Export.
 */
module.exports = Utils;