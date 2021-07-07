const mongoose = require('mongoose');

// DB metadata
const pokemonDbCollectionName = 'pokemons';


exports.connectDb = async function(mongoDbUrl) {    
  console.log('Opening connection to mongoDb on url:', mongoDbUrl);
  
  await mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true, 
    serverSelectionTimeoutMS: 5000,
    useUnifiedTopology: true, 
    useFindAndModify: false, 
    useCreateIndex: true})
  .then(() => {
    console.log('Connected successfully to DB');
  })    
  .catch((err) => {
    throw err;
  });   
  
  let db = mongoose.connection;
  return db;
};

exports.closeDb = async function() {
  await mongoose.disconnect()
  .catch((err) => { 
    console.error(`MongoDb Connection Close error: ${err}`);
    throw err;
  })
  .then(() => console.log('DB Connection closed success'));
};

exports.loadPokemonCollectionWithData = async function(PokemonModel, pokemonDbName, pokemonFileData) {
  const refinedPokemonObjList = [];
  let pokeObj;
        
  for(let i = 0; i < pokemonFileData.length; i+= 1) {
    pokeObj = {};
    pokeObj.id = pokemonFileData[i].id;
    pokeObj.name = pokemonFileData[i].name,
    pokeObj.classification = pokemonFileData[i].classification,
    pokeObj.types = pokemonFileData[i].types;
    pokeObj.resistant = pokemonFileData[i].resistant;
    pokeObj.weaknesses = pokemonFileData[i].weaknesses;
    pokeObj.weight = pokemonFileData[i].weight;
    pokeObj.height = pokemonFileData[i].height;
    pokeObj.fleeRate = pokemonFileData[i].fleeRate;
    pokeObj.previousEvolutions = pokemonFileData[i]['Previous evolution(s)'];
    pokeObj.evolutionRequirements = pokemonFileData[i].evolutionRequirements;
    pokeObj.evolutions = pokemonFileData[i].evolutions;
    pokeObj.maxCP = pokemonFileData[i].maxCP;
    pokeObj.maxHP = pokemonFileData[i].maxHP;
    pokeObj.attacks = pokemonFileData[i].attacks;
    pokeObj.favorite = false;
    refinedPokemonObjList.push(pokeObj);
  }
    
  console.log(`Loading pokemon data to database: ${pokemonDbName} under collection ${pokemonDbCollectionName}`);
    
  await PokemonModel.insertMany(refinedPokemonObjList)
  .then(() => {
    console.log('LOAD to Pokemon DB Successfull');
  })
  .catch((err) => {
    if(err.code === 11000) {
      // duplicate key error can be ignored
      console.log('Server restarts will not overwrite the existing Pokemon Collection');
    } else {
      throw err;
    }      
  });

};

module.exports = exports;
