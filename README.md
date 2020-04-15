# Chainlink CoinGecko External Adapter

External adapter for use on Google Cloud Platform or AWS Lambda. Zip and upload, then use trigger URL as bridge endpoint.

## Input Params

- `coinid`: The CoinGecko id of the coin to query (required if not using `from`)
- `base`, `from`, or `coin`: The ticker of the coin to query (required if not using `coinid`)
- `quote`, `to`, or `market`: The currency to convert to

## Output Format

```json
{
 "jobRunID": "1",
 "data": {
  "ethereum": {
   "usd": 157.24
  },
  "result": 157.24
 },
 "result": 157.24,
 "statusCode": 200
}
```

## Install

```bash
npm install
```

## Test

```bash
npm test
```

## Create the zip

```bash
zip -r cl-coingecko.zip .
```

## Run with Docker

```bash
docker build . -t coingecko-adapter
docker run -d \
    -p 8080:8080 \
    -e EA_PORT=8080 \
    coingecko-adapter
```

## Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 8.10 for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `cl-coingecko.zip` file
- Handler should remain index.handler
- Save


## Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `cl-coingecko.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
