const router = require('express').Router();

const multer = require('multer');
const crypto = require('crypto');
const mm = require('music-metadata');
const fs = require('fs');

const { generateAuthToken, requireAuthentication, requireAuthentication_createUser } = require('../lib/auth');

const { SongSchema,
        saveAudioFile,
        getSongInfoById,
        getSongsPage,
        getSongById } = require('../models/song');
const { validateAgainstSchema } = require('../lib/validation');

const acceptedFileTypes = {
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/mpeg': 'mp3'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
        const filename = crypto.pseudoRandomBytes(16).toString('hex');
        console.log(filename, file.mimetype)
        const extension = acceptedFileTypes[file.mimetype];
        console.log(extension)
        callback(null, `${filename}.${extension}`); 
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!acceptedFileTypes[file.mimetype])  // !! means falsey -> true -> false, 
                                                        // falsey can be false, but not the same 

  }
});

/*
 * Route to create a new song.
 */
router.post('/', requireAuthentication, upload.single('song'), async (req, res) => {
        console.log("== req.body:", req.body);
        console.log("== req.file:", req.file);
      
        if (validateAgainstSchema(req.body, SongSchema) && req.file) {
          const song = {
                file: req.file,
                contentType: req.file.mimetype,
                filename: req.file.filename,
                path: req.file.path,
                title: req.body.title,
                duration: req.body.duration,
                lyrics: req.body.lyrics,
                genre: req.body.genre,
                artistid: req.body.artistid,
                spotify_URL: req.body.spotify_URL
          };
      
          try {
            const id = await saveAudioFile(song);
            res.status(201).send({
              id: id,
              links: {
                song: `/songs/${id}`,
                artist: `/artists/${req.body.artistid}`
              }
            });
          } catch (err) {
            console.error(err);
            res.status(500).send({
              error: "Error inserting song into DB. Please try again later."
            });
          }
        } else {
          res.status(400).send({
            error: "Request body is not a valid song object"
          });
        }
});

/*
 * Route to return a paginated list of songs.
 */
router.get('/', requireAuthentication, async (req, res) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const songPage = await getSongsPage(parseInt(req.query.page) || 1);
    songPage.links = {};
    if (songPage.page < songPage.totalPages) {
      songPage.links.nextPage = `/songs?page=${songPage.page + 1}`;
      songPage.links.lastPage = `/songs?page=${songPage.totalPages}`;
    }
    if (songPage.page > 1) {
      songPage.links.prevPage = `/songs?page=${songPage.page - 1}`;
      songPage.links.firstPage = '/songs?page=1';
    }
    res.status(200).send(songPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching song list.  Please try again later."
    });
  }
});

router.get('/:id', requireAuthentication, async (req, res, next) => {
        console.log("requested song id:", req.params.id);
        try {
                const song = await getSongInfoById(req.params.id);
                if (song) {
                        const responseBody = {
                                _id: song._id,
                                filename: song.filename,
                                url: `/media/songs/${song._id}`,
                                contentType: song.metadata.contentType,
                                artistid: song.metadata.artistid,
                                lyrics: song.metadata.lyrics,
                                duration: song.metadata.duration,
                                genre: song.metadata.genre
                }
                        res.status(200).send(responseBody);
                } else {
                  next();
                }
              } catch (err) {
                console.error(err);
                res.status(500).send({
                  error: "Unable to fetch song data. Please try again later."
                });
              }
});


module.exports = router;