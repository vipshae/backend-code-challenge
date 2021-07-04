const express = require('express');
const router = express.Router();
const PokemonTypeModel = require('../models/PokemonType');

router.get('/:type', async (req, res) => {
  try {
    console.log(`Getting Pokemons for the requested type: ${req.params.type}`);
    const queryResp = await PokemonTypeModel.find({pokemontype: req.params.type })
      .select('pokemonnames -_id');

    for(el of queryResp[0]['pokemonnames']) {
      console.log(el);
    }
    
    if(!queryResp) {
      res.status(404);
      res.json({message: `Pokemon with requested type ${req.params.type} does not exist in DB`});
    } else {
      res.json(queryResp);
    }

  } catch(err) {
    res.json({message: err});
  }  
})

module.exports = router;