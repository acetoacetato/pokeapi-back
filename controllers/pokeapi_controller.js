const axios = require('axios');
const { response } = require('express');


// Returns a object made by the heigth, weight, name and abilities of the pokemon
//  if detailed is true, it returns the description and the evolutions of the pokemon
const formatPokemon = (pokemon, detailed) => {

    // Initial response with basic stats
    resp = {
        name: pokemon.name,
        id: pokemon.id,
        type: pokemon.types.map(type => type.type.name),
        weight: pokemon.weight,
        sprite: pokemon.sprites.front_default,
        abilities: pokemon.abilities.map(ability => {
            return {
                name: ability.ability.name,
                url: ability.ability.url
            }
        }),
    };

    if (!detailed)
        return resp;

    // If detailed is true, it will return the description and the evolution chain of the pokemon
    return detailedData(pokemon.species.url).then(details => {
        resp.evolutions = details.evolutions;
        resp.description = details.description;

        return resp;
    });

}

// Returns a object with the name and the url of the pokemon species given a pokemon
const pokeList = (pokeData) => {
    id = pokeData.url.split('/')[6];
    return axios.get(pokeData.url)
        .then(resp => {
            return resp.data
        }).then(
            resp => {
                return formatPokemon(resp, false);
            });

}


// Returns an array with the evolution names of the pokemon
const evolutionChain = (object, array = []) => {
    // Adds the name of the pokemon to the array
    array.push(object.species.name);

    // Base case of the recursion
    if (object.evolves_to.length === 0) {
        return array;
    } else {
        // For each evolution, it calls the recursion to get the next evolution to each option
        object.evolves_to.forEach(evolution => {
            evolutionChain(evolution, array);
        });
        return array;
    }
}


// Get evolution chain and description of the pokemon given the species url
const detailedData = (url) => {
    return axios.get(url)
        .then(response => {

            // Gets the description of the pokemon in spanish
            description = response.data.flavor_text_entries.find(entry => entry.language.name === 'es');
            const chain_url = response.data.evolution_chain.url;
            return axios.get(chain_url)
                .then(chainResponse => {
                    arr = evolutionChain(chainResponse.data.chain);
                    return { evolutions: arr, description: description.flavor_text };
                });

        })
        .then(arr => {
            return arr;
        });
}

// Gets a pokemon detailed data given the pokemon name or id
const getPokemon = (req, res) => {
    const { search } = req.params;
    const url = `https://pokeapi.co/api/v2/pokemon/${search}`;
    axios.get(url)
        .then(response => response.data)
        .then(pokemon => {
            formatPokemon(pokemon, true).then(resp => {
                return res.status(200).send(resp);
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(404).send({
                error: "Pokemon not found"
            });
        }
        );

}



// Gets a list of all the pokemon. It returns a url for the next pokemon available
// and the pokemon list with basic data.
const listPagePokemon = (req, res) => {
    const page = req.query.page || 0;
    const url = `https://pokeapi.co/api/v2/pokemon`;
    axios.get(url + `?offset=${page * 20}&limit=20`)
        .then(resp => {
            return {
                nextUrl: ((resp.data.results.length > 0) ? `?page=${parseInt(page) + 1}` : null),
                results: resp.data.results.map(pokeList)
            };

        })
        .then(resp2 => {
            Promise.all(resp2.results).then(pokemon => {
                return res.send({
                    nextUrl: `?page=${parseInt(page) + 1}`,
                    results: pokemon
                });
            }
            );



        });

}

module.exports = {
    getPokemon,
    listPagePokemon,
};
