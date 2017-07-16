/**
 * Created by diogo on 09/07/17.
 */

/**
 * Modal message used to warn users about errors.
 * @type {MyMessage}
 * @static
 */
const MESSAGE = new MyMessage.message({
    showTime: 3000,
    align: "right"
});

/**
 * Represents current weather temperatures in Celsius.
 *
 * @param {number} temp - Current temperature.
 * @param {number} temp_min - The minimum temperature currently expected.
 * @param {number} temp_max - The maximum temperature currently expected.
 * @param {string} description - Description of current weather conditions.
 * @param {string} icon - Icon providing visual status according to current weather conditions.
 *
 * @namespace Weather
 * @constructor
 */
function Weather(temp, temp_min, temp_max, description, icon) {
    let self = this;

    /**
     * Number observable representing current temperature.
     * @type {number}
     * @memberOf Weather
     */
    self.temp = ko.observable(temp);

    /**
     * Number observable representing current minimum temperature.
     * @type {number}
     * @memberOf Weather
     */
    self.temp_min = ko.observable(temp_min);

    /**
     * Number observable representing current maximum temperature.
     * @type {number}
     * @memberOf Weather
     */
    self.temp_max = ko.observable(temp_max);

    /**
     * String observable representing current weather description.
     * @type {string}
     * @memberOf Weather
     */
    self.description = ko.observable(description);

    /**
     * Facility property for displaying current weather icon.
     * @type {string}
     * @memberOf Weather
     */
    self.icon = `http://openweathermap.org/img/w/${icon}.png`;
}

/**
 * Represents a physical location.
 *
 * @param {string} place - Actual name of a place.
 * @param {string} description - Description about the place.
 * @param {Object} location - Represents the latitude and longitude of the place.
 *
 * @namespace Marker
 * @constructor
 */
function Marker(place, description, location) {
    let self = this;

    /**
     * Place's name.
     * @type {string}
     * @memberOf Marker
     */
    self.place = place;

    /**
     * Place's description.
     * @type {string}
     * @memberOf Marker
     */
    self.description = description;

    /**
     * Place's location including longitude and latitude.
     * @type {Object}
     * @memberOf Marker
     */
    self.location = location;

    /**
     * Facility for place displaying.
     * @type {boolean}
     * @memberOf Marker
     */
    self.isVisible = ko.observable(true);

    /**
     * Id to help identifying a place.
     * @type {number}
     * @memberOf Marker
     */
    self.placeId = () => {
        return self.place.split("").reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    };

    /**
     * Weather information about a place.
     * @type {Weather}
     * @memberOf Marker
     */
    self.weather = ko.observable();

    /**
     * An array including photos for the place.
     * @type {Array}
     * @memberOf Marker
     */
    self.photos = ko.observableArray();
}

/**
 * Represents VM component.
 *
 * @namespace MapViewModel
 * @constructor
 */
function MapViewModel() {
    let self = this;

    /**
     * A Google Maps instance.
     * @type {google.maps.Map}
     * @memberOf MapViewModel
     */
    self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: {lat: -29.363, lng: -50.808}
    });

    /**
     * An array of google.maps.Marker.
     * @type {Array}
     * @memberOf MapViewModel
     */
    self.mapMarkers = [];

    /**
     * An observable string containing current text search for places.
     * @type {string}
     * @memberOf MapViewModel
     */
    self.searchText = ko.observable("");

    /**
     * An observable array containing {Marker} instances.
     * @type {Array}
     * @memberOf MapViewModel
     */
    self.listMarkers = ko.observableArray([]);

    /**
     * An observable holding current selected place.
     * @type {Marker}
     * @memberOf MapViewModel
     */
    self.currentPlace = ko.observable();

    /**
     * Fetches places from backend and fill and array of markers, plotting then.
     * @see {@link plotMapMarkers} and {@link fetchPlaces} for more information.
     * @memberOf MapViewModel
     * @method fetchMarkerList
     */
    self.fetchMarkerList = () => {

        const placesPromise = self.fetchPlaces();

        placesPromise.then((places) => {

            let markers = places.map(p => {
                return new Marker(p.place, p.description, p.location);
            });

            if (self.listMarkers().length === 0) {
                markers.forEach(m => self.listMarkers.push(m));
            }
            
            self.plotMapMarkers();

        }).catch((error) => {
            MESSAGE.add("Error retrieving places data.", "error");
        });
    };

    /**
     * Provides animation and behaviour for marker clicked.
     *
     * @param {google.maps.Marker} marker - A Maps Marker.
     * @param {Marker} listMarker - A Place Marker.
     * @memberOf MapViewModel
     * @method animateMarker
     */
    self.animateMarker = (marker, listMarker) => {
        marker.setAnimation(google.maps.Animation.BOUNCE);

        setTimeout(() => {
            marker.setAnimation(null);
            $("#modal").modal("show");

            const lat = listMarker.location.lat;
            const lng = listMarker.location.lng;

            const weatherPromise = self.checkWeather(lat, lng);
            const photosPromise = self.fetchPhotos(lat, lng);

            weatherPromise.then((weatherData) => {
                listMarker.weather(weatherData);
            }).catch((error) => {
                MESSAGE.add("Error retrieving weather data.", "error");
            });

            photosPromise.then((photosArray) => {
                listMarker.photos(photosArray);
            }).catch((error) => {
                MESSAGE.add("Error retrieving photo data.", "error");
            });

        }, 1300);
    };

    /**
     * Creates and plots visible Maps Markers when none exists yet. Otherwise, markers are plotted
     * according to its visible property.
     * @memberOf MapViewModel
     * @method plotMapMarkers
     */
    self.plotMapMarkers = () => {

        if (self.mapMarkers.length === 0) {
            self.listMarkers().forEach((m) => {

                let marker = new google.maps.Marker({
                    position: m.location,
                    map: self.map
                });

                marker.addListener("click", () => {
                    self.currentPlace(m);
                    self.animateMarker(marker, m);
                });

                self.mapMarkers.push({
                    place: m.place,
                    marker: marker
                });
            });
        } else {
            self.mapMarkers.forEach((m) => {
                let visible = false;

                self.listMarkers().forEach((l) => {
                    if (l.place === m.place) {
                        visible = l.isVisible();
                        return;
                    }
                });

                m.marker.setMap(visible ? self.map : null);
            });
        }

    };

    /**
     * Turns all Maps Markers visible.
     *
     * @memberOf MapViewModel
     * @method resetMarkers
     */
    self.resetMarkers = () => {
        self.listMarkers.forEach((m) => {
            m.isVisible(true);
        });
    };

    /**
     * Filters and plots {Marker} instances according to text typed by user.
     *
     * @memberOf MapViewModel
     * @method filterMarkers
     */
    self.filterMarkers = () => {

        if (self.searchText().length === 0) {
            self.fetchMarkerList();
        }

        self.listMarkers().forEach((m) => {
            m.isVisible(m.place.match(new RegExp(self.searchText(), "i")) !== null);
        });

        self.plotMapMarkers();
    };

    /**
     * Handles a marker click by filtering and animating the due {Marker}.
     *
     * @param {Marker} marker - A {Marker} instance.
     * @param {Object} event - The event.
     * @memberOf MapViewModel
     */
    self.showMarker = (marker, event) => {
        let markerPlace = self.mapMarkers.filter((m) => marker.place === m.place);

        if (markerPlace.length === 1) {
            self.currentPlace(marker);
            self.map.setCenter(marker.location);
            self.animateMarker(markerPlace[0].marker, marker);
        }
    };

    /**
     * Fetches backend services for a list of known places.
     *
     * @returns {Promise} - An array of places.
     * @memberOf MapViewModel
     */
    self.fetchPlaces = () => {
        return new Promise((resolve, reject) => {
            $.get(`/api/places`)
                .done((places) => {
                    resolve(places);
                })
                .fail((error) => {
                    reject((`Error fetching places: ${error}`));
                });
        });
    };

    /**
     * Fetches backend services for weather information about a given longitude and latitude.
     *
     * @param {number} lat - The latitude.
     * @param {number} lng - The longitude.
     * @returns {Promise} - Information about the weather.
     * @memberOf MapViewModel
     */
    self.checkWeather = (lat, lng) => {

        return new Promise((resolve, reject) => {
            $.get(`/api/weather/${lat};${lng}`)
                .done((data) => {
                    const temp = data.main;
                    const desc = data.weather[0];

                    resolve(new Weather(temp.temp, temp.temp_min, temp.temp_max, desc.description, desc.icon));
                })
                .fail((error) => {
                    reject((`Error while checking weather: ${error}`));
                });
        });
    };

    /**
     * Fetches backend services for photos about a given longitude and latitude.
     *
     * @param {number} lat - The latitude.
     * @param {number} lng - The longitude.
     * @returns {Promise} - An array of photos.
     * @memberOf MapViewModel
     */
    self.fetchPhotos = (lat, lng) => {
        return new Promise((resolve, reject) => {
            $.get(`/api/place/${lat};${lng}`)
                .done((data) => {
                    const {photos} = data;
                    resolve(photos);

                })
                .fail((error) => reject(error));
        });
    };

    self.fetchMarkerList();

}

ko.applyBindings(new MapViewModel());
