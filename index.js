const express = require('express')
const app = express()
const port = 3000
const _ = require('lodash');
const moment = require('moment');
const short = require('short-uuid');
const reservations = require('./data/reservations')
const orders = require('./data/orders')

// Middleware
app.use(express.json())

//Register Routes
app.get('/helloworld', (req, res) => {
    res.send('Hello World!')
});

app.post('/ping', (req, res) => {
    req.body.message = "pong"
    res.send(req.body)
});

app.post('/v1/partner/fulfillment/availability/pickup', (req, res) => {
    const response = {
        criteria:  _.cloneDeep(req.body),
        availability: [
            {
                storeId: req.body.storeId || "101",
                distance: req.body.storeId ? 0 : parseInt(Math.random() * 50),
                promisedReadyForPickupDate: moment().format('YYYY-MM-DD')
            }
        ]
    }
    res.send(response)
});

app.post('/v1/partner/fulfillment/reservation', (req, res) => { 
    const reservationId = "RES-" + short.generate()
    reservations[reservationId] = _.cloneDeep(req.body);
    _.extend(reservations[reservationId], { reservationId });
    const response = {
        orderId: req.body.orderId,
        reservationId,
        status: "Success",
        message: "Line items successfully allocated for the order."
    }
    res.send(response);
});

app.post('/v1/partner/order', (req, res) => { 
   if (!reservations[req.body.reservationId]) {
        return res.status(404).send({
            "statusCode": 404,
            "error": "ReservationNotFound",
            "message": "Requested reservation not found."
        });
    }
    const internalOrderId = "ORD-" + short.generate()
    orders[internalOrderId] = reservations[req.body.reservationId];
    _.extend(orders[internalOrderId], req.body, { internalOrderId });
    _.unset(reservations, req.body.reservationId);

    res.send(orders[internalOrderId]);
});

// Launch the server 
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});