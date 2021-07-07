const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');

router.get('/', async (req, res) => {
  try {
    let queryResp;

    console.log(`Listing all Pokemon Types existing in DB`);    
    await PokemonModel.distinct('types')
    .then((resp) => {
      queryResp = resp;      
    })
    .catch((err) => {
      throw err;
    });
    
    if(!queryResp) {
      res.status(500);
      res.json({message: 'finding pokemon types failed'});
    } else {
      if(queryResp.length === 0) {
        res.status(404);
        res.json({message: `Pokemon types do not exist in DB`});
      } else {
        res.json({
          pokemonTypes: queryResp,
          totalNumber: queryResp.length
        });
      }      
    }
  } catch(err) {
    res.json({message: err});
  }  
});

module.exports = router;