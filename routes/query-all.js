const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');
const PokemonTypeModel = require('../models/PokemonType');

router.get('/', async (req, res) => {
  const {page, size, name, type, isfavorite} = req.query;

  const limit = size ? size : 10;
  const offset = page ? (page - 1) * limit : 0;
  const queryNameCondition = name ? {name: {$regex: new RegExp('^' + name + '$', "i")}} : {};
  const queryFavoriteCondition = typeof isfavorite !== 'undefined'? {favorite: isfavorite}: {}

  let typeList = [], queryTypeCondition;
  
  try {

    if(type && type !== '') {
      const queryTypeResp = await PokemonTypeModel.find({pokemontype: type})
      .select('pokemonnames -_id');
      typeList = queryTypeResp[0]['pokemonnames'];
    }
    
    queryTypeCondition = typeList.length !== 0 ? {name: {"$in": typeList}}: {};
    
    console.log(`Getting Pokemon Data from DB`);
    const queryResp = await PokemonModel.find()
    .limit(limit * 1)
    .skip(offset)
    .where(queryNameCondition)
    .where(queryTypeCondition)
    .where(queryFavoriteCondition);

    
    if(!queryResp) {
      res.status(404);
      res.json({message: `Pokemon data does not exist in DB`});
    } else {
      res.json(queryResp);
    }

  } catch(err) {
    res.json({message: err});
  }  
});

module.exports = router;