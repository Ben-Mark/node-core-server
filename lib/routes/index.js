const express = require('express'),
    router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("youtube dl server")
});

router.use('/api/search', require('./youtubedl/search'));
router.use('/api/download', require('./youtubedl/download'));

module.exports = router;