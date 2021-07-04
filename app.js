const express = require('express');
const fs = require('fs');
const DbManager = require('./helpers/db-manager');

const PokemonModel = require('./models/Pokemon');
const PokemonTypeModel = require('./models/PokemonType');
const PokemonFilePath = `${__dirname}/pokemons.json`;

// Express
const app = express();
const port = process.env.PORT || 3000;

// import routes
const indexRoute = require('./routes/index');
const queryAllPokemons= require('./routes/query-all');
const queryPokemonByName = require('./routes/query-by-name');
const queryPokemonById = require('./routes/query-by-id');
const queryPokemonTypes = require('./routes/query-types');
const queryPokemonByType = require('./routes/query-by-type');
const markUnmarkPokemonFavoriteById = require('./routes/mark-favorite');
const queryPokemonByFavorite = require('./routes/query-by-favorite');

// controllers
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
    // connect to DB and event check on errors
    dbConnObj = await DbManager.connectDb()
    dbConnObj.on('error', err => {
      console.error(`MongoDb connection error out: ${err}`);
      throw err;
    })
    dbConnObj.on('disconnected', () => {
      console.error('MongoDb connection reset');
      throw new Error('MongoDb connection reset');
    })

    // Load DB Models with data from file pokemonFileData
    const pokemonFileToLoad = fs.readFileSync(PokemonFilePath, 'utf8');
    const pokemonFileData = JSON.parse(pokemonFileToLoad);
    await DbManager.loadPokemonCollectionWithData(PokemonModel, pokemonFileData);
    await DbManager.loadPokemonTypeCollectionWithData(PokemonTypeModel, pokemonFileData);
    
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

