const weather = require('./weather');
const favorites = require('./favorites');
const express = require('express');
const app = express();
const path = require('path');

const weatherRouter = express.Router();

weatherRouter.get('/city', function (req, res) {
    const q = req.query.q;
    console.log(q);
    weather.load(q).then(result => {
        result.json().then(json => res.send(json));
    }).catch(err => res.sendStatus(404))
});

const favoritesRouter = express.Router();

favoritesRouter.get('', function (req, res) {
    favorites.getAll().then(result => { res.json(result); console.log(result); }).catch(reject => res.sendStatus(500));
})
    .post('', function (req, res) {
        const city = req.query.city;
        weather.load(city).then(async result => {
            resultJson = await result.json()
            if (result.ok && resultJson.location.name) {
                cityName = resultJson.location.name
                favorites.add(cityName).then(result => res.json({name: result})).catch(reject => {
                    console.log("Status " + reject.status);
                    res.sendStatus(reject.status)
                });
            } else {
                console.log("Not found " + city)
                res.sendStatus(404);
            }
        }).catch(err => {console.log(err); res.sendStatus(500)})

    }).delete('', function (req, res) {
        const city = req.query.city;
        favorites.deleteCity(city).then(result => res.sendStatus(200)).catch(reject => res.sendStatus(500));
    });

app.use('/weather', weatherRouter);
app.use('/favorites', favoritesRouter);
app.use(express.static(path.join(__dirname + '/../frontend')));
module.exports = app