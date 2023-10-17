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

    // Purpose: Gets a Category to Category ID map
    // Parameters: None
    // Returns: None
    updateCategories() {
        this.possibleCategories = this.questionGenerator.getCategories();
    }

    createGameRoom(gameMaster) {
        // For actuall game
        let uuid = uuidv4().toString();

        let roomCode;
        do {
            roomCode = uuid.replace(/[-]/g, "").toUpperCase().substring(0, 6);
        } while (this.roomCodeToGameRoom.has(roomCode));
        console.log(roomCode);

        const room = new GameRoom(gameMaster, roomCode, new Settings());

        // For testing
        // const settings = new Settings(true, ["Science: Gadgets"], "hard", 2, 10, 7);
        // const room = new GameRoom(gameMaster, "test", settings);

        this.roomCodeToGameRoom.set(roomCode, room);
    }

    // Purpose: Makes a list of questions for the game room
    // Parameters: roomCode: the room code of the game room
    // Returns: 0 for success, 1 for room not found, 2 for no categories
    generateQuestions(roomCode) {
        // For actuall game
        const room = this.roomCodeToGameRoom.get(roomCode);
        
        if (room === undefined) {
            return 1;
        }
        const settings = room.roomSettings;

        //  array of questions
        let questions = [];

        // Get Values out of settings
        const categories = settings.questionCategories;
        const difficulty = settings.questionDifficulty;
        const toalQuestions = settings.totalQuestions;
        console.log(difficulty)
        if (categories.length === 0) {
            return 2;
        }
        // Generate an Array of evenly distributed number of Questions per category
        let numPerCat = this.questionGenerator.getNumArr(toalQuestions, categories.length);
        const apiQueries = categories.map(async (category, i) => {
            const response = await this.questionGenerator.getQuestions(true, category, difficulty, numPerCat[i]);
            return response;
        });

        Promise.all(apiQueries)
        .then(async responses => {
            // Adds all the questions to the array
            responses.forEach(elem => questions = questions.concat(elem.questions));
            console.log(questions.length)

            // if missing any questions, get random categories of same difficulty
            const neededQuestions = toalQuestions - questions.length;
            const response = await this.questionGenerator.getQuestions(false, "", difficulty, neededQuestions);
            questions = questions.concat(response.questions);
            console.log(questions.length)

            // Randomize the order of the questions and add to the room
            questions.sort(() => Math.random() - 0.5);
            room.gameQuestions = questions
        });

        return 0;  
    }

    // Purpose: gets a list of all the categories
    // Parameters: None
    // Returns: Array of strings of all the categories
    fetchCategories() {
        return this.possibleCategoires;
    }

  // Purpose: gets a list of all the difficulties
  // Parameters: None
  // Returns: Array of strings of all the difficulties
  fetchDifficulties() {
    return this.possibleDifficulties;
  }
}

module.exports = GameManager;
