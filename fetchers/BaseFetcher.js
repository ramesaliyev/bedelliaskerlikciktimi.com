/**
 * Get dependencies.
 */
const fs = require('fs'),
      path = require('path'),
      request = require('request'),
      async = require('async'),
      schedule = require('node-schedule'),
      modifyText = require('../lib/modifyText');

/**
 * Core fetcher.
 */
function BaseFetcher(name, fetchURL) {
  // Keep values.
  this.name = name;
  this.fetchURL = fetchURL;

  // File that data will save.
  this.dataFile = path.join(__dirname + '/../data/' + this.name  + '.json');

  // Create instance.
  this.debug = require('debug')('app:fetcher:' + this.name);

  // Keep cached data.
  this.cache = null;

  // Schedule auto-fetch.
  this.schedule();
}

/**
 * Remove cached data file.
 */
BaseFetcher.prototype.clear = function(done) {
  var self = this;

  fs.access(this.dataFile, fs.R_OK | fs.W_OK, function(err) {
    if (!err) {
      return fs.unlink(self.dataFile, done);
    }

    done(null);
  });
};

/**
 * Fetch data.
 */
BaseFetcher.prototype.fetch = function(url, done) {
  request(url, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      return done(null, body);
    }

    done({ err: err, res: res });
  });
};

/**
 * Schedule data auto-update.
 */
BaseFetcher.prototype.schedule = function() {
  var self = this;

  schedule.scheduleJob('*/5 * * * *', function(){
    async.waterfall([
      function(callback) {
        self.clear(callback)
      },
      function(callback) {
        self.get(callback, true)
      }
    ], function(err) {
      if (!err) {
        self.debug('New data succesfully fetched.', new Date());
      }
    });
  });
};

/**
 * Get and cache data.
 */
BaseFetcher.prototype.get = function(done, force) {
  var self = this;

  // Return immediately if there is cached data.
  if (this.cache && !force) {
    return done(null, this.cache);
  }

  // Otherwise...
  async.waterfall([
    // Check for saved data.
    function(callback) {
      fs.access(self.dataFile, fs.R_OK | fs.W_OK, function(err) {
        callback(null, err);
      });
    },

    // Try to get saved data.
    function(notExist, callback) {
      if (notExist) {
        return callback(null, null);
      }

      fs.readFile(self.dataFile, 'utf8', function(err, data) {
        if (err) {
          return callback(null, null);
        }

        try {
          data = JSON.parse(data);
        }
        catch(e) {
          return callback(null, null);
        }

        callback(null, data);
      });
    },

    // Fetch data if there is nothing in saved data.
    function (data, callback) {
      if (data) {
        return callback(null, data);
      }

      // If saved data does not exist.
      self.collect(function(err, data) {
        if (err) {
          return callback(err);
        }

        // Decorate data.
        data = data.map(function(record) {
            // Modify texts.
            record.text = modifyText(record.text);

            return record;
        });

        // Create content to cache/store.
        var content = {
          updateTime: Date.now(),
          data: data
        };

        // Cache in memory.
        self.cache = content;

        // Provide entries.
        callback(null, content);
      })
    },

    // Save data.
    function(data, callback) {
      self.clear(function() {
        fs.writeFile(self.dataFile, JSON.stringify(data), 'utf8', function() {
          callback(null, data);
        });
      });
    }
  ], done)
};

/**
 * Export
 */
module.exports = BaseFetcher;