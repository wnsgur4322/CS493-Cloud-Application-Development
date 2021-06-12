const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const mysqlPool = require('../lib/mysql');
const photos = require('../data/photos');

exports.router = router;
//exports.photos = photos;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};
exports.photoSchema = photoSchema;

async function insertNewPhoto(photo) {
  photo = extractValidFields(photo, photoSchema);
  const [ result ] = await mysqlPool.query(
          "INSERT INTO photos SET ? ",
          photo
  );
  return result.insertId;
}

async function getPhotobyID(photoid){
  const result = await mysqlPool.query(
    "SELECT * FROM photos WHERE id=?",
    [photoid]
  );
  console.log("getPhotobyID: ",result[0][0]);
  if (result[0].length < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0][0];
}

async function updatePhotobyID(photo, photoid){
  const result = await mysqlPool.query(
    "UPDATE photos SET ? WHERE id=?",
    [photo, photoid]
  );
  console.log("updatePhotobyID: ", result[0]);
  if(result[0]['affectedRows'] < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}

async function deletePhotobyID(photoid){
  const result = await mysqlPool.query(
    "DELETE FROM photos WHERE id=?",
    [photoid]
  );
  console.log("deletePhotobyID: ",result[0]);
  if(result[0]['affectedRows'] < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}

/*
 * Route to create a new photo.
 */
router.post('/', async (req, res) => {
  console.log("  -- req.body:", req.body);
  if (validateAgainstSchema(req.body, photoSchema)) {
    try {
      const id = await insertNewPhoto(req.body);
      res.status(201).send({
        id: id,
        links: {
          review: `/photos/${id}`
        }
      });
    } catch (err) {
      console.error("  -- error:", err);
      res.status(500).send({
        err: "Error inserting new photo into DB.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid photo."
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  const photoID = parseInt(req.params.photoID);

  try {
    const id = await getPhotobyID([photoID]);
    console.log("id: ", id);
    res.status(200).send({
      id: id
    });
  } catch (err) {
      console.error(" -- error:", err);
      res.status(500).send({
              err: "Error fetching photoID: " + photoID +" from DB. Try again later."
      });
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', async (req, res, next) => {
  const photoID = parseInt(req.params.photoID);

  if (validateAgainstSchema(req.body, photoSchema)) {

    let updatedPhoto = extractValidFields(req.body, photoSchema);
    getPhotobyID(photoID).then((photo) => {
      /*
       * Make sure the updated photo has the same businessid and userid as
       * the existing photo.
       */
      if((photo.businessid == updatedPhoto.businessid) && (photo.userid == updatedPhoto.userid)){
        updatePhotobyID(updatedPhoto, photoID).then((IsUpdated) => {
            if(IsUpdated){
              res.status(200).json({
                links: {
                  photo: `/photos/${photoID}`,
                  business: `/businesses/${updatedPhoto.businessid}`
                }
              });
            } else {
              next();
            }
          }).catch((err) => {
            res.status(500).json({
              error: "[ERR] can't update picked photo"
            });
          });
        } else {
          res.status(403).json({
            error: "Updated review cannot modify businessid or userid"
          });
        }
      }).catch((err) => {
        res.status(500).json({
          err: "Error fetching photoID: " + photoID +" from DB. Try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', function (req, res, next) {
  const photoID = parseInt(req.params.photoID);

  deletePhotobyID(photoID).then((IsSucess) => {
    if(IsSucess){
      res.status(204).end();
    } else {
      next();
    }
  }).catch((err) => {
    res.status(500).json({
      error: "[ERR] can't delete picked photo"
    });
  });

});
