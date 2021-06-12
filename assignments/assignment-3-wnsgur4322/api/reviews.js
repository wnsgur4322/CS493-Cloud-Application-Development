/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');
const {
  ReviewSchema,
  hasUserReviewedBusiness,
  insertNewReview,
  getReviewById,
  replaceReviewById,
  deleteReviewById
} = require('../models/review');
const { getUserById } = require('../models/user');

/*
 * Route to create a new review.
 */
router.post('/', requireAuthentication, async (req, res) => {
  console.log("logged-in id:",req.user, " requested id:", req.body.userid);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.body.userid)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource. please check your id"
    });
  } else {
    if (validateAgainstSchema(req.body, ReviewSchema)) {
      try {
        /*
        * Make sure the user is not trying to review the same business twice.
        * If they're not, then insert their review into the DB.
        */
        const alreadyReviewed = await hasUserReviewedBusiness(req.body.userid, req.body.businessid);
        if (alreadyReviewed) {
          res.status(403).send({
            error: "User has already posted a review of this business"
          });
        } else {
          const id = await insertNewReview(req.body);
          res.status(201).send({
            id: id,
            links: {
              review: `/reviews/${id}`,
              business: `/businesses/${req.body.businessid}`
            }
          });
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting review into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid review object."
      });
    }
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const review = await getReviewById(parseInt(req.params.id));
    if (review) {
      res.status(200).send(review);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch review.  Please try again later."
    });
  }
});

/*
 * Route to update a review.
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested id:", req.body.userid);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.body.userid)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource. please check your id"
    });
  } else {
    if (validateAgainstSchema(req.body, ReviewSchema)) {
      try {
        /*
        * Make sure the updated review has the same businessID and userID as
        * the existing review.  If it doesn't, respond with a 403 error.  If the
        * review doesn't already exist, respond with a 404 error.
        */
        const id = parseInt(req.params.id);
        const existingReview = await getReviewById(id);
        if (existingReview) {
          if (req.body.businessid === existingReview.businessid && req.body.userid === existingReview.userid) {
            const updateSuccessful = await replaceReviewById(id, req.body);
            if (updateSuccessful) {
              res.status(200).send({
                links: {
                  business: `/businesses/${req.body.businessid}`,
                  review: `/reviews/${id}`
                }
              });
            } else {
              next();
            }
          } else {
            res.status(403).send({
              error: "Updated review must have the same businessID and userID"
            });
          }
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to update review.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid review object."
      });
    }
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested review id:", req.params.id);
  const review = await getReviewById(parseInt(req.params.id));
  
  if(review !== undefined){
    console.log("review userid:", review.userid);
  
    const Isadmin = await getUserById(parseInt(req.user));
    if ((parseInt(req.user) !== parseInt(review.userid)) && (Isadmin.admin != true)) {
      res.status(403).send({
        error: "Unauthorized to access the specified resource. please check your id"
      });
    } else {
      try {
        const deleteSuccessful = await deleteReviewById(parseInt(req.params.id));
        if (deleteSuccessful) {
          res.status(204).end();
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to delete review.  Please try again later."
        });
        }
    }
  } else {
    res.status(500).send({
      error: "The input review ID is not valid on DB."
    });
  }
});

module.exports = router;
