const express = require('express');
const router = express.Router();
const paymentRoutes = require('./paymentRoutes');
const discountRoutes = require('./discountRoutes');

// Mount payment routes
router.use('/payments', paymentRoutes);

// Mount discount routes
router.use('/discounts', discountRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Payment Service',
    timestamp: new Date().toISOString(),
    routes: {
      payments: '/api/payments'
    }
  });
});

module.exports = router;
