const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PokemonTypeSchema = Schema({
  pokemontype: {type: String, unique: true, required: true},
  pokemonids: {type: [String], unique: true},
  pokemonnames: {type: [String], unique: true}
})

module.exports = mongoose.model('PokemonType', PokemonTypeSchema); // collection name is pokemontypes
