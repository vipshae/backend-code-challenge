const mongoose = require('mongoose');

// DB metadata
const pokemonDbCollectionName = 'pokemons';
const pokemonTypeDbCollectionName = 'pokemontypes';
const dbUserName = 'root';
const dbUserPass = 'passw';
//const mongoDbUrl = `mongodb://${dbUserName}:${dbUserPass}@127.0.0.1:27017/${pokemonDbName}`;


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

exports.loadPokemonTypeCollectionWithData = async function(PokemonTypeModel, pokemonDbName, pokemonFileData) {
  const idMap = {};
  
  for(let i = 0; i < pokemonFileData.length; i+= 1) {
    for(let poketype of pokemonFileData[i].types) {
      if(poketype in idMap) {
        if(idMap[poketype].ids.indexOf(pokemonFileData[i].id) === -1) {
          idMap[poketype].ids.push(pokemonFileData[i].id);
        }
        if(idMap[poketype].names.indexOf(pokemonFileData[i].name) === -1) {
          idMap[poketype].names.push(pokemonFileData[i].name);
        }
      } else {
        idMap[poketype] = { ids: [pokemonFileData[i].id], names: [pokemonFileData[i].name] };
      }
    }
  }
    
  const refinedPokemonTypeObjList = [];
  for(let pType of Object.keys(idMap)) {
    refinedPokemonTypeObjList.push({
      pokemontype: pType, 
      pokemonids: idMap[pType].ids, 
      pokemonnames: idMap[pType].names
    });
  }

  console.log(`Loading pokemon type data to database: ${pokemonDbName} under collection ${pokemonTypeDbCollectionName}`);

  await PokemonTypeModel.insertMany(refinedPokemonTypeObjList)
  .then(() => {
    console.log('LOAD to Pokemon Type DB Successfull');
  })
  .catch((err) => {
    if(err.code === 11000) {
      // duplicate key error can be ignored
      console.log('Server restarts will not overwrite the existing Pokemon Type Collection');
    } else {
      throw err;
    }      
  });
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
