# Solution for Backend Coding Challenge

I have designed the backend for storing the provided pokemon.json data and APIs to CRUD the data. I have coded the solution in javascript with node.js as runtime.

For Database i have choose dockerized MongoDb and have used mongoose as the object modeling tool.

I have implemented a mongoose Schema Pokemon for storing the full pokemon information.

## Steps to run the app

  - To install the node packages and dependencies run: `npm i && npm i --save-dev`

  - To start the mongoDB and mongoDB express docker containers in detached mode run: `docker-compose up -d  --remove-orphans` (in order to kill the containers after run do `docker-compose down --remove-orphans`)

  - To start the server on localhost:3000 and populate the mongoDB with pokemon data, run: `npm run start`

## Supported APIs
Following are supported routes:

1. GET _/pokemons?name=(name)&type=(type)&isfavorite=(true/false)&size=(size)&page=(page)_ to query pokemons filter by name, type, isfavorite, size and page values
2. GET _/pokemon/name/:name_ to query pokemon by pokemon name
3. GET _/pokemon/id/:id'_ to query pokemon by pokemon id
4. GET _/pokemon/types_ to query all pokemon types
5. GET _/pokemon/type/:type_ to query pokemons by pokemon type
6. PUT _/pokemon/favorite/id/:id?isfavorite=(true/false)_ to mark and unmark pokemon as favorite by id
7. GET _/pokemon/favorites?isfavorite=(true/false)_  to query favorite and unfavorite pokemons"

## Steps to run tests
  - Unit and Integration Tests: `npm run test`
  - End to End Tests: `npm run test-e2e`
  - Test coverage: `npm run coverage`