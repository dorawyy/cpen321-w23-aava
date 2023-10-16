const { MongoClient } = require("mongodb");
const uri = "mongodb://0.0.0.0:27017";
const databaseName = "CPEN_321_DATABASE";

const client = new MongoClient(uri);
const database = client.db(databaseName);

/**
 * Attempts to connect to the database.
 * Returns true if successful, otherwise returns false.
 */
async function connect() {
  try {
    await client.connect();
    console.log("Successfully connected to the database");
    return true;
  } catch (err) {
    console.log(err);
    await client.close();
    return false;
  }
}

/**
 * Returns the users collection from the database.
 */
function getUsersCollection() {
  return database.collection("users");
}

module.exports = { connect, getUsersCollection };
