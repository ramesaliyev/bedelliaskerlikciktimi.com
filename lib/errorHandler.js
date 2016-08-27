/**
 * Just render error page nothing more.
 */
module.exports = function(req, res, next) {
  res.render('error');
};