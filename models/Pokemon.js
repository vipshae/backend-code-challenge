const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PokemonSchema = Schema({
  id: {type: String, unique: true, required: true},
  name: {type: String, unique: true, required: true},
  classification: String,
  types: [String],
  resistant: [String],
  weaknesses: [String],
  weight: {type: Map, of: String},
  height: {type: Map, of: String},
  fleeRate: Number,
  previousEvolutions: [{id: {type: Number}, name: {type: String}}],
  evolutionRequirements: {amount: {type: Number}, name: {type: String}},
  evolutions: [{id: {type: Number}, name: {type: String}}],
  maxCP: Number,
  maxHP: Number,
  attacks: {fast: [{name: String, type: {type: String}, damage: Number}], special: [{name: String, type: {type: String}, damage: Number}]},
  favorite: Boolean
})

module.exports = mongoose.model('Pokemon', PokemonSchema); // collection name is pokemons