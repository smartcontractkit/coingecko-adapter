const assert = require('chai').assert;
const createRequest = require('../index.js').createRequest;

describe('createRequest', () => {
  const jobID = "278c97ffadb54a5bbb93cfec5f7b5503";

  context('Requests data', () => {
    const req = {
      id: jobID,
      data: {
        coin: "ETH",
        market: "USD"
      }
    };

    it('returns data to the node', (done) => {
      createRequest(req, (statusCode, data) => {
        assert.equal(statusCode, 200);
        assert.equal(data.jobRunID, jobID);
        assert.isNotEmpty(data.data);
        assert.isNumber(data.result);
        done();
      });
    });
  });

  context('with bad input', () => {
    const badReq = {
      id: jobID,
      data: {
        coin: "notreal"
      }
    };

    it('returns an error', (done) => {
      createRequest(badReq, (statusCode, data) => {
        assert.isAbove(statusCode, 400);
        assert.equal(data.jobRunID, jobID);
        assert.equal(data.status, "errored");
        assert.isNotEmpty(data.errorMessage);
        done();
      });
    });
  });
});