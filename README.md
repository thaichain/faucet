# faucet

## Before start

Edit `ui/.env` change `REACT_APP_API_URL` to `api` url

## Build API

```
docker-compose build api
```

## Build UI

```
docker-compose build ui
```

## Start

```
docker-compose up -d api ui
```