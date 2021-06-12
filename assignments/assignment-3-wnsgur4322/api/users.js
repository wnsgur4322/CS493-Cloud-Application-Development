const router = require('express').Router();

const { generateAuthToken, requireAuthentication, requireAuthentication_createUser } = require('../lib/auth');
const { getBusinessesByOwnerId } = require('../models/business');
const { getReviewsByUserId } = require('../models/review');
const { getPhotosByUserId } = require('../models/photo');
const { UserSchema, 
  insertNewUser, 
  getUserById,
  getUserID,
  validateUser } = require('../models/user');
const { validateAgainstSchema } = require('../lib/validation');


router.post('/', requireAuthentication_createUser, async (req, res) => {
  var Isadmin = Object();
  if (req.user == null){
    Isadmin.admin = false;
  } else {
    Isadmin = await getUserById(parseInt(req.user));
  }
  console.log(Isadmin);
  
  console.log("==req.body.admin:", req.body.admin);
  
  if ((req.body.admin == true) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Only admin account can create another admin account!"
    });
  }
  else {
    if (validateAgainstSchema(req.body, UserSchema)) {
      try {
        const id = await insertNewUser(req.body);
        res.status(201).send({
          _id: id
        });
      } catch (err) {
        console.error("  -- Error:", err);
        res.status(500).send({
          error: "Error inserting new user.  Try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body does not contain a valid User."
      });
    }
  }
});

router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password){
    try {
    const authenticated = await validateUser(req.body.email, req.body.password);
    if (authenticated) {
      const login_id = await getUserID(req.body.email);
      console.log("authenticated id: ", login_id);
      res.status(200).send({
        token: generateAuthToken(login_id)
      });
    } else {
      res.status(401).send({
        error: "Invalid authentication credentials."
      });
     }
    } catch (err) {
      console.error(" --error:", err);
      res.status(500).send({
        error: "Error logging in. Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body needs `email` and `password`."
    });
  }
});

// mutltiple middleware functions into one endpoint
// use next() to go to next functon
router.get('/:id', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested id:", req.params.id);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.params.id)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  } else {
    try {
      const user = await getUserById(req.params.id);
      if (user) {
        res.status(200).send(user);
      } else {
        next();
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
  }
});


/*
 * Route to list all of a user's businesses.
 */
router.get('/:id/businesses', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested id:", req.params.id);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.params.id)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  } else {
    try {
      const businesses = await getBusinessesByOwnerId(parseInt(req.params.id));
      if (businesses) {
        res.status(200).send({ businesses: businesses });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch businesses.  Please try again later."
      });
    }
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:id/reviews', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested id:", req.params.id);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.params.id)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  } else {  
  try {
    const reviews = await getReviewsByUserId(parseInt(req.params.id));
    if (reviews) {
        res.status(200).send({ reviews: reviews });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch reviews.  Please try again later."
      });
    }
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:id/photos', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested id:", req.params.id);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.params.id)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  } else {   
  try {
    const photos = await getPhotosByUserId(parseInt(req.params.id));
    if (photos) {
      res.status(200).send({ photos: photos });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photos.  Please try again later."
    });
  }
 }
});


module.exports = router;