const router = require('express').Router();

router.use('/data', require('./data.controller'));
router.use('/invoice', require('./invoice.controller'));

module.exports = router;