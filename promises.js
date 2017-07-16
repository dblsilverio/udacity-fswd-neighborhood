const https = require('https');
const config = require('./config.json');

module.exports = {
    venueRequest: (lat, lon) => {
        
        return new Promise((resolve, reject) => {
            https.get(`https://api.foursquare.com/v2/venues/search?ll=${lat},${lon}&limit=2&client_id=${config.api.foursquare.id}&client_secret=${config.api.foursquare.key}&v=20170101`, (rez) => {
                const { statusCode } = rez;
                let place = {};

                if (statusCode !== 200) {
                    console.error(`Error querying Foursquare API: ${rez.statusMessage}`);
                    rez.resume();
                    reject(statusCode);
                    return;
                }

                let venueJson = '';
                rez.setEncoding('utf-8');

                rez.on('data', (chunk) => { venueJson += chunk })
                rez.on('end', () => { resolve(JSON.parse(venueJson)) })
                    .on('error', (error) => { console.error(`Error parsing JSON: ${e.message}`); reject(error); });
            });
        });
    },
    photoRequest: (venueId) => {
        return new Promise((resolve, reject) => {
            https.get(`https://api.foursquare.com/v2/venues/${venueId}/photos?limit=5&client_id=${config.api.foursquare.id}&client_secret=${config.api.foursquare.key}&v=20170101`, (rez) => {

                const { statusCode } = rez;
                let place = {};

                if (statusCode !== 200) {
                    console.error(`Error querying Foursquare API: ${rez.statusMessage}`);
                    rez.resume();
                    reject(statusCode);
                    return;
                }

                let photoJson = '';
                rez.setEncoding('utf-8');

                rez.on('data', (chunk) => { photoJson += chunk })
                rez.on('end', () => { resolve(JSON.parse(photoJson)) })
                    .on('error', (error) => { console.error(`Error parsing JSON: ${e.message}`); reject(error); });
            });
        });
    }
}