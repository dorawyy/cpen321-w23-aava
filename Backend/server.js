const express = require('express');
const app = express();
const db = require('./database/dbSetup.js');
const GameManager = require('./assets/GameManager.js');

let gameManager = new GameManager();


app.use(express.json());
const server = app.listen(8081, async () => {
    console.log('Server is running on port http://%s:%s', server.address().address, server.address().port);
    
    if (await db.connect()){
        gameManager.updateCategories();
    };
});

// for testing
app.get('/hello', (req, res) => {
    gameManager.generateQuestions();
    res.send('Hello World!');
});

/*
Mon -> have template (model) classes defined
Fri -> have all classes done (implement functions)
    -> define endpoints for frontend to call
Sat/Sun -> have interactions/functions ready for integration

Tues (24) -> deadline for getting backend ready for integration

*/