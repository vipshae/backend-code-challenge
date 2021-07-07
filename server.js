const fs = require('fs');
const DbManager = require('./helpers/db-manager');
const PokemonModel = require('./models/Pokemon');
const PokemonFilePath = `${__dirname}/pokemons.json`;
const pokemonDbName = 'pokemon_db';
const mongoDbUrl = `mongodb://127.0.0.1:27017/${pokemonDbName}`;

const port = process.env.PORT || 3000;
const app = require('./app');

async function setUpDb() {
  let dbConnObj;  
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
      
  } catch(err) {
    console.error(err);
    if(dbConnObj.readyState) {
      console.log('Closing existing db connection');
      await dbConnObj.closeDb();
    }
    process.exit(1);
  }
}

app.listen(port, async () => {
  console.log('Setting up DB');
  await setUpDb();
  console.log('Server is listening on port', port);
  app.emit("serverStarted");
})

module.exports = app;