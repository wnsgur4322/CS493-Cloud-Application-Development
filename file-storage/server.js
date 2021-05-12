const express = require('express');
const multer = require('multer');
const crypto = require('crypto');

const { connectToDB } = require('./lib/mongo');
const { getImageInfoById } = require('./models/image');
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
})

app.get('/', (req, res, next) => {
  res.status(200).sendFile(__dirname + '/index.html');
});

app.post('/images', upload.single('image'), (req, res, next) => {
  console.log("== req.body:", req.body);
  console.log("== req.file:", req.file);
  res.status(200).send();
});

app.get('/images/:id', async (req, res, next) => {
  try {
    const image = await getImageInfoById(req.params.id);
    if (image) {
      res.status(200).send(image);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
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
