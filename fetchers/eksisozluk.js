/**
 * Get BaseFetcher.
 */
var BaseFetcher = require('./BaseFetcher');

/**
 * Get dependencies.
 */
const config = global.config,
      util = require('util'),
      osmosis = require('osmosis'),
      cheerio = require('cheerio');

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
 * Helpers
 */

/**
 * Scrap data.
 */
const makeRequest = (pageNum) => (
  osmosis.get(
    config.fetchers.eksisozluk.fetchURL + (pageNum ? '?p=' + pageNum : '')
  )
);

/**
 * Parse fetched page.
 */
const getPage = (pageNum) =>
  new Promise(resolve =>
    makeRequest(pageNum)
      .then(resolve)
  )
    .then(context => context.toString())
    .then(html => cheerio.load(html))

/**
 * Get last page of title.
 */
const getLastPage = ($) => (
  +$('.pager').attr('data-pagecount')   
);

/**
 * Convert title date string to timestamp.
 */
const convertTimeStringToTimestamp = timeString => {
  var entryDate = timeString;

  if (entryDate.indexOf('~') > -1) {
    entryDate = entryDate.split('~')[0]; 
  }

  entryDate = entryDate.split(' ');

  var date = entryDate[0].split('.');

  if (entryDate[1]) {
    var time = entryDate[1].split(':');
    timestamp = +(new Date(+date[2], +(--date[1]), +date[0], +time[0], +time[1]));
  } else {
    timestamp = +(new Date(+date[2], +(--date[1]), +date[0]));
  }

  return timestamp;
};

/**
 * Get entries of page.
 */
const getEntries = ($) => {
  const entries = [];

  $('#entry-list > li').each((index, el) => {
    const $el = $(el);
    const $info = $el.find('footer .info');  
    const $date = $info.children('.entry-date');
    const $author = $info.children('.entry-author');
    
    entries.push({
      url: `https://eksisozluk.com${$date.attr('href')}`,
      text: $el.children('.content').html(),
      date: convertTimeStringToTimestamp($date.text()),
      author: $author.text()
    })
  });

  return entries;
};

/**
 * Collect last two pages from source.
 */
EksiSozluk.prototype.collect = function(done) {
  getPage()
    .then($firstPage => {
      // Get last page.
      const lastPageNum = getLastPage($firstPage);

      // Fetch last and previous page.
      return Promise.all([
        getPage(lastPageNum),
        getPage(lastPageNum-1)
      ]);
    })
    .then(([$lastPage, $prevPage]) => {
      return [].concat(
        getEntries($prevPage),
        getEntries($lastPage)  
      ).reverse();  
    })
    .then(entries => done(null, entries))
    .catch(done)  
};

/**
 * Get and cache data.
 */
EksiSozluk.prototype.mapEveryRecord = function(data) {
    return data.map(function(record) {
        return record;
    });
};
/**
 * Create instance
 */
var eksisozluk = new EksiSozluk('eksisozluk');

/**
 * Export.
 * @type {EksiSozluk}
 */
module.exports = eksisozluk;
