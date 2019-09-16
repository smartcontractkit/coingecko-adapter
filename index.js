const request = require('request');
const _ = require('lodash');

const convertFromTicker = (ticker) => {
  request({
    url: "https://api.coingecko.com/api/v3/coins/list",
    json: true
  }, (error, response, body) => {
    if (error || response.statusCode >= 400) {
      return ticker;
    } else {
      const result = _.filter(body, x => x.symbol === ticker.toLowerCase());
      console.log(result[0]);
      return result[0].id;
    }
  });
}

const createRequest = (input, callback) => {
  let url = "https://api.coingecko.com/api/v3/simple/price";
  let coin = input.data.coin || "ethereum";
  coin = convertFromTicker(coin);
  const market = input.data.market || "USD";
  url = url + coin;

  const queryObj = {
    ids: coin,
    vs_currencies: market
  };

  const options = {
    url: url,
    qs: queryObj,
    json: true
  };
  request(options, (error, response, body) => {
    if (error || response.statusCode >= 400) {
      callback(response.statusCode, {
        jobRunID: input.id,
        status: "errored",
        error: body,
        errorMessage : body.error,
        statusCode: response.statusCode
      });
    } else {
      callback(response.statusCode, {
        jobRunID: input.id,
        data: body,
        result: body.market_data.current_price.usd,
        statusCode: response.statusCode
      });
    }
  });
};

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data);
  });
};

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data);
  });
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest;
