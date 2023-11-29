const Joi = require('joi');

const lineItem = Joi.object({
  lineItemId: Joi.string().required(),
  sku: Joi.string().required(),
  quantity: Joi.number().default(1).optional(),
  storeId: Joi.string().required(),
  promisedReadyForPickupDate: Joi.date()
})

const pickupPerson = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).pattern(/^[\d\s-+]*$/).required()
})

module.exports= {
  "POST:/v1/partner/fulfillment/availability/pickup": Joi.object({
    sku: Joi.string().required(),
    quantity: Joi.number().default(1).optional(),
    storeId: Joi.string(),
    postalCode: Joi.string(),
  }).xor('storeId', 'postalCode'),

  "POST:/v1/partner/fulfillment/reservation": Joi.object({
    orderId: Joi.string().required(),
    orderDate: Joi.date().required(),
    lineItems: Joi.array().items(lineItem).required()
  }),

  "POST:/v1/partner/order": Joi.object({
    reservationId: Joi.string().required(),
    pickupPerson: pickupPerson.required()
  })
}