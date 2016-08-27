/**
 * Get core dependencies.
 */
const express = require('express'),
      router = express.Router();

/**
 * Get requirements.
 */
var async = require('async'),
    utils = require('../lib/utils'),
    eksisozluk = require('../fetchers/eksisozluk');

/**
 * Homepage.
 */
router.get('/', function(req, res, next) {
  /**
   * The answer is no.
   */
  const status = 'no';

  /**
   * Status messages.
   */
  const statusMessages = {
    no: [
      'HAYIR', 'ÇIKMADI', 'NO', 'CIKS', 'YOH', 'I-IH'
    ],
    yes: [
      'ÇIKTI VALLA'
    ]
  };

  /**
   * Stream signatures.
   */
  var streamSignatures = [
    {
      name: 'eksisozluk',
      title: 'ekşisözlük',
      link: 'https://eksisozluk.com/bedelli-askerlik--39846',
      updateTime: null,
      instance: eksisozluk
    },
    {
      name: 'twitter',
      title: 'twitter',
      link: 'https://twitter.com/search?q=bedelli%20askerlik&src=typd',
      updateTime: null,
      instance: eksisozluk
    }
  ];

  /**
   * Create page data.
   */
  var pageData = {
    title: 'Bedelli Askerlik Çıktı Mı? (Güncel Durum Takip Merkezi)',
    statusText: utils.getRandomFromArray(statusMessages[status]),
    streams: null
  };

  /**
   * Create fetch-able stream objects.
   */
  var streams = Object.keys(streamSignatures).reduce(function(acc, name) {
    var sign = streamSignatures[name];

    acc[name] = function(callback) {
      sign.instance.get(function(err, data) {
        if (err) {
          return callback(err);
        }

        sign.content = data;
        sign.updateTime = sign.instance.updateTime;
        sign.instance = null;

        callback(null, sign);
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
