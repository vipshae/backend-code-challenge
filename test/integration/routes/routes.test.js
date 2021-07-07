const mongoose = require('mongoose');
const fs = require('fs');
const expect = require("chai").expect;
const assert = require("chai").assert;
const request = require("supertest");
const DbManager = require('../../../helpers/db-manager');
const PokemonModel = require('../../../models/Pokemon');
const PokemonTypeModel = require('../../../models/PokemonType');
const PokemonTestFilePath = `${__dirname}/../../unit/helpers/good-pokemon.json`;

const pokemonTestFileToLoad = fs.readFileSync(PokemonTestFilePath, 'utf8');
const pokemonTestFileData = JSON.parse(pokemonTestFileToLoad);

const app = require('../../../app');

const testDb = 'test';
const testmongoDbUrl = `mongodb://127.0.0.1:27017/${testDb}`;


describe('Test app routes', () => {
  
  before(async () => {
    if(mongoose.connection.readyState === 0) {
      await DbManager.connectDb(testmongoDbUrl);
    }        
  });

  after(async () => {
    if(mongoose.connection.readyState === 1) {
      await DbManager.closeDb();
    }
  });
  
  beforeEach(async () => {
    await PokemonModel.deleteMany({});
    await PokemonTypeModel.deleteMany({});
    await DbManager.loadPokemonCollectionWithData(PokemonModel, testDb, pokemonTestFileData);
    await DbManager.loadPokemonTypeCollectionWithData(PokemonTypeModel, testDb, pokemonTestFileData);
  });

  afterEach(async () => {
    await PokemonModel.deleteMany({});
    await PokemonTypeModel.deleteMany({});
  });

  describe('GET: /', () => {
    it('Help page Good response', (done) => {
      request(app).get('/')
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        expect(resp.body.message).to.include('This is Index page');
        done();
      })
      .catch((err) => {done(err);});
    });
  });

  describe('GET /pokemon/name', () => {
    it('Pokemon found by name Good response', (done) => {
      request(app).get('/pokemon/name/Bulbasaur')
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        expect(resp.body.name).to.equal('Bulbasaur');
        expect(resp.body.id).to.equal('001');
        done();
      })
      .catch((err) => {done(err);});
    });
  
    it('Pokemon not found 404 response', (done) => {
      request(app).get('/pokemon/name/Pulbasaur')
      .then((resp) => {
        expect(resp.statusCode).to.equal(404);
        expect(resp.body.message).to.include('Pokemon with requested name Pulbasaur not found in DB');
        done();
      })
      .catch((err) => {done(err);});
    });
  });

  describe('GET /pokemon/id', () => {
    it('Pokemon found by id Good response', (done) => {
      request(app).get('/pokemon/id/001')
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        expect(resp.body.name).to.equal('Bulbasaur');
        expect(resp.body.id).to.equal('001');
        done();
      })
      .catch((err) => {done(err);});
    });
  
    it('Pokemon not found Bad response', (done) => {
      request(app).get('/pokemon/id/002')
      .then((resp) => {
        expect(resp.statusCode).to.equal(404);
        expect(resp.body.message).to.include('Pokemon with requested id 002 does not exist in DB');
        done();
      })
      .catch((err) => {done(err);});
    });
  });

  describe('GET /pokemon/types', () => {    
    it('Pokemon types found Good response', (done) => {
      request(app).get('/pokemon/types')
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        assert.isArray(resp.body);
        assert.lengthOf(resp.body, 2);
        expect(resp.body[0].pokemontype).to.equal('Grass');
        expect(resp.body[1].pokemontype).to.equal('Poison');
        done();
      })
      .catch((err) => {done(err);});
    });
  
    it('Pokemon types not found response', async () => {
      await PokemonTypeModel.deleteMany({});
      request(app).get('/pokemon/types')
      .then((resp) => {
        expect(resp.statusCode).to.equal(404);
        expect(resp.body.message).to.include('Pokemon types do not exist in DB');
      })
    });
  });

  describe('GET /pokemon/type', () => {    
    it('Pokemon by type Good response', (done) => {
      request(app).get('/pokemon/type/Grass')
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);        
        assert.isArray(resp.body[0].pokemonnames);
        assert.lengthOf(resp.body[0].pokemonnames, 1);
        expect(resp.body[0].pokemonnames[0]).to.equal('Bulbasaur');        
        done();
      })
      .catch((err) => {done(err);});
    });
  
    it('Pokemon type not found Bad response', (done) => {
      request(app).get('/pokemon/type/Rock')
      .then((resp) => {
        expect(resp.statusCode).to.equal(404);
        expect(resp.body.message).to.include('Pokemon with requested type Rock does not exist in DB');
        done();
      })
      .catch((err) => {done(err);});
    });  
  });

  describe('GET /pokemon/favorites', () => {
    let testPokeId;    
    
    it('get favorite pokemons, Good response', async () => {
      const notFavoritePokemon = await PokemonModel.find({favorite: false});
      testPokeId = notFavoritePokemon[0].id;
      // set it as favorite
      await PokemonModel.findOneAndUpdate(
        {id: testPokeId}, 
        {$set: {favorite: true}},
        {new: true}
      );
      
      await request(app).get(`/pokemon/favorites`)
      .query({isfavorite: true})
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        assert.isBoolean(resp.body[0].favorite);
        expect(resp.body[0].favorite).to.equal(true);
        assert.equal(testPokeId, resp.body[0].id);
      })
      .catch((err) => {console.log(err);});
    });

    it('get unfavorite pokemons, Good response', async () => {
      await request(app).get(`/pokemon/favorites`)
      .query({isfavorite: false})
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        assert.isBoolean(resp.body[0].favorite);
        expect(resp.body[0].favorite).to.equal(false);
        assert.equal(testPokeId, resp.body[0].id);
      })
      .catch((err) => {console.log(err);});
    });

    it('get favorite pokemons, when no favorite pokemon response', async () => {
      await request(app).get(`/pokemon/favorites`)
      .query({isfavorite: true})
      .then((resp) => {
        expect(resp.statusCode).to.equal(404);
        expect(resp.body.message).to.include('Pokemon with favorite set to true does not exist in DB');
      })
      .catch((err) => {console.log(err);});
    });

    it('get favorite pokemons, missing isfavorite request param', async () => {
      await request(app).get(`/pokemon/favorites`)
      .then((resp) => {
        expect(resp.statusCode).to.equal(500);
        expect(resp.body.message).to.include('Option to query favorite unfavorite pokemons is missing from request');
      })
      .catch((err) => {console.log(err);});
    });
  });


  describe('PUT /pokemon/favorite/id', () => {    
    it('Mark pokemon favorite, Good response', async () => {
      const notFavoritePokemon = await PokemonModel.find({favorite: false});
      const nonfavPokeid = notFavoritePokemon[0].id;
      
      await request(app).put(`/pokemon/favorite/id/${nonfavPokeid}`)
      .query({isfavorite: true})
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        assert.isBoolean(resp.body.favorite);
        expect(resp.body.favorite).to.equal(true);
      })
      .catch((err) => {console.log(err);});

      // check what was marked favorite
      const favoritePokemon = await PokemonModel.find({favorite: true});
      const favPokeid = favoritePokemon[0].id;      
      assert.equal(nonfavPokeid, favPokeid)
    });

    it('Mark favorite pokemons, missing isfavorite request param', async () => {
      await request(app).put(`/pokemon/favorite/id/001`)
      .then((resp) => {
        expect(resp.statusCode).to.equal(500);
        expect(resp.body.message).to.include('Option to mark unmark pokemon with requested id 001 as favorite missing from request');
      })
      .catch((err) => {console.log(err);});
    });
  });

  describe('GET /pokemons', () => {
    
    it('GET pokemons with query params name', async () => {
      await request(app).get(`/pokemons`)
      .query({name: 'Bulbasaur'})
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        assert.equal(resp.body.data.length, 1);
        assert.equal(resp.body.totalPages, 1);
        assert.equal(resp.body.currentPage, '1');
      })
      .catch((err) => {console.log(err);});
    });

    it('GET pokemons with query param name does not exist', async () => {
      await request(app).get(`/pokemons`)
      .query({name: 'Pulbasaur'})
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        assert.equal(resp.body.data.length, 0);
        assert.equal(resp.body.totalPages, 1);
        assert.equal(resp.body.currentPage, '1');
      })
      .catch((err) => {console.log(err);});
    });

    it('GET pokemons with pagination', async () => {
      await request(app).get(`/pokemons`)
      .query({size: 1})
      .query({page: 1})
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        assert.equal(resp.body.data.length, 1);
        assert.equal(resp.body.totalPages, 1);
        assert.equal(resp.body.currentPage, '1');
      })
      .catch((err) => {console.log(err);});
    });
  
    it('GET  pokemons with query type', async () => {
      await request(app).get(`/pokemons`)
      .query({type: 'Poison'})
      .then((resp) => {
        expect(resp.statusCode).to.equal(200);
        assert.equal(resp.body.data.length, 1);
      })
      .catch((err) => {console.log(err);});
    });

    it('GET pokemons with query type does not exist', async () => {
      await request(app).get(`/pokemons`)
      .query({type: 'Fire'})
      .then((resp) => {
        console.log(resp.body)
        expect(resp.statusCode).to.equal(404);
        expect(resp.body.message).to.include('Pokemon with requested query parameters does not exist in DB');
      })
      .catch((err) => {console.log(err);});
    });

  });

});