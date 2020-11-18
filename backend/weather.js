const fetch = require('node-fetch');
module.exports = {
    load(query) {
        return load(query);
    }
  };  

function load(query) {
    return fetch("https://api.weatherapi.com/v1/current.json?key=a67d292870584105b00141824200410&q=" + query)
}
