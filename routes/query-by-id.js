const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');

router.get('/:id', async (req, res) => {
  try {
    console.log(`Getting Pokemon Data for pokemon with id: ${req.params.id}`);
    const queryResp = await PokemonModel.findOne({id: req.params.id});
    if(!queryResp) {
      res.status(404);
      res.json({message: `Pokemon with requested id ${req.params.id} does not exist in DB`});
    } else {
      res.json(queryResp);
    }

  } catch(err) {
    res.json({message: err});
  }  
});

module.exports = router;