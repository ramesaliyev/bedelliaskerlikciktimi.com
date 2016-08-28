/**
 * Get BaseFetcher.
 */
var BaseFetcher = require('./BaseFetcher');

/**
 * Get dependencies.
 */
const config = global.config,
      util = require('util'),
      async = require('async');

/**
 * Values
 */
const FETCH_URL = config.fetchers.eksisozluk.fetchURL;

/**
 * EksiSozluk Fetcher.
 *
 * @constructor
 */
function EksiSozluk() {
  EksiSozluk.super_.apply(this, arguments);
}

/**
 * Extend from base fetcher.
 */
util.inherits(EksiSozluk, BaseFetcher);

/**
 * Collect last two pages from source.
 */
EksiSozluk.prototype.collect = function(done) {
  var self = this;

  async.waterfall([
    // Fetch first page.
    function(callback) {
        self.fetch(self.fetchURL, callback);
    },
    // Get number of last page.
    function (response, callback) {
      callback(null, +JSON.parse(response).page_count);
    },
    // Get content of last and previous page.
    function(lastPageNum, callback) {
      async.parallel({
        last: function(cb) {
          self.fetch(self.fetchURL + '?page=' + lastPageNum, cb);
        },
        prev: function(cb) {
          self.fetch(self.fetchURL + '?page=' + (lastPageNum - 1), cb);
        }
      }, callback);
    },
    // Decorate entries.
    function(pages, callback) {
      var entries = [].concat(
        JSON.parse(pages.prev).entry_detail_models,
        JSON.parse(pages.last).entry_detail_models
      ).reverse().map(function(entry) {
        var entryDate = entry.date.split(' '),
            date = entryDate[0].split('.'),
            time = entryDate[1].split(':'),
            timestamp = +(new Date(+date[2], +(--date[1]), +date[0], +time[0], +time[1]));

        return {
          url: 'https://eksisozluk.com/entry/' + entry.entry_id,
          text: entry.content,
          date: timestamp,
          author: entry.author
        }
      });

      callback(null, entries);
    }
  ], done)
};

/**
 * Create instance
 */
var eksisozluk = new EksiSozluk('eksisozluk', FETCH_URL);

/**
 * Export.
 * @type {EksiSozluk}
 */
module.exports = eksisozluk;