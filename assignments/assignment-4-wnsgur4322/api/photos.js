/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const { validateAgainstSchema } = require('../lib/validation');
const { connectToRabbitMQ, getChannel } = require('../lib/rabbitmq');
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  saveImageFile,
  getImageDownloadStreamByFilename,
  remove_UploadedFile,
  getImageInfoById
} = require('../models/photo');

const acceptedFileTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const filename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = acceptedFileTypes[file.mimetype];
      callback(null, `${filename}.${extension}`); 
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!acceptedFileTypes[file.mimetype])  // !! means falsey -> true -> false, 
                                                        // falsey can be false, but not the same 

  }
});

/*
 * Route to create a new photo.
 */
router.post('/', upload.single('image'), async (req, res) => {
  console.log("== req.body:", req.body);
  console.log("== req.file:", req.file);

  if (validateAgainstSchema(req.body, PhotoSchema) && req.file) {
    const image = {
      contentType: req.file.mimetype,
      filename: req.file.filename,
      path: req.file.path,
      businessid: req.body.businessid,
      caption: req.body.caption
    };

    try {
      //const id = await insertNewPhoto(req.body);
      await connectToRabbitMQ('photos');
      const id = await saveImageFile(image);
      await remove_UploadedFile(req.file.path);
      //await fs.unlink(req.file.path);  // this line makes to not store 
                                          // on local file directory ('/uploads')
      const channel = getChannel();
      channel.sendToQueue('photos', Buffer.from(id.toString()));
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
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    //const photo = await getPhotoById(req.params.id);
    const photo = await getImageInfoById(req.params.id);
    if (photo) {
      const responseBody = {
        _id: photo._id,
        filename: photo.filename,
        url: `/media/photos/${photo.filename}`,
        contentType: photo.metadata.contentType,
        businessid: photo.metadata.businessid,
        caption: photo.metadata.caption,
        resized_images: photo.urls
      }
      console.log(photo.metadata.size);
      res.status(200).send(responseBody);
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

module.exports = router;
