# Chainlink CoinGecko External Adapter

External adapter for use on Google Cloud Platform or AWS Lambda. Zip and upload, then use trigger URL as bridge endpoint.

## Input Params

- `from` or `coin`: The coin to query (required, may use ticker or name)
- `to` or `market`: The currency to convert to

## Output Format

_The JSON response is just too large to list here, see the [official documentation](https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id_)._

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
