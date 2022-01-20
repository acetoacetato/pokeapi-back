const axios = require('axios');
const { response } = require('express');


// Returns a object made by the heigth, weight, name and abilities of the pokemon
const formatPokemon = (pokemon, detailed) => {

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

    return detailedData(pokemon.species.url).then(details => {
        resp.evolutions = details.evolutions;
        resp.description = details.description;

        return resp;
    });

}

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

const detail = (obj) => ({
    name: obj.species.name,
    url: obj.species.url,
});


const evolutionChain = (object, array = []) => {
    array.push(object.species.name);

    if (object.evolves_to.length === 0) {
        return array;
    } else {
        object.evolves_to.forEach(evolution => {
            evolutionChain(evolution, array);
        });
        return array;
    }
}


// Get evolution chain from pokeapi and returns the evolutions of the pokemon
const detailedData = (url) => {
    return axios.get(url)
        .then(response => {
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
            return res.status(404).send({
                error: "Pokemon not found"
            });
        }
        );

}

const listAllPokemon = async (req, res) => {
    const { page } = req.params;
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${page}&limit=20`;
    axios.get(url)
        .then(response => {
            return res.status(200).send(response.data)
        });
};


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
    listAllPokemon,
    listPagePokemon,
};
