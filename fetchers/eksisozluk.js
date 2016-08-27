/**
 * Get dependencies.
 */
const fs = require('fs'),
      request = require('request'),
      async = require('async');

/**
 * Values
 */
const FETCH_URL = 'http://codeeksi.com/v1/eksifeed/titles/bedelli-askerlik--39846',
      DATA_FILE = __dirname + '/../data/eksisozluk.json';

/**
 * Cached data.
 */
var cachedData = null;

/**
 * EksiSozluk Fetcher.
 *
 * @constructor
 */
function EksiSozluk() {}

/**
 * Clear caches.
 */
EksiSozluk.prototype.purge = function(done) {
  cachedData = null;
  fs.unlink(DATA_FILE, done);
};

/**
 * Fetch data.
 */
EksiSozluk.prototype.fetch = function(url, done) {
  request(url, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      return done(null, body);
    }

    done({ err: err, res: res });
  });
};

/**
 * Collect last two pages from source.
 */
EksiSozluk.prototype.collect = function(done) {
  var self = this;

  async.waterfall([
    // Fetch first page.
    function(callback) {
        self.fetch(FETCH_URL, callback);
    },
    // Get number of last page.
    function (response, callback) {
      callback(null, +JSON.parse(response).page_count);
    },
    // Get content of last and previous page.
    function(lastPageNum, callback) {
      async.parallel({
        last: function(cb) {
          self.fetch(FETCH_URL + '?page=' + lastPageNum, cb);
        },
        prev: function(cb) {
          self.fetch(FETCH_URL + '?page=' + (lastPageNum - 1), cb);
        }
      }, callback);
    },
    // Decorate entries.
    function(pages, callback) {
      var entries = [].concat(
        JSON.parse(pages.prev).entry_detail_models,
        JSON.parse(pages.last).entry_detail_models
      ).reverse().map(function(entry) {
        return {
          url: 'https://eksisozluk.com/entry/' + entry.entry_id,
          text: entry.content,
          date: entry.date,
          author: entry.author
        }
      });

      // Update update time.
      self.updateTime = new Date();

      callback(null, entries);
    }
  ], done)
};

/**
 * Get data.
 */
EksiSozluk.prototype.get = function(done) {
  var self = this;

  // Return immediately if there is cached data.
  if (cachedData) {
    return done(null, cachedData);
  }

  // Otherwise...
  async.waterfall([
    // Check for saved data.
    function(callback) {
      fs.access(DATA_FILE, fs.R_OK | fs.W_OK, function(err) {
        callback(null, err);
      });
    },

    // Try to get saved data.
    function(notExist, callback) {
      if (notExist) {
        return callback(null, null);
      }

      fs.readFile(DATA_FILE, 'utf8', function(err, entries) {
        if (err) {
          return callback(null, null);
        }

        try {
          entries = JSON.parse(entries);
        }
        catch(e) {
          return callback(null, null);
        }

        callback(null, entries);
      });
    },

    // Fetch data if there is no entries from saved data.
    function (entries, callback) {
      if (entries) {
        return callback(null, entries);
      }

      // If saved data does not exist.
      self.collect(function(err, entries) {
        if (err) {
          return callback(err);
        }

        // Save entries.
        fs.unlink(DATA_FILE, function() {
          fs.writeFile(DATA_FILE, JSON.stringify(entries), 'utf8');
        });

        // Provide entries.
        callback(null, entries);
      })
    }
  ], done)
};

/**
 * Create instance
 */
var eksisozluk = new EksiSozluk();

/**
 * Export.
 * @type {EksiSozluk}
 */
module.exports = eksisozluk;