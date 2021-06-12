const router = require('express').Router();
const { EDGE_WRAP } = require('jimp');
const multer = require('multer');

const {
        PhotoSchema,
        saveImageFile,
        getImageDownloadStreamByFilename,
        getDownloadStreamById,
        getImageByIdandSize,
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

router.get('/photos/:filename', async (req, res, next) => {
        var filename = req.params.filename.split("-")[0];
        var filesize = req.params.filename.split("-")[1].split(".")[0];
        
        console.log("== [GET] filename:", filename);
        console.log("== [GET] filesize:", filesize);
        try {
          const photo = await getImageByIdandSize(filename, filesize);
          console.log("== [GET] photo:", photo);

          getImageDownloadStreamByFilename(photo)
          .on('file', (file) => {
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
              err: "Photo size is not available to download for this photo"
            });
          } 
});


module.exports = router;