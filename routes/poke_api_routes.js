const { Router } = require('express');

const { getPokemon, listPagePokemon } = require('../controllers/pokeapi_controller');
const router = Router();


// Routes for the API
router.get('/pokeapi/', listPagePokemon);
router.get('/pokeapi/:search', getPokemon);

module.exports = router;