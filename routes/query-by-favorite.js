const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');

router.get('/', async (req, res) => {
  try {
    if(!req.query.isfavorite) {
      res.status(500);
      throw (`Option to query favorite unfavorite pokemons is missing from request`);
    }

    console.log(`Querying all Pokemons with favorite status ${req.query.isfavorite}`);
    const queryResp = await PokemonModel.find({favorite: req.query.isfavorite});
    
    if(!queryResp) {
      res.status(500);
      res.json({message: 'Finding pokemon by favorite failed'});
    } else {
      if(queryResp.length === 0) {
        res.status(404);
        res.json({message: `Pokemon with favorite set to ${req.query.isfavorite} does not exist in DB`});
      } else {
        res.json(queryResp);
      }      
    }

  } catch(err) {
    res.json({message: err});
  }  
});

module.exports = router;