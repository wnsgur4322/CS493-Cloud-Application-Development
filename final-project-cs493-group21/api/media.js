const router = require('express').Router();

const { getSongDownloadStreamByFilename,
        streamSongById
 } = require('../models/song');
 const { generateAuthToken, requireAuthentication, requireAuthentication_createUser } = require('../lib/auth');
 
router.get('/songs/:songid', requireAuthentication, async (req, res, next) => {
        var songid = req.params.songid;
        
        console.log("== [GET] songid:", songid);
        try {
          const song = await streamSongById(songid);
          console.log("== [GET] song:", song);

          const downloadstream = await getSongDownloadStreamByFilename(song);           // await is crucial to fix .on bug
          downloadstream.on('file', (file) => {
            res.status(200).type(file.metadata.contentType);
          })
          .on('error', (err) => {
            if (err.code === 'ENOENT') {
              next();
            } else {
              next(err);
            }
          })
          .pipe(res);
          } catch (err) {
            console.error(err);
            res.status(500).send({
              err: "The requested song is not available"
            });
          } 
});


module.exports = router;