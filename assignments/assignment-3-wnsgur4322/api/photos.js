/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  replacePhotoById,
  deletePhotoById
} = require('../models/photo');
const { getUserById } = require('../models/user');

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication, async (req, res) => {
  console.log("logged-in id:",req.user, " requested id:", req.body.userid);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.body.userid)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource. please check your id"
    });
  } else {
    if (validateAgainstSchema(req.body, PhotoSchema)) {
      try {
        const id = await insertNewPhoto(req.body);
        res.status(201).send({
          id: id,
          links: {
            photo: `/photos/${id}`,
            business: `/businesses/${req.body.businessid}`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting photo into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid photo object"
      });
    }
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await getPhotoById(parseInt(req.params.id));
    if (photo) {
      res.status(200).send(photo);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    });
  }
});

/*
 * Route to update a photo.
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested id:", req.body.userid);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.body.userid)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource. please check your id"
    });
  } else {
    if (validateAgainstSchema(req.body, PhotoSchema)) {
      try {
        /*
        * Make sure the updated photo has the same businessID and userID as
        * the existing photo.  If it doesn't, respond with a 403 error.  If the
        * photo doesn't already exist, respond with a 404 error.
        */
        const id = parseInt(req.params.id);
        const existingPhoto = await getPhotoById(id);
        if (existingPhoto) {
          if (req.body.businessid === existingPhoto.businessid && req.body.userid === existingPhoto.userid) {
            const updateSuccessful = await replacePhotoById(id, req.body);
            if (updateSuccessful) {
              res.status(200).send({
                links: {
                  business: `/businesses/${req.body.businessid}`,
                  photo: `/photos/${id}`
                }
              });
            } else {
              next();
            }
          } else {
            res.status(403).send({
              error: "Updated photo must have the same businessID and userID"
            });
          }
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to update photo.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid photo object."
      });
    }
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested photo id:", req.params.id);
  const photo = await getPhotoById(parseInt(req.params.id));
  
  if(photo !== undefined){
    console.log("photo userid:", photo.userid);
  
    const Isadmin = await getUserById(parseInt(req.user));
    if ((parseInt(req.user) !== parseInt(photo.userid)) && (Isadmin.admin != true)) {
      res.status(403).send({
        error: "Unauthorized to access the specified resource. please check your id"
      });
    } else {  
    try {
      const deleteSuccessful = await deletePhotoById(parseInt(req.params.id));
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to delete photo.  Please try again later."
      });
    }
  }
  } else {
      res.status(500).send({
        error: "The input photo ID is not valid on DB."
      });
  }
});

module.exports = router;
