const express = require('express');
const multer = require('multer');
const crypto = require('crypto');

const { connectToDB } = require('./lib/mongo');
const { getImageInfoById,
  saveImageInfo,
  saveImageFile,
  getImageDownloadStreamByFilename } = require('./models/image');
const { createPool } = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 8000;

const acceptedFileTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif'
};

//const upload = multer({ dest: `${__dirname}/uploads` });
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

//app.use('/media/images', express.static(`${__dirname}/uploads`));



app.get('/', (req, res, next) => {
  res.status(200).sendFile(__dirname + '/index.html');
});

app.post('/images', upload.single('image'), async (req, res, next) => {
  console.log("== req.body:", req.body);
  console.log("== req.file:", req.file);
  if (req.file && req.body && req.body.userId) {
    const image = {
      contentType: req.file.mimetype,
      filename: req.file.filename,
      path: req.file.path,
      userId: req.body.userId
    };
    try {
      // const id = await saveImageInfo(image);
      const id = await saveImageFile(image);
      res.status(200).send({
        id: id
      });
    } catch (err) {
      next(err);
    } 
  } else {
    res.status(400).send({
      error: "Request body must contain 'image' and 'userId' "
    });
  }
});

app.get('/images/:id', async (req, res, next) => {
  try {
    const image = await getImageInfoById(req.params.id);
    if (image) {
      // delete image.path;
      // image.url = `/media/images/${image.filename}`;
      const responseBody = {
        _id: image._id,
        filename: image.filename,
        url: `/media/images/${image.filename}`,
        contentType: image.metadata.contentType,
        userId: image.metadata.userId
      }
      res.status(200).send(responseBody);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

app.get('/media/images/:filename', (req, res, next) => {
  getImageDownloadStreamByFilename(req.params.filename)
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
});

app.use('*', (err, req, res, next) => {
  console.error(err);
  res.status(500).send({
    error: "An error occuerred. Try again later."
  })
})

app.use('*', (req, res, next) => {
  res.status(404).send({
    err: "Path " + req.originalUrl + " does not exist"
  });
});

connectToDB(() => {
  app.listen(port, () => {
    console.log("== Server is running on port", port);
  });
});
