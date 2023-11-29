const express = require('express')
const app = express()
const port = 3000
const _ = require('lodash');
const moment = require('moment');
const short = require('short-uuid');
const reservations = require('./data/reservations')
const orders = require('./data/orders')
const schemaValidation = require('./middlewares/schema-validation');
const oauth = require('./middlewares/o-auth');
const oauthData = require('./data/oauth');
const availability = require('./data/availability');

// Middleware
app.use(express.json())
app.use(schemaValidation);
app.use(oauth);

//Register Routes
app.get('/helloworld', (req, res) => {
    res.send('Hello World!')
});

app.post('/ping', (req, res) => {
    req.body.message = "pong"
    res.send(req.body)
});

app.post('/v1/partner/auth/token', (req, res) => {
    const newToken = {
        token: short.uuid(),
        validThru: moment().add(1,'hour').toISOString()
    }
    oauthData.tokens.push(newToken);
    res.send(newToken);
})

app.post('/v1/partner/fulfillment/availability/pickup', (req, res) => {
    const key = req.body.sku + ":" + (req.body.storeId || req.body.postalCode);
    let skuAvailability = availability[key];

    if (!skuAvailability) {
        skuAvailability =[{
            storeId: req.body.storeId || (parseInt(Math.random() * 10) + 100).toString(),
            distance: req.body.storeId ? 0 : parseInt(Math.random() * 50),
        }] 
        availability[key] = _.cloneDeep(skuAvailability);
    }
    _.forEach(skuAvailability, avail =>  {
        avail.promisedReadyForPickupDate = moment().format('YYYY-MM-DD');
    });

    const response = {
        criteria:  _.cloneDeep(req.body),
        availability: skuAvailability
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