const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log('This is Index page');
  res.status(200);
  res.json({message: 'This is Index page'})

});

module.exports = router;