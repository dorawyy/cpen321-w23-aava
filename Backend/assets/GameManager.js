const axios = require('axios');
const GameRoom = require('./GameRoom.js');
const Question = require('./Question.js');
const Settings = require('./Settings.js');
const QuestionGenerator = require('./QuestionGenerator.js');

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


    generateQuestions(roomCode) {
        // For actuall game
        // const room = this.roomCodeToGameRoom.get(roomCode);
        // const settings = room.settings;

        // const settings = new Settings(true, ["Science: Gadgets"], "hard", 2, 10, 7);

        //  array of questions
        let questions = [];

        // Get Values out of settings
        const categories = settings.questionCategories;
        const difficulty = settings.questionDifficulty;
        const toalQuestions = settings.totalQuestions;
        
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
