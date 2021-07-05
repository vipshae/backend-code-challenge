const express = require('express');
const fs = require('fs');
const DbManager = require('./helpers/db-manager');

const PokemonModel = require('./models/Pokemon');
const PokemonTypeModel = require('./models/PokemonType');
const PokemonFilePath = `${__dirname}/pokemons.json`;
const pokemonDbName = 'pokemon_db';
const mongoDbUrl = `mongodb://127.0.0.1:27017/${pokemonDbName}`;

// Express
const app = express();
const port = process.env.PORT || 3000;

// import controllers
const indexRoute = require('./routes/index');
const queryAllPokemons= require('./routes/query-all');
const queryPokemonByName = require('./routes/query-by-name');
const queryPokemonById = require('./routes/query-by-id');
const queryPokemonTypes = require('./routes/query-types');
const queryPokemonByType = require('./routes/query-by-type');
const markUnmarkPokemonFavoriteById = require('./routes/mark-favorite');
const queryPokemonByFavorite = require('./routes/query-by-favorite');

// app routes with controllers
app.use('/', indexRoute);
app.use('/pokemons', queryAllPokemons);
app.use('/pokemon/name', queryPokemonByName);
app.use('/pokemon/id', queryPokemonById);
app.use('/pokemon/types', queryPokemonTypes);
app.use('/pokemon/type', queryPokemonByType);
app.use('/pokemon/favorite/id', markUnmarkPokemonFavoriteById);
app.use('/pokemon/favorite', queryPokemonByFavorite);

let dbConnObj;

async function main() {
  try {
    // connect to DB and event checkers
    dbConnObj = await DbManager.connectDb(mongoDbUrl)
    
    dbConnObj.on('error', err => {
      console.error(`MongoDb connection had error: ${err}`);
      throw err;
    });
    
    dbConnObj.on('disconnected', () => {
      console.log('MongoDb connection was disconnected');
    });
    
    dbConnObj.on('connected', () => {
      console.log('MongoDb connection was connected');
    });

    // Load DB Models with data from file pokemonFileData
    const pokemonFileToLoad = fs.readFileSync(PokemonFilePath, 'utf8');
    const pokemonFileData = JSON.parse(pokemonFileToLoad);
    await DbManager.loadPokemonCollectionWithData(PokemonModel, pokemonDbName, pokemonFileData);
    await DbManager.loadPokemonTypeCollectionWithData(PokemonTypeModel, pokemonDbName, pokemonFileData);
    
    // Express server start
    app.listen(port, () => {
      console.log('Server is listening on port', port);
    });
  
  } catch(err) {
    console.error(err);
    if(dbConnObj.readyState) {
      console.log('Closing existing db connection');
      await dbConnObj.closeDb();
    }
    process.exit(1);
  }
}


main();

