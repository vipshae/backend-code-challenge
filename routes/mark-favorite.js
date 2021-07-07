const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');

router.put('/:id', async (req, res) => {
  try {
    if(!req.query.isfavorite) {
      res.status(500);
      throw (`Option to mark unmark pokemon with requested id ${req.params.id} as favorite missing from request`);
    }
    
/*     if(typeof req.query.isfavorite != 'boolean') {
      res.status(503);
      throw (`Option to mark unmark pokemon as favorite should be of type Boolean (true, false)`);
    } */
    
    console.log(`Marking Pokemon with id: ${req.params.id} favorite status to ${req.query.isfavorite}`);
    const queryResp = await PokemonModel.findOneAndUpdate(
      {id: req.params.id}, 
      {$set: {favorite: req.query.isfavorite}},
      {new: true}
    );
    if(!queryResp) {
      res.status(404);
      res.json({message: `Pokemon with requested id ${req.params.id} does not exist in DB`});
    } else {
      console.log(`Favorite status for Pokemon with id: ${req.params.id} is marked ${req.query.isfavorite}`);
      res.json(queryResp);
    }

  } catch(err) {
    res.json({message: err});
  }  
});

module.exports = router;