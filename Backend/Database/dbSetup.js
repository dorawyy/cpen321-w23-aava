const { MongoClient } = require('mongodb');
const uri = "mongodb://0.0.0.0:27017";
const client = new MongoClient(uri);

async function connect () {
    try {
        await client.connect();
        console.log("Successfully connected to the database");
        return true;  
    }
    catch (err) {
        console.log(err);
        await client.close();
        return false;
    }
}

module.exports = { connect };