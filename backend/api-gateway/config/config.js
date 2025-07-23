const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.API_GATEWAY_PORT || 3000,
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  services: {
    food: {
      url: process.env.FOOD_SERVICE_URL || 'http://food-service:3003',
    },
    order: {
      url: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
    },
    payment: {
      url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3006',
    },
  },
}; 