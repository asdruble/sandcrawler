/**
 * Sandcrawler Basic Tests
 * ========================
 *
 * Basic scraping tests to scaffold the API.
 */
var assert = require('assert'),
    sandcrawler = require('../index.js');

describe('Basic tests', function() {
  this.timeout(3000);

  var crawler = null;

  before(function(done) {
    sandcrawler.create({}, function(err, instance) {
      crawler = instance;

      // Debug hook
      crawler.on('phantom:log', function(message) {
        console.log(message);
      });

      done();
    });
  });

  it('should be possible to scrape from a lone url.', function(done) {
    var simpleList = [
      'http://nicesite.com',
      'http://awesomesite.com',
      'http://prettysite.com',
      'http://unknownsite.com'
    ];

    crawler
      .task('http://localhost:8001/basic.html')
      .inject(function() {

        // JawaScript
        var data = artoo.scrape('.url-list a', 'href');
        artoo.done(data);
      })
      .then(function(data) {

        assert.deepEqual(data, simpleList);
        done();
      });
  });

  it('should be possible to scrape to the page log.', function(done) {

    crawler
      .task('http://localhost:8001/basic.html')
      .inject(function() {
        console.log('Hello world!');
        artoo.done();
      })
      .on('page:log', function(data) {
        assert(data.url === 'http://localhost:8001/basic.html');
      })
      .then(done);
  });

  it('should be possible to subscribe to the page errors.', function(done) {

    crawler
      .task('http://localhost:8001/basic.html')
      .inject(function() {
        throw Error('test');
      })
      .on('page:error', function(data) {
        assert(data.url === 'http://localhost:8001/basic.html');
        assert(data.message === 'Error: test');
      })
      .fail(done);
  });
});