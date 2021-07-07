const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {

  res.status(200);
  res.json({
    message: {
      title: "This is Index page",
      body: "Following are supported routes\n 1. GET '/pokemons?name=(name)&type=(type)&isfavorite=(true/false)&size=(size)&page=(page)', to query pokemons filter by name, type, isfavorite, size and page values\n 2. GET '/pokemon/name/:name', to query pokemon by pokemon name\n 3. GET '/pokemon/id/:id', to query pokemon by pokemon id\n 4. GET '/pokemon/types', to query all pokemon types\n 5. GET '/pokemon/type/:type', to query pokemons by pokemon type\n 6. PUT '/pokemon/favorite/id/:id?isfavorite=(true/false)', to mark and unmark pokemon as favorite by id\n 7. GET '/pokemon/favorites?isfavorite=(true/false)', to query favorite and unfavorite pokemons"
    }
  });

});

module.exports = router;