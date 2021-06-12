const { ObjectId } = require('mongodb');
const { getDBReference } = require('../lib/mongo');

/*
 * Schema describing required/optional fields for an artist object.
 */
//Is the artist schema needed?

async function getArtistsPage(page) {
  const db = getDBReference();
  const collection = db.collection('artists');
  const count = await collection.countDocuments();

  /*
   * Compute last page number and make sure page is within allowed bounds.
   * Compute offset into collection.
   */
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;
  
  const results = await collection.find() //vs "find({})"?
    .sort({ _id: 1})
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    artists: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  }
}
exports.getArtistsPage = getArtistsPage;

async function getArtistById(id){
  const db = getDBReference();
  const collection = db.collection('artists');
  if (!ObjectId.isValid(id)){
    console.log(" !== The given id is not valid:", id);
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getArtistById = getArtistById;

//add function to get the information about each of the artist albums
//if information for that album exists on the database