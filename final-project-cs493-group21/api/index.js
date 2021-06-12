const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/songs', require('./songs'));
router.use('/media', require('./media'));
router.use('/playlists', require('./playlists'));
router.use('/artists', require('./artists'));
module.exports = router;