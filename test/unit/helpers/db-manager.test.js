const mongoose = require('mongoose');
const fs = require('fs');
const expect = require("chai").expect;
const assert = require("chai").assert;
const DbManager = require('../../../helpers/db-manager');
const PokemonModel = require('../../../models/Pokemon');
const PokemonTypeModel = require('../../../models/PokemonType');
const GoodpokemonTestFilePath = `${__dirname}/good-pokemon.json`;
const BadpokemonTestFilePath = `${__dirname}/bad-pokemon.json`;

const sinon = require('sinon');

const testDb = 'test';
const testmongoDbUrl = `mongodb://127.0.0.1:27017/${testDb}`;


describe("Test Connection to DB", () => {

  before((done) => {
    sinon.stub(console, "log");
    done();
  });
  
  afterEach(async () => {
    if(mongoose.connection.readyState === 1) {
      await DbManager.closeDb();
    }    
  });
  
  it('Good URL Connect to DB', async () => {
    const dbConnObj = await DbManager.connectDb(testmongoDbUrl)     
    dbConnObj.on('connected', () => {
      expect(mongoose.connection.readyState).to.equal(1);
    });
  });

  it('Bad URL Connect to DB', async () => {
    const badUrl = `mongodb://127.0.0.1:27016/${testDb}`;
    await DbManager.connectDb(badUrl)
    .catch((connErr) => {
      assert.instanceOf(connErr, Error, 'Connection Error is instance of Error');
      assert.include(connErr.message, `connect ECONNREFUSED`);
    });
  });
 
});


describe("Test Disconnection from DB", () => { 
  let dbConnObj;
  
  beforeEach(async () => {
    if(mongoose.connection.readyState === 0) {
      dbConnObj = await DbManager.connectDb(testmongoDbUrl);
    } 
  });

  after(async () => {
    if(mongoose.connection.readyState === 1) {
      await DbManager.closeDb();
    }    
  });
  
  it('Good URL Disconnect from DB', async () => {
    await DbManager.closeDb();    
    dbConnObj.on('disconnected', () => {
      expect(mongoose.connection.readyState).to.equal(0);
    });
  });

  it('Bad muliple Disconnect from DB', async () => {
    // close already closed connection
    await DbManager.closeDb();
    await DbManager.closeDb();
    dbConnObj.on('uninitialized', () => {
      expect(mongoose.connection.readyState).to.equal(99);
    });
  });
});

describe("Test load DB with data", () => {
  const pokemonGoodTestFileToLoad = fs.readFileSync(GoodpokemonTestFilePath, 'utf8');
  const pokemonGoodTestFileData = JSON.parse(pokemonGoodTestFileToLoad);

  const pokemonBadTestFileToLoad = fs.readFileSync(BadpokemonTestFilePath, 'utf8');
  const pokemonBadTestFileData = JSON.parse(pokemonBadTestFileToLoad);
  
  before(async () => {
    if(mongoose.connection.readyState === 0) {
      dbConnObj = await DbManager.connectDb(testmongoDbUrl);
    } 
  })

  beforeEach(async () => {
    await PokemonModel.deleteMany({});
    await PokemonTypeModel.deleteMany({});
  })

  after(async () => {
    await PokemonModel.deleteMany({});
    await PokemonTypeModel.deleteMany({});
    if(mongoose.connection.readyState === 1) {
      await DbManager.closeDb();
    }
    console.log.restore();
  });

  it('Test Load Good pokemons Collection', async () => {
    await DbManager.loadPokemonCollectionWithData(PokemonModel, testDb, pokemonGoodTestFileData)
    .then(async () => {
      await PokemonModel.find({})
      .then((pokemonData) => {
        assert.equal(pokemonData.length, 1);
        assert.equal(pokemonData[0].name, 'Bulbasaur');
      });
    });
  });

  it('Test Load Bad pokemons Collection', async () => {
    await DbManager.loadPokemonCollectionWithData(PokemonModel, testDb, pokemonBadTestFileData)
    .catch((err) => {
      assert.instanceOf(err, Error);
    });
  });

  it('Test Good Load to pokemontypes Collection', async () => {
    await DbManager.loadPokemonTypeCollectionWithData(PokemonTypeModel, testDb, pokemonGoodTestFileData)
    .then(async () => {
      await PokemonTypeModel.find({})
      .then((pokemonTypeData) => {
        assert.equal(pokemonTypeData.length, 2);
        assert.isArray(pokemonTypeData[0].pokemonnames);
        assert.equal(pokemonTypeData[0].pokemonids[0], '001');
      });
    });
  });

  it('Test Bad Load to pokemontypes Collection', async () => {
    await DbManager.loadPokemonTypeCollectionWithData(PokemonTypeModel, testDb, pokemonBadTestFileData)
    .catch((err) => {
      assert.instanceOf(err, Error);
    });
  });

});