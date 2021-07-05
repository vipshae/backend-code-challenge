const mongoose = require('mongoose');
const expect = require("chai").expect;
const assert = require("chai").assert;
const request = require("supertest");
const DbManager = require('../helpers/db-manager');
const PokemonModel = require('../models/Pokemon');
const PokemonTypeModel = require('../models/PokemonType');
const PokemonTestFilePath = `${__dirname}/pokemons-test.json`;