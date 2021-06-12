/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');
const {
  BusinessSchema,
  getBusinessesPage,
  insertNewBusiness,
  getBusinessById,
  getBusinessDetailsById,
  replaceBusinessById,
  deleteBusinessById,
  getBusinessesByOwnerdId
} = require('../models/business');
const { getUserById } = require('../models/user');

/*
 * Route to return a paginated list of businesses.
 */
router.get('/', async (req, res) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const businessPage = await getBusinessesPage(parseInt(req.query.page) || 1);
    businessPage.links = {};
    if (businessPage.page < businessPage.totalPages) {
      businessPage.links.nextPage = `/businesses?page=${businessPage.page + 1}`;
      businessPage.links.lastPage = `/businesses?page=${businessPage.totalPages}`;
    }
    if (businessPage.page > 1) {
      businessPage.links.prevPage = `/businesses?page=${businessPage.page - 1}`;
      businessPage.links.firstPage = '/businesses?page=1';
    }
    res.status(200).send(businessPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching businesses list.  Please try again later."
    });
  }
});

/*
 * Route to create a new business.
 */
router.post('/', requireAuthentication, async (req, res) => {
  console.log("logged-in id:",req.user, " requested id:", req.body.ownerid);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.body.ownerid)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource. please check your id"
    });
  } else {
    if (validateAgainstSchema(req.body, BusinessSchema)) {
      try {
        const id = await insertNewBusiness(req.body);
        res.status(201).send({
          id: id,
          links: {
            business: `/businesses/${id}`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Error inserting business into DB.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid business object."
      });
    }
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const business = await getBusinessDetailsById(parseInt(req.params.id));
    if (business) {
      res.status(200).send(business);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch business.  Please try again later."
    });
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested id:", req.body.ownerid);
  const Isadmin = await getUserById(parseInt(req.user));
  if ((parseInt(req.user) !== parseInt(req.body.ownerid)) && (Isadmin.admin != true)) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource. please check your id"
    });
  } else {
    if (validateAgainstSchema(req.body, BusinessSchema)) {
      try {
        const id = parseInt(req.params.id)
        const updateSuccessful = await replaceBusinessById(id, req.body);
        if (updateSuccessful) {
          res.status(200).send({
            links: {
              business: `/businesses/${id}`
            }
          });
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to update specified business.  Please try again later."
        });
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid business object"
      });
    }
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  console.log("logged-in id:",req.user, " requested business id:", req.params.id);
  const business = await getBusinessById(parseInt(req.params.id));
  
  if(business !== undefined){
    console.log("business ownerid:", business.ownerid);
  
    const Isadmin = await getUserById(parseInt(req.user));
    if ((parseInt(req.user) !== parseInt(business.ownerid)) && (Isadmin.admin != true)) {
      res.status(403).send({
        error: "Unauthorized to access the specified resource. please check your id"
      });
    } else {  
      try {
        const deleteSuccessful = await deleteBusinessById(parseInt(req.params.id));
        if (deleteSuccessful) {
          res.status(204).end();
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to delete business.  Please try again later."
        });
      }
    }
  } else {
    res.status(500).send({
      error: "The input business ID is not valid on DB."
    });
  }
});

module.exports = router;
