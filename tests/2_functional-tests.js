const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('GET /api/stock-prices => stockData object', function() {
    test('Viewing one stock: GET request to /api/stock-prices/', (done) => {
      chai.request(server)
        .keepOpen()
        .get('/api/stock-prices')
        .query({ stock: 'GOOG' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.price, 128.77);
          done();
        });
    });

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', (done) => {
      chai.request(server)
        .keepOpen()
        .get('/api/stock-prices')
        .query({ stock: 'MSFT', like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.equal(res.body.stockData.price, 326.66);
          assert.equal(res.body.stockData.likes, 1);
          done();
        });
    });

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
      chai.request(server)
        .keepOpen()
        .get('/api/stock-prices')
        .query({ stock: 'MSFT', like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.equal(res.body.stockData.price, 326.66);
          assert.equal(res.body.stockData.likes, 1);
          done();
        });
    });

    test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
      chai.request(server)
        .keepOpen()
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, 'GOOG');
          assert.equal(res.body.stockData[0].price, 128.77);
          assert.equal(res.body.stockData[1].stock, 'MSFT');
          assert.equal(res.body.stockData[1].price, 326.66);
          done();
        });
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
      chai.request(server)
        .keepOpen()
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'], like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, 'GOOG');
          assert.equal(res.body.stockData[0].price, 128.77);
          assert.equal(res.body.stockData[0].rel_likes, 0);
          assert.equal(res.body.stockData[1].stock, 'MSFT');
          assert.equal(res.body.stockData[1].price, 326.66);
          assert.equal(res.body.stockData[1].rel_likes, 0);
          done();
        });
    });
  });
});