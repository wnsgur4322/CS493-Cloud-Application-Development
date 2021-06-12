const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const mysqlPool = require('../lib/mysql');
//const validation = require('../lib/validation');

//const businesses = require('../data/businesses');

exports.router = router;
//exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};
exports.businessSchema = businessSchema;

async function getBusinessCount() {
  const [ results ] = await mysqlPool.query(
    "SELECT COUNT(*) AS count FROM businesses;");
  console.log(" -- results:", results);
  return results[0].count;
}

async function getBusinessPage(page) {
  const count = await getBusinessCount();
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;     // if page < 1, then page is 1
  const offset = (page - 1) * pageSize;

  /*
  *       offset = "; DROP TABLES *;"
  */
  const [ results ] = await mysqlPool.query(
      //"SELECT * FROM businesses ORDER BY id LIMIT " + offset + "," + pageSize
      // ? is placeholder, this way is better then above one
      "SELECT * FROM businesses ORDER BY id LIMIT ?,?;", 
      [ offset, pageSize ]
  );
  return {
  businesses: results,
  page: page,
  totalPages: lastPage,
  pageSize: pageSize,
  count: count
};
}


async function insertNewBusiness(business) {
  business = extractValidFields(business, businessSchema);
  const [ result ] = await mysqlPool.query(
          "INSERT INTO businesses SET ? ",
          business
  );
  return result.insertId;
}


async function getBusinessbyID(businessid){
  const result = await mysqlPool.query(
      "SELECT * FROM businesses WHERE id=?",
      [businessid]
  );
  console.log("getBusinessbyID: ",result[0][0]);
  if (result[0].length < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0][0];
}

async function updateBusinessbyID(business, businessid){
  const result = await mysqlPool.query(
    "UPDATE businesses SET ? WHERE id=?",
    [business, businessid]
  );
  console.log("updateBusinessbyID: ", result[0]);
  if(result[0]['affectedRows'] < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}

async function deleteBusinessbyID(businessid){
  const result = await mysqlPool.query(
    "DELETE FROM businesses WHERE id=?",
    [businessid]
  );
  console.log("deleteBusinessbyID: ",result[0]);
  if(result[0]['affectedRows'] < 1){
    throw new Error("ID is not valid in DB");
  }
  return result[0];
}

// business part

// Route to return a list of businesses.
router.get('/', async (req, res) => {
  try {
          return await getBusinessPage(
                  parseInt(req.query.page) || 1 
          ).then( (pageInfo) => {

            pageInfo.links = {};

            let {links, totalPages, page} = pageInfo;

            if (page < totalPages){
              links.nextPage = '/businesses?page=' + (page + 1);
              links.lastPage = '/businesses?page=' + totalPages;
            }

            if (page > 1){
              links.prevPage = '/businesses?page=' + (page - 1);
              links.firstPage = '/busineeses';
            }
            res.status(200).send(pageInfo);
          })

  } catch (err) {
          console.error(" -- error:", err);
          res.status(500).send({
                  err: "Error fetching businesses page from DB. Try again later."
          });
  }

});

/*
* Route to create a new business.
* INSERT INTO businesses SET ...;
*/
router.post('/', async (req, res, next) => {
  console.log("  -- req.body:", req.body);
  if (validateAgainstSchema(req.body, businessSchema)) {
    try {
      const id = await insertNewBusiness(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error("  -- error:", err);
      res.status(500).send({
        err: "Error inserting new business into DB.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid business."
    });
  }
});

/*
* Route to fetch info about a specific business.
* SELECT * FROM businesses WHERE id=?;
*/

router.get('/:businessid', async (req, res, next) => {
  const businessid = parseInt(req.params.businessid);

  try {
    const id = await getBusinessbyID(businessid);
    console.log("id: ", id);
    res.status(200).send({
      id: id
    });
  } catch (err) {
      console.error(" -- error:", err);
      res.status(500).send({
              err: "Error fetching businessID: " + businessid +" from DB. Try again later."
      });
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:businessid', async (req, res, next) => {
  const businessid = parseInt(req.params.businessid);

  if (validateAgainstSchema(req.body, businessSchema)) {
    let business = extractValidFields(req.body, businessSchema);
    console.log(business);

    updateBusinessbyID(business, businessid).then((IsSucess) => {
      if(IsSucess){
        res.status(200).json({
          links: {
            business: `/businesses/${businessid}`
          }
        });
      } else {
        next();
      }
    }).catch((err) => {
      res.status(500).json({
        error: "[ERR] can't update picked business"
      });
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid business object"
    });
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', function (req, res, next) {
  const businessid = parseInt(req.params.businessid);

  deleteBusinessbyID(businessid).then((IsSucess) => {
    if(IsSucess){
      res.status(204).end();
    } else {
      next();
    }
  }).catch((err) => {
    res.status(500).json({
      error: "[ERR] can't delete picked business"
    });
  });
});