/*
 * User schema and data accessor methods.
 */

const { ObjectId } = require('mongodb');
const { getDBReference } = require('../lib/mongo');
const bcrypt = require('bcryptjs');

const { extractValidFields } = require('../lib/validation');

/*
 * Schema for a User.
 */
const UserSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
  admin: {required: false, default: false}                               
};
exports.UserSchema = UserSchema;

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
  const userToInsert = extractValidFields(user, UserSchema);
  console.log(" -- userToInsert before hasing: ", userToInsert);
  userToInsert.password = await bcrypt.hash(userToInsert.password, 8);
  console.log(" -- userToInsert after hasing: ", userToInsert);

  const db = getDBReference();
  const collection = db.collection('users');
  const result = await collection.insertOne(userToInsert);
  return result.insertedId;
};


/*
 * Fetch a user from the DB based on user ID.
 */
exports.getUserById = async function (id) {
  const db = getDBReference();
  const collection = db.collection('users');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) }, { fields: {password: 0} })
      .toArray();
    return results[0];
  }
  //   const result = await mysqlPool.query(
  //     "SELECT users.id, users.name, users.email, users.admin FROM users WHERE id=?",
  //     [id]
  //   );
  //   console.log("getUserbyId: ",result[0][0]);
  //   if (result[0].length < 1){
  //     throw new Error("ID is not valid in DB");
  //   } else {
  //   const projection = includePassword ? {} : {password : 0}
  //   return result[0][0];
  // }
};


/*
 * Fetch a user from the DB based on user email.
 */
exports.getUserByemail = async function (email, includePassword) {
  const db = getDBReference();
  const collection = db.collection('users');

  const results = await collection
    .find({ email: email })
    .toArray();
  if (results){
  const projection = includePassword ? {} : {password : 0};
    return results[0];
  } else {
    return error;
  }
};

exports.getUserID =  async function (input_email, includePassword){
  const db = getDBReference();
  const collection = db.collection('users');

  const results = await collection
    .find({ email: `${input_email}` })
    .toArray();
  if (results){
    console.log("== getUserID: ", results[0]._id);
    const projection = includePassword ? {} : {password : 0};
    return results[0]._id;
  } else {
    return error;
  }
};

// login validation
exports.validateUser = async function (email, password) {
  const user = await exports.getUserByemail(email, true);
  console.log("user:", user.id);
  return user && await bcrypt.compare(password, user.password);

};
