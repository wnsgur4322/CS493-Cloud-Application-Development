const { getSongById } = require('./song');
const { ObjectId, GridFSBucket } = require('mongodb');
const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const PlaylistSchema = {
    id: {required: false},
    userid: {required: true},
    name: {required: true},
    songs: {required: false}
}
exports.PlaylistSchema = PlaylistSchema;

exports.createPlaylist = async function (playlist){
    newPlaylist = extractValidFields(playlist, PlaylistSchema);
    const db = getDBReference();
    const collection = db.collection('playlists');
    const result = await collection.insertOne(newPlaylist);
    return result.insertedId;
};

exports.getPlaylistByID = async function (id){
    const db = getDBReference();
    console.log(id);
      const collection = db.collection('playlists');
      if (!ObjectId.isValid(id)) {
        return null;
      } else {
        const results = await collection
          .find({ _id: new ObjectId(id) })
          .toArray();
        return results[0];
      }
};

exports.getPlaylistsByUserID = async function (id){
    const db = getDBReference();
    console.log(id);
      const collection = db.collection('playlists');
      if (!ObjectId.isValid(id)) {
        return null;
      } else {
        const results = await collection
          .find({ _id: new ObjectId(id) })
          .toArray();
        return results[0];
      } 
}

exports.addSongToPlaylist = async function (playlistID, songID){
    const db = getDBReference();
      const collection = db.collection('playlists');
      if (!ObjectId.isValid(playlistID)) {
        return null;
      } else {
        const song = songID;
        const init = await exports.getPlaylistByID(playlistID);
        await collection
          .updateOne({ "_id": new ObjectId(playlistID) },  {$addToSet: { songs: song }});
        const results = await exports.getPlaylistByID(playlistID);
        if(results.songs.length != init.songs.length){ //make sure we actually added the song
            return results;
        }else{
            return null;
        }
      }
};

exports.removeSongFromPlaylist = async function (playlistID, songID){
    const db = getDBReference();
      const collection = db.collection('playlists');
      if (!ObjectId.isValid(playlistID)) {
        return null;
      } else {
        const song = songID;
        const init = await exports.getPlaylistByID(playlistID);
        await collection
        .updateOne({ "_id": new ObjectId(playlistID) },  {$pull: { songs: song }});
        const results = await exports.getPlaylistByID(playlistID);
        if(results.songs.length != init.songs.length){ //make sure we actually removed the song
            return results;
        }else{
            return null;
        }
      }
};

exports.deletePlaylistByID = async function (id){
    const db = getDBReference();
    const collection = db.collection('playlists');
    if (!ObjectId.isValid(id)) {
      return null;
    } else {
      const results = await collection
        .deleteOne({ _id: new ObjectId(id) });
      return results.result.n; //returns number of deleted playlists
    }

};