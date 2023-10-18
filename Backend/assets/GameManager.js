const GameRoom = require('./GameRoom.js');
const Settings = require('./Settings.js');
const QuestionGenerator = require('./QuestionGenerator.js');
const { v4: uuidv4 } = require('uuid');

class GameManager {
    constructor() {
        this.roomCodeToGameRoom = new Map();
        this.possibleCategories = [];
        this.possibleDifficulties = ["easy", "medium", "hard"];
        this.questionGenerator = new QuestionGenerator();
    }

    /**
     * Purpose: Gets a list of the current categories available
     * @param None
     * @return None
     */
    updateCategories() {
        this.possibleCategories = this.questionGenerator.getCategories();
    }

    /**
     * Purpose: Creates a new game room with a unique identifer (6 character HEX)
     * @param {Player} [gameMaster]: Player object of the user who created a room
     * @return {GameRoom} The game room that was created
     */
    createGameRoom(gameMaster) {
        // Generate a unique code
        let uuid = uuidv4().toString();

        // Filters the code down to 6 characters and makes sure it is unique
        let roomCode;
        do {
            roomCode = uuid.replace(/[-]/g, "").toUpperCase().substring(0, 6);
        } while (this.roomCodeToGameRoom.has(roomCode));
        console.log(roomCode);

        // Create the room and add it to the map
        const room = new GameRoom(gameMaster, roomCode, new Settings());
        this.roomCodeToGameRoom.set(roomCode, room);

        return room;
    }

    /**
     * Purpose: Gets a list of questions for the game room based on its settings
     * @param {String} [roomCode]: the room code of the game room
     * @return {Number} 0 for success, 1 for room not found, 2 for no categories selected 
     */
    generateQuestions(roomCode) {
        //  Array of questions to be saved in the room
        let questions = [];

        //  Gets the rooom using code, if code invalid return error code 1
        const room = this.roomCodeToGameRoom.get(roomCode);
        if (room === undefined) return 1;
        
        //  Gets the relevant settings from the room for question generation: 
        //      list of categories, difficulty, and number of questions
        // If no categories selected, return error code 2
        const settings = room.roomSettings;
        const categories = settings.questionCategories;
        const difficulty = settings.questionDifficulty;
        const toalQuestions = settings.totalQuestions;
        if (categories.length === 0) return 2;

        // Gets the number of questions per category
        let numPerCat = this.questionGenerator.getNumArr(toalQuestions, categories.length);
        
        // Creates a query array of requests to the question generator for each category
        const apiQueries = categories.map(async (category, i) => {
            const response = await this.questionGenerator.getQuestions(true, true, category, difficulty, numPerCat[i]);
            return response;
        });

        // Make the queries and save the responses
        Promise.all(apiQueries)
        .then(async responses => {
            // Add questions from each response to the questions array
            responses.forEach(elem => questions = questions.concat(elem.questions));
            console.log(questions.length)
            
            // If missing any questions, get random categories of same difficulty
            const neededQuestions = toalQuestions - questions.length;
            if (neededQuestions > 0) {
                const response = await this.questionGenerator.getQuestions(false, true, "", difficulty, neededQuestions);
                questions = questions.concat(response.questions);
                console.log(questions.length)
            }

            // Randomize the order of the questions and add to the room
            questions.sort(() => Math.random() - 0.5);
            room.gameQuestions = questions
        });

        return 0;  
    }

    /**
     * Purpose: Fetches the game room with the given room code
     * @param {String} [roomCode]: the room code of the game room
     * @return {GameRoom} The game room that was fetched
     */
    fetchRoom(roomCode) {
        return this.roomCodeToGameRoom.get(roomCode);
    }

}

module.exports = GameManager;
