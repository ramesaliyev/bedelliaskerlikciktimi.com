/**
 * Get core dependencies.
 */
const express = require('express'),
      router = express.Router();

/**
 * Get requirements.
 */
var config = global.config,
    fetchers = config.fetchers,
    async = require('async'),
    utils = require('../lib/utils'),
    eksisozluk = require('../fetchers/eksisozluk');

/**
 * Homepage.
 */
router.get('/', function(req, res, next) {
  /**
   * Create page data.
   */
  var pageData = {
    title: config.site.title,
    description: config.site.description,
    keywords: config.site.keywords,
    status: config.status,
    statusMessage: utils.getRandomFromArray(config.statusMessages[config.status]),
    statusText: config.statusTexts[config.status]
  };

  /**
   * Set fetchers instances.
   */
  fetchers.eksisozluk.instance = eksisozluk;
  fetchers.twitter.instance = eksisozluk;

  /**
   * Create ordered fetchers array.
   */
  var orderedFetchers = [
    fetchers.twitter,
    fetchers.eksisozluk
  ];

  /**
   * Create fetch-able stream objects.
   */
  var streams = orderedFetchers.reduce(function(acc, fetcher) {
    acc[fetcher.name] = function(callback) {
      fetcher.instance.get(function(err, data) {
        if (err) {
          return callback(err);
        }

        fetcher.content = data;
        fetcher.updateTime = fetcher.instance.updateTime;
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
      return res.render('error');
    }

    pageData.streams = responses;

    res.render('index', pageData, function(err, html) {
      res.send(html);
    });
  });
});

/**
 * Export router.
 */
module.exports = router;
