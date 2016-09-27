#!/usr/bin/env node

const rl = require('readline').createInterface(process.stdin, process.stdout);
const countries = require('./countries.geo.json').features;

var prompts = ['Enter coordinates (lat, lon)'],
    counter = 0;

// console.log(countries);

rl.on('line', (line) => {
    let lat = line.split(',')[0],
        long = line.split(',')[1],
        error = 0,
        lngRegEx = /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/,
        latRegEx = /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/,
        country = getCountry([lat, long], countries),
        letters = /^[a-zA-Z]+$/;

    if (isNaN(lat) || isNaN(long)) {
        lat = parseFloat(lat);
        long = parseFloat(long);
        console.log('(Wrong input) Invalid Input.');
    } else if (!lat && !long) {
        console.log('(wrong input) Invalid Input.');
    } else if (country) {
        console.log('(found something) <' + country.properties.name + '>');
    } else {
        console.log('(couldn’t find anything) No country found.');
    }

    rl.close();

}).on('close', () => {

});

function get() {
    rl.setPrompt(prompts[counter] + ': ');
    rl.prompt();
}

get();

function getCountry(userInput, data) {
    var country;

    return data.some(function (obj) {
        country = obj;

        var polygons = obj.geometry.coordinates;
        if (obj.geometry.type !== 'MultiPolygon') polygons = [polygons];
        return polygons.some(function (polygon) {
            return inPoly(userInput, polygon[0]);
        });
    }) ? country : null;
}

function inPoly(userInput, coord) {
    var winding = 0;

    for (var i = 0; i < coord.length-1; i++) {
        if (coord[i][1] <= userInput[1]) {
            if (coord[i+1][1] > userInput[1]) {
                if (isLeft(coord[i], coord[i+1], userInput) > 0) {
                    ++winding;
                }
            }
        } else {
            if (coord[i+1][1] <= userInput[1]) {
                if (isLeft(coord[i], coord[i+1], userInput) < 0) {
                    --winding;
                }
            }
        }
    }

    return winding;
}

function isLeft(p0, p1, p2) {
    return ((p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1]));
}

