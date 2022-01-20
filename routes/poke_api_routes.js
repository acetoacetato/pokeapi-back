const { Router } = require('express');

const { getPokemon, listAllPokemon, listPagePokemon } = require('../controllers/pokeapi_controller');
const router = Router();



router.get('/pokeapi/', listPagePokemon);
router.get('/pokeapi/:search', getPokemon);
router.get('/pokeapi/page/:page', listPagePokemon);
router.get('/pokeapi/name/:search', getPokemon);

module.exports = router;