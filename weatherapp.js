const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();
const db = require('./db');
const Address = require('./Models/weatherschema');
//const Person = require('./Models/person');

const {jwtAuthMiddleware, generateToken} = require('./JWT')

// Middleware to parse JSON request bodies
app.use(express.json());

const API_KEY = process.env.API_KEY;

// Route To add a person
app.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const newPerson = new Address(data);
        const person = await newPerson.save();
        console.log("Data Saved.");

        const payload = {
            id: person.id,
            username: person.username
        }
        const token = generateToken(payload);
        console.log(person.username)
        console.log("Token is ",token)
        res.status(200).json({person: person, token: token });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => { 
    const address = req.query.address;

    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${address}&appid=${API_KEY}`;
    
    axios.get(geoUrl)
        .then(response => {
            const locationData = response.data[0]; // From geocoding Api we get the response of array of location objects, keeping first one for best possible results as it would have give similar as well
            const lat = locationData.lat;
            const lon = locationData.lon;

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            return axios.get(weatherUrl);
        })
        .then(async response => {
            const data = response.data;
            const cityName = data.name;
            const temperature = data.main.temp;
            const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
            const message = `City Name: ${cityName}<br>Temperature: ${temperature}&deg;C<br>Sunset Time: ${sunsetTime}`;
            const {username, password} = req.body;
            const newCity = new Address({cityName, username, password});
            const address = await newCity.save();
            console.log("Data Saved");

            res.status(200).json({
                cityName,
                temperature,
                sunsetTime
            });

            // Alternatively, if you want to send the full HTML message
            // res.send(`<html><body><div id='container'><h1>${message}</h1></div></body></html>`);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('An error occurred');
        });
});

app.get('/weather', jwtAuthMiddleware,async (req, res) => {
    try {
        const data = await Address.find();
        console.log('Data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


const port2 = process.env.PORT || 3000;
app.listen(port2, () => {
    console.log(`Example app listening on port ${port2}`);
});
