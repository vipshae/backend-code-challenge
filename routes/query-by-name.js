const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');

router.get('/:name', async (req, res) => {
  try {
    console.log(`Getting Pokemon Data for pokemon name: ${req.params.name}`);
    const queryResp = await PokemonModel.findOne({name: req.params.name});
    if(!queryResp) {
      res.status(404);
      res.json({message: `Pokemon with requested name ${req.params.name} not found in DB`});
    } else {
      res.json(queryResp);
    }
    
  } catch(err) {
    res.status(500);
    res.json({message: err});
  }  
});

module.exports = router;