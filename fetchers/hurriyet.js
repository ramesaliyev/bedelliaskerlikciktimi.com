/**
 * Get BaseFetcher.
 */
var BaseFetcher = require('./BaseFetcher');

/**
 * Get dependencies.
 */
const config = global.config,
      util = require('util'),
      http = require("https"),
      hurriyetTokens = require('../configs/hurriyet.json');

/**
 * Hurriyet Fetcher.
 *
 * @constructor
 */
function Hurriyet() {
  Hurriyet.super_.apply(this, arguments);
}

/**
 * Extend from base fetcher.
 */
util.inherits(Hurriyet, BaseFetcher);

/**
 * Collect last two pages from source.
 */
Hurriyet.prototype.collect = function(done) {
  const options = {
    method: 'GET',
    hostname: config.fetchers.hurriyet.hostname,
    port: null,
    path: config.fetchers.hurriyet.path,
    headers: {
      accept: 'application/json',
      apikey: hurriyetTokens.api_key
    }
  };

  /**
   * Process fetched data.
   */
  const processFetchedData = function(data) {
    return data.List.map(function(news) {
      return {
        url: news.Url,
        text: news.Description,
        date: news.StartDate,
        author: ''
      };
    });
  };

  /**
   * Fetch data!
   */
  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);

      if (body) {
        const stringifiedBody = body.toString("utf8");

        if (stringifiedBody) {
          let body;

          try {
            body = JSON.parse(stringifiedBody)
          } catch(e) {
            return done('JSON Parsing Error');
          }

          return done(null, processFetchedData(body));    
        }
      }

      done('Source cannot fetched.');
    });
  });

  req.end();
};

/**
 * Create instance
 */
var hurriyet = new Hurriyet('hurriyet');

/**
 * Export.
 * @type {Hurriyet}
 */
module.exports = hurriyet;
