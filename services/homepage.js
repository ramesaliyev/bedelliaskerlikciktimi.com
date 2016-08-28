/**
 * Get requirements.
 */
var config = global.config,
    fetchers = config.fetchers,
    async = require('async'),
    utils = require('../lib/utils'),
    eksisozluk = require('../fetchers/eksisozluk'),
    twitter = require('../fetchers/twitter'),
    debug = require('debug')('app:service:homepage');

/**
 * Homepage service.
 */
function HomePage() {
  this.lastRenderTime = 0;
  this.lastRenderedHTML = null;
}

/**
 * Get homepage data.
 */
HomePage.prototype.getData = function(done) {
  var self = this;

  /**
   * Create page data.
   */
  var pageData = {
    title: config.site.title,
    description: config.site.description,
    keywords: config.site.keywords,
    status: config.status,
    statusMessage: utils.getRandomFromArray(config.statusMessages[config.status]),
    statusText: config.statusTexts[config.status],
    utils: utils
  };

  /**
   * Set fetchers instances.
   */
  fetchers.eksisozluk.instance = eksisozluk;
  fetchers.twitter.instance = twitter;

  /**
   * Create fetch-able stream objects.
   */
  var streams = Object.keys(fetchers).reduce(function(acc, fetcherName) {
    var fetcher = fetchers[fetcherName];

    acc[fetcher.name] = function(callback) {
      fetcher.instance.get(function(err, data) {
        if (err) {
          return callback(err);
        }

        fetcher.content = data.data;
        fetcher.updateTime = data.updateTime;
        fetcher.instance = null;

        callback(null, fetcher);
      })
    };

    return acc;
  }, {});

  /**
   * Render page.
   */
  async.parallel(streams, function(err, responses) {
    if (err) {
      return done(err);
    }

    // Put streams in order.
    pageData.streams = [
      responses.twitter,
      responses.eksisozluk
    ];

    done(null, pageData);
  });
};

/**
 * Get render and send data.
 */
HomePage.prototype.render = function(req, res) {
  var self = this;

  // Send cached html.
  if (Date.now() - this.lastRenderTime < 360000) {
    debug('Serving from html cache...');
    return res.send(this.lastRenderedHTML);
  }

  // Get data.
  this.getData(function(err, data) {
    if (err) {
      return res.render('error');
    }

    res.render('index', data, function(err, html) {
      self.lastRenderTime = Date.now();
      self.lastRenderedHTML = html;

      res.send(html);
    });
  })
};

/**
 * Eport
 */
module.exports = new HomePage();