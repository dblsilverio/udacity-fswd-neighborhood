$(document).ready(
    function () {
        $('#show-menu').click(() => {
            $('#marker-section').toggle();
        });
    }
);

/**
 * Publisher that warns listeners when a map instance is correctly instantiated.
 */
let maps_ready = ko.observable();

function initMap() {
    let maps_instance = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: { lat: -22.970958, lng: -43.181649 }
    });
    maps_ready.notifySubscribers(maps_instance, "ready");
}

/**
 * Alerts users when an error occurs while loading API scripts.
 */
function handleMapsError() {
    popError("Error loading Google Maps API");
}

/**
 * Alerts users when authentication fails.
 */
function gm_authFailure() {
    popError("<b>Authentication failures at Maps API</b><br>Please, check your API keys and reload this page.");
};

/**
 * Popup helper that displays error messages.
 * @param {string} message 
 */
function popError(message) {
    new MyMessage.message({
        showTime: 3000,
        align: "right"
    }).add(message, "error");
}