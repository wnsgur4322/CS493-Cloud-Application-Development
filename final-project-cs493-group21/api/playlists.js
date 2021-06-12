const router = require('express').Router();

const { requireAuthentication } = require('../lib/auth');
const { SongSchema,
    saveAudioFile,
    getSongInfoById,
    getSongById } = require('../models/song');

const { PlaylistSchema,
    createPlaylist,
    getPlaylistByID,
    deletePlaylistByID, 
    addSongToPlaylist,
    removeSongFromPlaylist} = require('../models/playlist');

const { validateAgainstSchema } = require('../lib/validation');
const { validateUser, getUserById } = require('../models/user');

router.post('/', requireAuthentication, async(req, res) => {
    console.log("== req.body:", req.body);
    const user = req.user;
    console.log("== req.user", user);
    if (validateAgainstSchema(req.body, PlaylistSchema)) {
      const playlist = {
            //id: req.user,
            userid: req.user,
            name: req.body.name,
            songs: req.body.songs
      }
      try {
        const id = await createPlaylist(playlist);
        res.status(201).send({
          id: id,
          links: {
            playlist: `/playlists/${id}`,
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting playlist into DB. Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid playlist object"
      });
    }
});


router.get('/:id', async(req, res, next) => {
    console.log("requested playlist id:", req.params.id);
        try {
                const playlist = await getPlaylistByID(req.params.id);
                if (playlist) {
                        const responseBody = {
                                id: playlist.id,
                                userid: playlist.userid,
                                name: playlist.name,
                                songs: playlist.songs
                }
                        res.status(200).send(responseBody);
                } else {
                  next();
                }
              } catch (err) {
                console.error(err);
                res.status(500).send({
                  error: "Unable to fetch playlist data. Please try again later."
                });
              }
});


/* 
req.body{
    action: add, remove,
    songs: songid
}

action must be specified as add to correctly add to a playlist.
*/
router.patch('/:id', requireAuthentication, async(req, res) => {
    if(req.body.action == 'add'){ //if we're adding a song
        try {
            const playlist = await addSongToPlaylist(req.params.id, req.body.song);
            if (playlist) {
                    const responseBody = {
                            id: playlist.id,
                            userid: playlist.userid,
                            name: playlist.name,
                            songs: playlist.songs
            }
                    res.status(200).send(responseBody);
            } else {
                console.error(err);
                res.status(500).send({
                  error: "Unable to modify playlist data. Song may already exist in desired Playlist."
                });
            }
          } catch (err) {
            console.error(err);
            res.status(500).send({
              error: "Unable to modify playlist data. Please try again later."
            });
          }
    }else{ //if we're removing a song
        try {
            const playlist = await removeSongFromPlaylist(req.params.id, req.body.song);
            if (playlist) {
                    const responseBody = {
                            id: playlist.id,
                            userid: playlist.userid,
                            name: playlist.name,
                            songs: playlist.songs
            }
                    res.status(200).send(responseBody);
            } else {
                console.error(err);
                res.status(500).send({
                  error: "Unable to modify playlist data. Song may not exist in desired Playlist."
                });
            }
          } catch (err) {
            console.error(err);
            res.status(500).send({
              error: "Unable to modify playlist data. Please try again later."
            });
          }
    }
});


router.delete('/:id', requireAuthentication, async(req, res, next) => {
    try {
        const playlist = await deletePlaylistByID(req.params.id);
        if (playlist >= 1) {
                const responseBody = {
                        playlist: req.params.id,
                        msg: "Playlist deleted."
        }
                res.status(200).send(responseBody);
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to delete playlist data. Please try again later."
        });
      }
});

module.exports = router;