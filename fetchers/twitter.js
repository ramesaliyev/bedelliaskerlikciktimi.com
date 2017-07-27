/**
 * Get BaseFetcher.
 */
var BaseFetcher = require('./BaseFetcher');

/**
 * Get dependencies.
 */
const config = global.config,
      util = require('util'),
      async = require('async'),
      TwitterClient = require('twitter'),
      twitterTokens = require('../configs/twitter.json');

/**
 * Values
 */
const FETCH_URL = config.fetchers.twitter.fetchURL;

/**
 * Twitter Fetcher.
 *
 * @constructor
 */
function Twitter() {
  Twitter.super_.apply(this, arguments);

  // Create client instance.
  this.client = new TwitterClient(twitterTokens);
}

/**
 * Extend from base fetcher.
 */
util.inherits(Twitter, BaseFetcher);

/**
 * Collect last two pages from source.
 */
Twitter.prototype.collect = function(done) {
  var self = this;

  // Twitter request options.
  var options = {
    q: 'bedelli askerlik -filter:retweets',
    lang: 'tr',
    count: 30
  };

  // Get tweets.
  this.client.get('search/tweets', options, function(err, tweets, res) {
    if (err) {
      return done(err);
    }

    // Decorate tweets.
    tweets = tweets.statuses.map(function(tweet) {
      return {
        url: 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
        text: tweet.text,
        date: +(new Date(tweet.created_at)),
        author: tweet.user.screen_name
      }
    });

    done(null, tweets);
  });
};

/**
 * Create instance
 */
var twitter = new Twitter('twitter');

/**
 * Export.
 * @type {EksiSozluk}
 */
module.exports = twitter;
