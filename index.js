const rp = require('request-promise')
const _ = require('lodash')
const retries = process.env.RETRIES || 3
const delay = process.env.RETRY_DELAY || 1000
const timeout = process.env.TIMEOUT || 1000

const requestRetry = (options, retries) => {
  return new Promise((resolve, reject) => {
    const retry = (options, n) => {
      return rp(options)
        .then(response => {
          if (response.body.error || _.isEmpty(response.body)) {
            if (n === 1) {
              reject(response)
            } else {
              setTimeout(() => {
                retries--
                retry(options, retries)
              }, delay)
            }
          } else {
            return resolve(response)
          }
        })
        .catch(error => {
          if (n === 1) {
            reject(error)
          } else {
            setTimeout(() => {
              retries--
              retry(options, retries)
            }, delay)
          }
        })
    }
    return retry(options, retries)
  })
}

const convertFromTicker = (ticker, coinId, callback) => {
  if (coinId.length !== 0)
    return callback(coinId.toLowerCase())

  requestRetry({
    url: 'https://api.coingecko.com/api/v3/coins/list',
    json: true,
    timeout,
    resolveWithFullResponse: true
  }, retries)
    .then(response => {
      let coin = response.body.find(x => x.symbol.toLowerCase() === ticker.toLowerCase())
      if (typeof coin === 'undefined')
        return callback('undefined')
      return callback(coin.id.toLowerCase())
    })
    .catch(error => {
      return callback('')
    })
}

const createRequest = (input, callback) => {
  const symbol = input.data.from || input.data.coin
  convertFromTicker(symbol, input.data.coinid || '', (coin) => {
    let url = 'https://api.coingecko.com/api/v3/simple/price'
    const market = input.data.to || input.data.market || 'usd'

    const queryObj = {
      ids: coin,
      vs_currencies: market
    }

    const options = {
      url: url,
      qs: queryObj,
      json: true,
      timeout,
      resolveWithFullResponse: true
    }
    requestRetry(options, retries)
      .then(response => {
        const result = response.body[coin.toLowerCase()][market.toLowerCase()]
        response.body.result = result
        callback(response.statusCode, {
          jobRunID: input.id,
          data: response.body,
          result,
          statusCode: response.statusCode
        })
      })
      .catch(error => {
        callback(error.statusCode, {
          jobRunID: input.id,
          status: 'errored',
          error,
          statusCode: error.statusCode
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
