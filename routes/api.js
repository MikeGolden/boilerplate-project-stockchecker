'use strict';

const StockModel = require('../models');
const fetch = require('node-fetch');
const crypto = require('crypto');

// Anonymize the IP address
function anonymizeIP(ip) {
// Truncate the IP address to the desired length
  const truncatedIP = ip.substring(0, ip.lastIndexOf('.')); // Example: "192.168.0"

  // Alternatively, you can hash the IP address
// const hashedIP = crypto.createHash('sha256').update(ip).digest('hex'); // Example: "a9c824ef3fbbd1a1d26818307c3d91ae1e58855a92492c019a9c9370a55b2c24"

  // Alternatively, you can mask the IP address
  //const maskedIP = ip.substring(0, ip.lastIndexOf('.')) + '.0'; // Example: "192.168.0.0"

  
 // Return the anonymized IP address
  return truncatedIP;
}

async function createStock(stock, like, ip) {
  const newStock = new StockModel({
    symbol: stock,
    likes: like ? 1 : 0,
    likedBy: like ? [ip] : [],
  });
  const savedNew = await newStock.save();
  return savedNew;
}

async function findStock(stock) {
  return await StockModel.findOne({ symbol: stock }).exec();
}

async function saveStock(stock, like, ip) {
  let saved = {};
  const foundStock = await findStock(stock);
  if (!foundStock) {
    const createdStock = await createStock(stock, like, ip);
    saved = createdStock;
    return saved;
  } else {
    if (like && foundStock.likedBy && foundStock.likedBy.indexOf(ip) === -1) {
      foundStock.likes += 1;
      foundStock.likedBy.push(ip);
    }
    saved = await foundStock.save();
    return saved;
  }
}

async function getStock(stock) {
  try {
    const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);

    if (!response.ok) {
      const errorDetails = await response.text(); // getting more details about the error
      console.error(`Error details: ${errorDetails}`);
      throw new Error('Failed to fetch stock data');
    }

    const { symbol, latestPrice } = await response.json();
    return { symbol, latestPrice };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
  const { stock, like } = req.query;
 // Anonymize the user's IP address
  const ip = req.ip; // My `ip` variable is defined

  const anonymizedIP = anonymizeIP(ip);

  try {
    // Normalize stock to be an array
    const stocks = Array.isArray(stock) ? stock : [stock];

    if (stocks.length > 2) {
      throw new Error("Cannot process more than two stocks");
    }

    const stockResponses = [];

    for (let i = 0; i < stocks.length; i++) {
      const stockData = await getStock(stocks[i]);

      if (!stockData.symbol) {
        res.json({ stockData: { likes: like ? 1 : 0 } });
        return;
      }

      const filter = { symbol: stockData.symbol };
      let update;

      if (like) {
        update = {
          $set: { price: stockData.latestPrice },
          $addToSet: { likedBy: ip },
          $inc: { likes: 1 }
        };
      } else {
        update = {
          $set: { price: stockData.latestPrice }
        };
      }

      const options = { upsert: true, new: true, setDefaultsOnInsert: true, useFindAndModify: false };
      let stockDoc = await StockModel.findOneAndUpdate(filter, update, options);

      stockResponses.push({ stock: stockDoc.symbol, price: stockDoc.price, likes: stockDoc.likes });
    }

    // If 2 stocks, calculate rel_likes
    if (stockResponses.length === 2) {
      const rel_likes = stockResponses[0].likes - stockResponses[1].likes;
      stockResponses[0].rel_likes = rel_likes;
      stockResponses[1].rel_likes = -rel_likes;

      delete stockResponses[0].likes;
      delete stockResponses[1].likes;
    }

    // Send the response
  if (stockResponses.length === 1) {
    res.json({ stockData: stockResponses[0] });
  } else {
    res.json({ stockData: stockResponses });
  }

} catch (error) {
  console.error(error);
  res.status(400).json({ error: 'Failed to fetch stock data' });
}
  });
};