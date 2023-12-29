const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const buildingsRouter = require('./src/api/buildings');
const roomsRouter = require('./src/api/rooms');
const bookingsRouter = require('./src/api/bookings');

const app = express();

app.use(bodyParser.json()); 

app.use('/api/buildings', buildingsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.get('/ping', (req, res) => {
    res.status(200).send('PONG!');
});

app.use((req, res, next) => {
    res.status(404).json({ message: "not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
