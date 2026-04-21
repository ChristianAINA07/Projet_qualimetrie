const express = require('express');
const router = express.Router();

const { calculateKPI } = require('../src/controllers/kpiController');

// POST /api/calculate-kpi
router.post('/calculate-kpi', calculateKPI);

module.exports = router;