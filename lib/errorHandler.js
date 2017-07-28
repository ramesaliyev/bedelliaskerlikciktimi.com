/**
 * Just render error page nothing more.
 */
module.exports = function(req, res, next, error) {
  console.error('ERROR', error);
  res.render('error');
};
