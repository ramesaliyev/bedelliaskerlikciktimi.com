var Utils = {};

/**
 * Get random value from array.
 */
Utils.getRandomFromArray = function(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
};

module.exports = Utils;