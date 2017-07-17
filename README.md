# [Neighborhood Project](http://maps.diogosilverio.net/)

This project was developed in fulfillment of Full-Stack Web Developer Nanodegree *Neighborhood module*.

## Requirements

The following technologies were applied in the development of this project:


### Frontend
* [Knockout 3.4.2](http://knockoutjs.com/downloads/index.html)
* [JQuery 3.2.1](https://jquery.com/download/)
    * [MyMessage Modal](http://www.jqueryscript.net/other/Android-Toast-Plugin-For-jQuery-myMessage.html)
* [Bootstrap 3.3.7](http://getbootstrap.com/getting-started/#download)

### Backend
* [NodeJS 6.11](https://nodejs.org/en/download/)
* [ExpressJS 4.15](http://expressjs.com/)

## Third-party Components and Contents

### Foursquare API

Foursquare API is the main source for Photos displayed in this project.

To successfully run this project, please create an account and/or a new project on [Fousquare Developer Site](https://developer.foursquare.com/).

### OpenWeatherMap API

Current weather status/temperature are retrieved from OpenWeatherMap API.

It is necessary to generate you own key on [OpenWeather API to run this project](https://openweathermap.org/api).

### Places Description

Places description were extracted from the following sources:

* [The Top 10 Things To See And Do In Copacabana](https://theculturetrip.com/south-america/brazil/articles/the-top-10-things-to-do-and-see-in-copacabana/)
* [Find the Best Things to Do in Copacabana](http://www.10best.com/destinations/brazil/rio-de-janeiro/copacabana/)

## Project Setup

* Make sure you are running Node.JS LTS version;
* Checkout/Clone this project;
* Copy and rename `config-template.json` to `config.json`. This file contains keys and secrets for third-party apis;
    * Place your APIs keys and ids from Foursquare and OpenWeatherMap on the identified properties.
    * Provide a new Key for Google Maps API from you Google [Developer Console](https://console.developers.google.com);
* Run `npm install` to download dependencies needed.

At this point, the project is fully configured and able to run.

## Running

By default, this Neighborhood Project is running on port *3000*. Running or port *80* demands `su` powers, and a minor change on `index.js` source file:

Change `app.liste(3000,...)` to listen on port *80*:
```
app.listen(3000, () => {
    console.log('Online');
});
```

Now, just launch the application with `npm start`(or `sudo npm start` when listening to port 80).

## JSDocs

Check documentation at `/docs` URI for more details.

Docs were generated with [jsdoc](http://usejsdoc.org/) by issuing `jsdoc -c jsdoc.json` on the root level of this project..
