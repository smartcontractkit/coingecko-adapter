const { Requester, Validator } = require('external-adapter')

const customError = (body) => {
  if (Object.keys(body).length === 0) return true
  return false
}

const customParams = {
  base: ['base', 'from', 'coin'],
  quote: ['quote', 'to', 'market'],
  coinid: false
}

const convertFromTicker = (ticker, coinId, callback) => {
  if (typeof coinId !== 'undefined') return callback(coinId.toLowerCase())

  Requester.requestRetry({
    url: 'https://api.coingecko.com/api/v3/coins/list',
    json: true,
    resolveWithFullResponse: true
  }, customError)
    .then(response => {
      const coin = response.body.find(x => x.symbol.toLowerCase() === ticker.toLowerCase())
      if (typeof coin === 'undefined')
        return callback('undefined')
      return callback(coin.id.toLowerCase())
    })
    .catch(error => {
      return callback('Could not find data')
    })
}

const createRequest = (input, callback) => {
  let validator
  try {
    validator = new Validator(input, customParams)
  } catch (error) {
    callback(500, {
      jobRunID: input.id,
      status: 'errored',
      error,
      statusCode: 500
    })
  }

  const jobRunID = validator.validated.id
  const symbol = validator.validated.data.base
  convertFromTicker(symbol, validator.validated.data.coinid, (coin) => {
    const url = 'https://api.coingecko.com/api/v3/simple/price'
    const market = validator.validated.data.quote

    const queryObj = {
      ids: coin,
      vs_currencies: market
    }

    const options = {
      url: url,
      qs: queryObj,
      json: true,
      resolveWithFullResponse: true
    }
    Requester.requestRetry(options, customError)
      .then(response => {
        const result = Requester.validateResult(response.body, [coin.toLowerCase(), market.toLowerCase()])
        response.body.result = result
        callback(response.statusCode, {
          jobRunID,
          data: response.body,
          result,
          statusCode: response.statusCode
        })
      })
      .catch(error => {
        callback(500, {
          jobRunID,
          status: 'errored',
          error,
          statusCode: 500
        })
    })
  })
}

exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

module.exports.createRequest = createRequest
