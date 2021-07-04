const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');

router.get('/', async (req, res) => {
  try {
    if(!req.query.isfavorite) {
      res.status(503);
      throw (`Option to query favorite unfavorite pokemons is missing from request`);
    }
/*     if(typeof req.query.isfavorite !==  "boolean") {
      res.status(503);
      throw (`Option to query favorite status of a pokemon should be of type Boolean (true, false)`);
    } */
    console.log(`Querying all Pokemons with favorite status ${req.query.isfavorite}`);
    const queryResp = await PokemonModel.find({favorite: req.query.isfavorite});
    
    if(!queryResp) {
      res.status(404);
      res.json({message: `Pokemons do not exist in DB`});
    } else {
      res.json(queryResp);
    }

  } catch(err) {
    res.json({message: err});
  }  
});

module.exports = router;