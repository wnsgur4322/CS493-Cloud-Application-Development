/*
 * Photo schema and data accessor methods.
 */
const fs = require('fs');
const { ObjectId, GridFSBucket } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a photo object.
 */
const PhotoSchema = {
  businessid: { required: true },
  caption: { required: false }
};
exports.PhotoSchema = PhotoSchema;

/*
 * Executes a DB query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
async function insertNewPhoto(photo) {
  photo = extractValidFields(photo, PhotoSchema);
  photo.businessid = ObjectId(photo.businessid);
  const db = getDBReference();
  const collection = db.collection('photos');
  const result = await collection.insertOne(photo);
  return result.insertedId;
}
exports.insertNewPhoto = insertNewPhoto;

/*
 * Executes a DB query to fetch a single specified photo based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * photo.  If no photo with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getPhotoById(id) {
  const db = getDBReference();
  const collection = db.collection('photos');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getPhotoById = getPhotoById;

/*
 * Executes a DB query to fetch all photos for a specified business, based
 * on the business's ID.  Returns a Promise that resolves to an array
 * containing the requested photos.  This array could be empty if the
 * specified business does not have any photos.  This function does not verify
 * that the specified business ID corresponds to a valid business.
 */
async function getPhotosByBusinessId(id) {
  // const db = getDBReference();
  // const collection = db.collection('photos');
  // if (!ObjectId.isValid(id)) {
  //   return [];
  // } else {
  //   const results = await collection
  //     .find({ businessid: new ObjectId(id) })
  //     .toArray();
  //   return results;
  // }
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'photos' });
  if (!ObjectId.isValid(id)) {
    console.log("null");
    return null;
  } else {
    const results = await bucket.find({ businessid: new ObjectId(id).businessid })
      .toArray();
    console.log(results);
    return results;
  }
}
exports.getPhotosByBusinessId = getPhotosByBusinessId;


exports.saveImageFile = (image) => {
  return new Promise((resolve, reject) => {
    const db = getDBReference();
    const bucket = new GridFSBucket(db, { bucketName: 'photos' });
    const metadata = {
      contentType: image.contentType,
      businessid: image.businessid,
      caption: image.caption
    };

    const uploadStream = bucket.openUploadStream(
      image.filename,
      { metadata: metadata }
    );
    fs.createReadStream(image.path).pipe(uploadStream)
    .on('error', (err) => {
      reject(err)
    })
    .on('finish', (result) => {
      resolve(result._id);
    });
  });
};


exports.getImageDownloadStreamByFilename = (filename) => {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'photos' });
  return bucket.openDownloadStreamByName(filename);
};

exports.getDownloadStreamById = function (id) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'photos' });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    return bucket.openDownloadStream(new ObjectId(id));
  }
};

exports.getImageInfoById = async function (id) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'photos' });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await bucket.find({ _id: new ObjectId(id) })
      .toArray();
    console.log(results);
    return results[0];
  }
};

exports.remove_UploadedFile = function (path) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

exports.updateImageDimensionsById = async function (id, dimensions) {
  const db = getDBReference();
  const collection = db.collection('photos.files');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "metadata.dimensions": dimensions }}
    );
    return result.matchedCount > 0;
  }
};

exports.getImageByIdandSize = async function (id, size){
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'photos' });

  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await bucket.find({ _id: new ObjectId(id) })
    .toArray();

    return results[0].filenames[size];
  }
};

exports.updateImageSizeById = async function (id, size, resized_id) {
    const db = getDBReference();
    const collection = db.collection('photos.files');
    const url = `/media/photos/${id}-${size}.jpg`;

    var update = {$set:{}};
    update.$set["urls." + size] = url;
    update.$set["filenames." + size] = resized_id;
    if (!ObjectId.isValid(id)) {
            return null;
    } else {
            const result = await collection.updateOne(
              { _id: new ObjectId(id) },
              update
            );
            return result.matchedCount > 0;
            // if (size === "orig") {
            //         const result = await collection.updateOne(
            //                 { _id: new ObjectId(id) },
            //                 { $set: { "metadata.orig": resized_id}}
            //         );
            //         return result.matchedCount > 0;
            // } else if (size === "1024") {
            //         const result = await collection.updateOne(
            //                 { _id: new ObjectId(id) },
            //                 { $set: { "metadata.1024": resized_id}}
            //         );
            //         return result.matchedCount > 0;
            // } else if (size === "640") {
            //         const result = await collection.updateOne(
            //                 { _id: new ObjectId(id) },
            //                 { $set: { "metadata.640": resized_id}}
            //         );
            //         return result.matchedCount > 0;
            // } else if (size === "256") {
            //         const result = await collection.updateOne(
            //                 { _id: new ObjectId(id) },
            //                 { $set: { "metadata.256": resized_id}}
            //         );
            //         return result.matchedCount > 0;
            // } else if (size === "128") {
            //         const result = await collection.updateOne(
            //                 { _id: new ObjectId(id) },
            //                 { $set: { "metadata.128": resized_id}}
            //         );
            //         return result.matchedCount > 0;
            // } else {
            //         return 0;
            // }
    }
};