const weather = require('./backend/weather');
const favorites = require('./backend/favorites');
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
    favorites.getAll().then(result => { res.json(result); console.log(result); }).catch(reject => res.sendStatus(404));
})
    .post('', function (req, res) {
        const city = req.query.city;
        weather.load(city).then(async result => {
            resultJson = await result.json()
            cityName = resultJson.location.name
            if (cityName) {
                favorites.add(cityName).then(result => res.json({name: result})).catch(reject => {
                    console.log("Status " + reject.status);
                    res.sendStatus(reject.status)
                });
            }
        }).catch(err => {console.log(err); res.sendStatus(500)})

    }).delete('', function (req, res) {
        const city = req.query.city;
        favorites.deleteCity(city).then(result => res.sendStatus(200)).catch(reject => res.sendStatus(404));
    });

app.use('/weather', weatherRouter);
app.use('/favorites', favoritesRouter);
app.use(express.static(path.join(__dirname + '/frontend')));
app.listen(80);