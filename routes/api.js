'use strict';
import 'node-fetch';
const Stock = require('../model.js').Stock;


async function createStock(stockSymbol, like, ip) {
  const newStock = new Stock({
    symbol: stockSymbol,
    likes: like ? [ip] : []
  });
  const savedNew = await newStock.save();
  return savedNew;
}

async function findStock(stockSymbol) {
  return await Stock.findOne({ symbol: stockSymbol }).exec();
}

async function saveStock(stockSymbol, like, ip) {
  let savedStock = {};
  const foundStock = await findStock(stockSymbol);
  if (!foundStock) {
    const createdStock = await createStock(stockSymbol, like, ip);
    savedStock = createdStock;
    return savedStock;
  } else {
    if (like && foundStock.likes.indexOf(ip) === -1) {
      foundStock.likes.push(ip);
    }
    savedStock = await foundStock.save();
    return savedStock;
  }
}

async function getStock(stockSymbol) {
  const response = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch stock data from external API');
  }

  const { symbol, latestPrice } = await response.json();
  return { symbol, latestPrice };
}

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    const { like, stock } = req.query;

    if (Array.isArray(stock)) {
      const [stockSymbol1, stockSymbol2] = stock;

      const { symbol, latestPrice } = await getStock(stockSymbol1);
      const { symbol: symbol2, latestPrice: latestPrice2 } = await getStock(
        stockSymbol2
      );

      const firstStock = await saveStock(stockSymbol1, like, req.ip);
      const secondStock = await saveStock(stockSymbol2, like, req.ip);

      const rel_likes = firstStock.likes.length - secondStock.likes.length;
      const rel_likes2 = -rel_likes;

      const stockData = [
        {
          stock: symbol,
          price: latestPrice,
          rel_likes
        },
        {
          stock: symbol2,
          price: latestPrice2,
          rel_likes: rel_likes2
        }
      ];

      res.json({ stockData });
    } else {
      const { symbol, latestPrice } = await getStock(stock);

      if (!symbol) {
        res.json({ stockData: { likes: like ? 1 : 0 } });
      } else {
        const oneStockData = await saveStock(stock, like, req.ip);

        res.json({
          stockData: {
            stock: oneStockData.symbol,
            price: latestPrice,
            likes: oneStockData.likes.length
          }
        });
      }
    }
  });
};