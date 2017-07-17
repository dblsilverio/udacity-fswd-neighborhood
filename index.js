/**
 * Backend providing Weather and Place Photos services.
 *@namespace NeighborhoodBackend
 */

const express = require('express');
const app = express();

const http = require('http');

const requests = require('./promises');

const config = require('./config.json');
const places = require('./places.json');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    next();
});

app.use('/', express.static('static/', {etag: true}));
app.use('/docs', express.static('out/', {etag: true}));

/**
 * GET /api/places<br>
 * Endpoint for Places listing.<br>
 *
 * @memberOf NeighborhoodBackend
 * @method getApiPlaces
 */
app.route('/api/places').get((req, res) => {
    res.status(200).json(places);
});

/**
 * GET /api/weather/:lat;long<br>
 * Endpoint for weather information queries.<br>
 *
 * Data provided by OpenWeatherMap.
 * @see {@link https://openweathermap.org/api|OpenWeatherMap}
 *
 * @memberOf NeighborhoodBackend
 * @method getApiWeather
 */
app.route('/api/weather/:lat;:lon').get((req, res) => {
    const key = config.api.openweather.key;
    const lat = req.params.lat;
    const lon = req.params.lon;

    http.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`, (rez) => {
        const { statusCode } = rez;

        if (statusCode !== 200) {
            console.error(`Error querying OpenWeather API: ${rez.statusMessage}`);
            rez.resume();
            res.status(500);
            return;
        }

        let jsonResponse = '';
        rez.setEncoding('utf-8');

        rez.on('data', (chunk) => { jsonResponse += chunk; });
        rez.on('end', () => { res.status(200).json(JSON.parse(jsonResponse)) }).on('error', (error) => { console.error(`Error parsing JSON: ${e.message}`); res.status(500); });

    });

});

/**
 * GET /api/place/:lat;long<br>
 * Endpoint for place photos.<br>
 *
 * Data provided by Foursquare.<br>
 * @see {@link https://developer.foursquare.com/|Foursquare Developer Site}
 *
 * @memberOf NeighborhoodBackend
 * @method getApiPlaces
 */
app.route('/api/place/:lat;:lon').get((req, res) => {
    const lat = req.params.lat;
    const lon = req.params.lon;

    let place = {};

    requests.venueRequest(lat, lon).then((placeJson) => {
        const venue = placeJson.response.venues[1];

        place = {
            id: venue.id,
            categories: venue.categories.map((c) => c.name).reduce((i, j) => `${i}, ${j}`)
        };
        return requests.photoRequest(venue.id);
    }).then((photosJson) => {
        place.photos = photosJson.response.photos.items.map((p) => `${p.prefix}${p.width}x${p.height}${p.suffix}`);
        res.status(200).json(place);
    })
        .catch((e) => res.status(500));

});

app.listen(3000, () => {
    console.log('Online');
});