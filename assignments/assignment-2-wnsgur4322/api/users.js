const router = require('express').Router();

const mysqlPool = require('../lib/mysql');
exports.router = router;

async function getBusinessbyUser(userid){
  const result = await mysqlPool.query(
      "SELECT * FROM businesses WHERE ownerid=?",
      [userid]
  );
  console.log("getBusinessbyUser: ",result[0][0]);
  if (result[0].length < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}

async function getReviewbyUser(userid){
  const result = await mysqlPool.query(
      "SELECT * FROM reviews WHERE userid=?",
      [userid]
  );
  console.log("getReviewbyUser: ",result[0][0]);
  if (result[0].length < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}

async function getPhotobyUser(userid){
  const result = await mysqlPool.query(
      "SELECT * FROM photos WHERE userid=?",
      [userid]
  );
  console.log("getPhotobyUser: ",result[0][0]);
  if (result[0].length < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}


/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res) {
  const userid = parseInt(req.params.userid);

  try {
    const business = await getBusinessbyUser(userid);
    console.log("owned business: ", business);
    res.status(200).send({business});
  } catch (err) {
      console.error(" -- error:", err);
      res.status(500).send({
              err: "Error fetching userID: " + userid +" from DB. Try again later."
      });
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async function (req, res) {
  const userid = parseInt(req.params.userid);

  try {
    const review = await getReviewbyUser(userid);
    console.log("review(s): ", review);
    res.status(200).send({review});
  } catch (err) {
      console.error(" -- error:", err);
      res.status(500).send({
              err: "Error fetching userID: " + userid +" from DB. Try again later."
      });
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res) {
  const userid = parseInt(req.params.userid);

  try {
    const photo = await getPhotobyUser(userid);
    console.log("photo(s): ", photo);
    res.status(200).send({photo});
  } catch (err) {
      console.error(" -- error:", err);
      res.status(500).send({
              err: "Error fetching userID: " + userid +" from DB. Try again later."
      });
  }
});
