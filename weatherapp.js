const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;

app.get('/', (req, res) => {
    const address = req.query.address;

    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${address}&appid=${API_KEY}`;
    
    axios.get(geoUrl)
        .then(response => {

            const locationData = response.data[0];
            const lat = locationData.lat;
            const lon = locationData.lon;

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            return axios.get(weatherUrl);
        })
        .then(response => {
            const data = response.data;
            const cityName = data.name;
            const temperature = data.main.temp;
            const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
            const message = `City Name: ${cityName}<br>Temperature: ${temperature}&deg;C<br>Sunset Time: ${sunsetTime}`;

            res.send(`<html><body><div id='container'><h1>${message}</h1></div></body></html>`);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('An error occurred');
        });
});

const port2 = process.env.PORT || 3000;
app.listen(port2, () => {
    console.log(`Example app listening on port ${port2}`);
});
