/*
 * User schema and data accessor methods.
 */

//const { ObjectId } = require('mongodb');
const mysqlPool = require('../lib/mysqlPool');
const bcrypt = require('bcryptjs');

const { extractValidFields } = require('../lib/validation');
//const { getDBReference } = require('../lib/mongo');

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

  const [ result ] = await mysqlPool.query(
    "INSERT INTO users SET ? ",
    userToInsert
  );
  console.log("result:", result);
  return result.insertedId;
};


/*
 * Fetch a user from the DB based on user ID.
 */
exports.getUserById = async function (id, includePassword) {
    const result = await mysqlPool.query(
      "SELECT users.id, users.name, users.email, users.admin FROM users WHERE id=?",
      [id]
    );
    console.log("getUserbyId: ",result[0][0]);
    if (result[0].length < 1){
      throw new Error("ID is not valid in DB");
    } else {
    const projection = includePassword ? {} : {password : 0}
    return result[0][0];
  }
};

/*
 * Fetch a user from the DB based on user email.
 */
exports.getUserByemail = async function (email, includePassword) {
    const result = await mysqlPool.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );
    console.log("getUserbyemail: ",result[0][0]);
    if (result[0].length < 1){
      throw new Error("email is not valid in DB");
    } else {
    const projection = includePassword ? {} : {password : 0}
    return result[0][0];
  }
};

exports.getUserID =  async function (email){
  const result = await mysqlPool.query(
    "SELECT * FROM users WHERE email=?",
    [email]
  );
  if (result[0].length < 1){
    throw new Error("email is not valid in DB");
  } else {
  return result[0][0].id;
  }
};

// login validation
exports.validateUser = async function (email, password) {
  const user = await exports.getUserByemail(email, true);
  console.log("user:", user.id);
  return user && await bcrypt.compare(password, user.password);

};
