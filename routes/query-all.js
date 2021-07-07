const express = require('express');
const router = express.Router();
const PokemonModel = require('../models/Pokemon');

router.get('/', async (req, res) => {
  const {page, size, name, type, isfavorite} = req.query;

  const limit = size ? size : 10;
  const offset = page ? (page - 1) * limit : 0;
  const queryNameCondition = name ? {name: {$regex: new RegExp('^' + name + '$', "i")}} : {};
  const queryFavoriteCondition = typeof isfavorite !== 'undefined'? {favorite: isfavorite}: {}
  const queryTypeCondition =  type ? {types: {$eq : type}}: {};

  
  try {    
    console.log(`Getting Pokemon Data from DB`);
    
    const queryResp = await PokemonModel.find()
    .limit(limit * 1)
    .skip(offset)
    .where(queryNameCondition)
    .where(queryTypeCondition)
    .where(queryFavoriteCondition);

    const pokemonDocsCount = await PokemonModel.countDocuments()
    .where(queryNameCondition)
    .where(queryTypeCondition)
    .where(queryFavoriteCondition);

    if(!queryResp) {
      res.status(500);
      res.json({message: 'Pokemon data cannot be queried from DB'});
    } else {      
      if(queryResp.length === 0) {
        res.status(404);
        res.json({
          message: `Pokemon with requested query parameters does not exist in DB`
        });
      } else {
        res.json({
          data: queryResp,
          totalCount: pokemonDocsCount,
          totalPages: Math.ceil(pokemonDocsCount / limit),
          currentPage: page ? page : 1
        });
      }      
    }

  } catch(err) {
    res.json({message: err});
  }  
});

module.exports = router;