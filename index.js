const request = require('request');
const _ = require('lodash');

const convertFromTicker = (ticker, callback) => {
  request({
    url: "https://api.coingecko.com/api/v3/coins/list",
    json: true
  }, (error, response, body) => {
    if (error || response.statusCode >= 400) {
        return callback("");
    } else {
        let coin = body.find(x => x.symbol.toLowerCase() === ticker.toLowerCase());
        if (typeof coin === "undefined")
            return callback("");
        return callback(coin.name.toLowerCase());
    }
  });
};

const createRequest = (input, callback) => {
    convertFromTicker(input.data.coin || "ETH", (coin) => {
        let url = "https://api.coingecko.com/api/v3/simple/price";
        const market = input.data.market || "usd";

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
            if (_.isEmpty(body)) {
                response.statusCode = 403; // Force status code if response is empty
                body = {
                    "error": "Empty response"
                }
            }
            if (error || response.statusCode >= 400) {
                callback(response.statusCode, {
                    jobRunID: input.id,
                    status: "errored",
                    error: body,
                    errorMessage: body.error,
                    statusCode: response.statusCode
                });
            } else {
                callback(response.statusCode, {
                    jobRunID: input.id,
                    data: body,
                    result: body[coin][market.toLowerCase()],
                    statusCode: response.statusCode
                });
            }
        });
    })
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
};

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest;
