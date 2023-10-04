const { MongoClient } = require('mongodb');
const uri = "mongodb://0.0.0.0:27017";
const client = new MongoClient(uri);

async function connect () {
    try {
        await client.connect();
        console.log("Successfully connected to the database");  
    }
    catch (err) {
        console.log(err);
        await client.close();
    }
}

module.exports = { connect };