const express = require('express');
const PokemonModel = require('../models/Pokemon');
const router = express.Router();

router.get('/:type', async (req, res) => {
  try {
    console.log(`Getting Pokemons for the requested type: ${req.params.type}`);
    
    const queryResp = await PokemonModel.find({types: {$eq : req.params.type}}, {name: 1, _id: 0});
    const finalOutArr = [];
    
    if(!queryResp) {
      res.status(500);
      res.json({message: 'Finding pokemon by type failed'});
    } else {
      if(queryResp.length === 0) {
        res.status(404);
        res.json({message: `Pokemon with requested type ${req.params.type} does not exist in DB`});
      } else {
        for(let obj of queryResp) {
          finalOutArr.push(obj.name);
        }
        res.json({
          pokemons: finalOutArr,
          totalNumber: finalOutArr.length
        });
      }      
    }

  } catch(err) {
    res.json({message: err});
  }  
})

module.exports = router;