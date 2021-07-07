const mongoose = require('mongoose');
const expect = require("chai").expect;
const assert = require("chai").assert;
const request = require("supertest");
const DbManager = require('../../helpers/db-manager');
const PokemonModel = require('../../models/Pokemon');

const server = require('../../server');

describe('End to End Server Tests', () => {
  
  before((done) => {    
    server.on("serverStarted", function(){
      done();
    });
  });

  after(async () => {
    await PokemonModel.deleteMany({});
    await DbManager.closeDb()
  });
  
  it('GET index help page', (done) => {
    request(server).get('/')
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      expect(resp.body.message.title).to.include('This is Index page');
      done();
    })
    .catch((err) => {done(err);});
  });

  it('GET pokemon by name', async() => {
    await request(server).get('/pokemon/name/Bulbasaur')
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      expect(resp.body.name).to.equal('Bulbasaur');
      expect(resp.body.id).to.equal('001');
    });
  });

  it('GET pokemon by id', async () => {
    await request(server).get('/pokemon/id/001')
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      expect(resp.body.name).to.equal('Bulbasaur');
      expect(resp.body.id).to.equal('001');
    });
  });

  it('GET pokemon by type', async () => {
    await request(server).get('/pokemon/type/Grass')
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);        
      assert.isArray(resp.body.pokemons);
      assert.lengthOf(resp.body.pokemons, 14);
      expect(resp.body.pokemons[0]).to.equal('Bulbasaur');
      expect(resp.body.totalNumber).to.deep.equal(14);
    });
  });

  it('GET all pokemon types', async () => {
    await request(server).get('/pokemon/types')
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      assert.isArray(resp.body.pokemonTypes);
      assert.lengthOf(resp.body.pokemonTypes, 17);
      expect(resp.body.totalNumber).to.deep.equal(17);
    });
  });

  it('PUT mark a pokemon favorite', async () => {
    const nonfavPokeid = "001";
    
    await request(server).put(`/pokemon/favorite/id/${nonfavPokeid}`)
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
  })
  
  it('GET favorite pokemons', async () => {
    await request(server).get(`/pokemon/favorites`)
    .query({isfavorite: true})
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      assert.equal(resp.body.length, 1);
      assert.isBoolean(resp.body[0].favorite);
      expect(resp.body[0].favorite).to.equal(true);
      assert.equal(resp.body[0].id, '001');
      assert.equal(resp.body[0].name, 'Bulbasaur');
    })
    .catch((err) => {console.log(err);});
  });

  it('GET unfavorite pokemons', async () => {
    await request(server).get(`/pokemon/favorites`)
    .query({isfavorite: false})
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      assert.equal(resp.body.length, 150);
    })
    .catch((err) => {console.log(err);});
  });

  it('GET all pokemons with query params name, favorite', async () => {
    await request(server).get(`/pokemons`)
    .query({isfavorite: true})
    .query({name: 'Bulbasaur'})
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      assert.equal(resp.body.data.length, 1);
      assert.equal(resp.body.totalPages, 1);
      assert.equal(resp.body.currentPage, 1);
      assert.equal(resp.body.totalCount, 1);
    })
    .catch((err) => {console.log(err);});
  });

  it('GET all pokemons with pagination', async () => {
    await request(server).get(`/pokemons`)
    .query({size: 20})
    .query({page: 2})
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      assert.equal(resp.body.data.length, 20);
      assert.equal(resp.body.totalPages, 8);
      assert.equal(resp.body.currentPage, "2");
      assert.equal(resp.body.totalCount, 151);
    })
    .catch((err) => {console.log(err);});
  });

  it('GET all pokemons with query type', async () => {
    await request(server).get(`/pokemons`)
    .query({type: 'Fire'})
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      assert.equal(resp.body.data.length, 10);
      assert.equal(resp.body.totalCount, 12);
      assert.equal(resp.body.totalPages, 2);
    })
    .catch((err) => {console.log(err);});
  });

  it('PUT mark a pokemon unfavorite', async () => {
    const favPokeid = "001";
    
    await request(server).put(`/pokemon/favorite/id/${favPokeid}`)
    .query({isfavorite: false})
    .then((resp) => {
      expect(resp.statusCode).to.equal(200);
      assert.isBoolean(resp.body.favorite);
      expect(resp.body.favorite).to.equal(false);
    })
    .catch((err) => {console.log(err);});

    // check what was marked unfavorite
    const unfavoritePokemon = await PokemonModel.find({id: favPokeid});
    const unfavPokeid = unfavoritePokemon[0].id;      
    assert.equal(unfavPokeid, favPokeid);
  })

});