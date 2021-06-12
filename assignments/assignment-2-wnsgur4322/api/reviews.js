const router = require('express').Router();
//const validation = require('../lib/validation');
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const mysqlPool = require('../lib/mysql');
//const reviews = require('../data/reviews');

exports.router = router;
//exports.reviews = reviews;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};
exports.reviewSchema = reviewSchema;

async function insertNewReview(review) {
  review = extractValidFields(review, reviewSchema);
  const [ result ] = await mysqlPool.query(
          "INSERT INTO reviews SET ? ",
          review
  );
  return result.insertId;
}

async function getReviewbyID(reviewid){
  const result = await mysqlPool.query(
    "SELECT * FROM reviews WHERE id=?",
    [reviewid]
  );
  console.log("getReviewbyID: ",result[0][0]);
  if (result[0].length < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0][0];
}

async function updateReviewbyID(review, reviewid){
  const result = await mysqlPool.query(
    "UPDATE reviews SET ? WHERE id=?",
    [review, reviewid]
  );
  console.log("updateReviewbyID: ", result[0]);
  if(result[0]['affectedRows'] < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}

async function deleteReviewbyID(reviewid){
  const result = await mysqlPool.query(
    "DELETE FROM reviews WHERE id=?",
    [reviewid]
  );
  console.log("deleteReviewbyID: ",result[0]);
  if(result[0]['affectedRows'] < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}

/*
 * Route to create a new review.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, reviewSchema)) {
    let review = extractValidFields(req.body, reviewSchema);

    insertNewReview(review).then((id) => {
      res.status(201).json({
        id: id,
        links: {
          review: `/reviews/${id}`,
          business: `/businesses/${review.businessid}`
        }
      });
    }).catch((err) => {
      if(err.code == 'ER_DUP_ENTRY'){
        res.status(403).json({
          error: "User has already posted a review of this business"
        });
    } else {
      console.log(err);
      res.status(500).json({
        error: "[ERR] can't create new review"
        });
      }
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async (req, res, next) => {
  const reviewID = parseInt(req.params.reviewID);

  try {
    const id = await getReviewbyID(reviewID);
    console.log("id: ", id);
    res.status(200).send({
      id: id
    });
  } catch (err) {
      console.error(" -- error:", err);
      res.status(500).send({
              err: "Error fetching reviewID: " + reviewID +" from DB. Try again later."
      });
  }
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', async (req, res, next) => {
  const reviewID = parseInt(req.params.reviewID);

  if (validateAgainstSchema(req.body, reviewSchema)) {

      let updatedReview = extractValidFields(req.body, reviewSchema);
      getReviewbyID(reviewID).then((review) => {
          /*
          * Make sure the updated review has the same businessid and userid as
          * the existing review.
          */
        if((review.businessid == updatedReview.businessid) && (review.userid == updatedReview.userid)){
          updateReviewbyID(updatedReview, reviewID).then((IsUpdated) => {
            if(IsUpdated){
              res.status(200).json({
                links: {
                  review: `/reviews/${reviewID}`,
                  business: `/businesses/${updatedReview.businessid}`
                }
              });
            } else {
              next();
            }
          }).catch((err) => {
            res.status(500).json({
              error: "[ERR] can't update picked review"
            });
          });
        } else {
          res.status(403).json({
            error: "Updated review cannot modify businessid or userid"
          });
        }
      }).catch((err) => {
        res.status(500).json({
          err: "Error fetching reviewID: " + reviewID +" from DB. Try again later."
        });
      });
  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID);

  deleteReviewbyID(reviewID).then((IsSucess) => {
    if(IsSucess){
      res.status(204).end();
    } else {
      next();
    }
  }).catch((err) => {
    res.status(500).json({
      error: "[ERR] can't delete picked review"
    });
  });
});