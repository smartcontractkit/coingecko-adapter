const request = require('request');

const convertFromTicker = ticker => {
	switch (ticker.toUpperCase()) {
		case "BTC":
			return "bitcoin"
		case "ETH":
			return "ethereum"
		case "LINK":
			return "chainlink"
		default:
			return ticker
	}
}

const createRequest = (input, callback) => {
  let url = "https://api.coingecko.com/api/v3/coins/";
  const coin = input.data.coin || "ethereum";
  const symbol = convertFromTicker(coin)
  url = url + symbol

  const queryObj = {
    localization: false,
	tickers: false,
	market_data: true,
	community_data: false,
	developer_data: false,
	sparkline: false
  }

  const options = {
    url: url,
    qs: queryObj,
    json: true
  }
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