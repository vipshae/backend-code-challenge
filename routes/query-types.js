const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');
const PokemonTypeModel = require('../models/PokemonType');

router.get('/', async (req, res) => {
  try {
    
    console.log(`Listing all Pokemon Types existing in DB`);
/*     
      let typeList = [];
      for await(const pokedoc of PokemonModel.find()) {
      for(pokeType of pokedoc.types) {
        if(typeList.indexOf(pokeType) === -1) {
          typeList.push(pokeType);
        }
      }
    } */
    const queryResp = await PokemonTypeModel.find().select('pokemontype -_id');
    if(!queryResp) {
      res.status(404);
      res.json({message: `Pokemon types do not exist in DB`});
    } else {
      res.json(queryResp);
    }

  } catch(err) {
    res.json({message: err});
  }  
});

module.exports = router;