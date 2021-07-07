const express = require('express');

// import controllers
const indexRoute = require('./routes/index');
const queryAllPokemons= require('./routes/query-all');
const queryPokemonByName = require('./routes/query-by-name');
const queryPokemonById = require('./routes/query-by-id');
const queryPokemonTypes = require('./routes/query-types');
const queryPokemonByType = require('./routes/query-by-type');
const markUnmarkPokemonFavoriteById = require('./routes/mark-favorite');
const queryPokemonByFavorite = require('./routes/query-by-favorite');

// Express app
const app = express();

// app routes with controllers
app.use('/', indexRoute);
app.use('/pokemons', queryAllPokemons);
app.use('/pokemon/name', queryPokemonByName);
app.use('/pokemon/id', queryPokemonById);
app.use('/pokemon/types', queryPokemonTypes);
app.use('/pokemon/type', queryPokemonByType);
app.use('/pokemon/favorite/id', markUnmarkPokemonFavoriteById);
app.use('/pokemon/favorites', queryPokemonByFavorite);

module.exports = app;

