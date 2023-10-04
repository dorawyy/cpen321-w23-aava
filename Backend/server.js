const express = require('express');
const app = express();

const db = require('./Database/dbSetup.js');


app.use(express.json());
const server = app.listen(8081, () => {
    console.log('Server is running on port http://%s:%s', server.address().address, server.address().port);
    db.connect();
});