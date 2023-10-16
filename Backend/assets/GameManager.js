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

        // For testing
        const settings = new Settings(true, ["Science: Gadgets", "General Knowledge"], "hard", 2, 10, 4);

        //  array of questions
        let questions = [];

        // Get Values out of settings
        const categories = settings.questionCategories;
        const difficulty = settings.questionDifficulty;
        const toalQuestions = settings.totalQuestions;
        
        // Generate an Array of evenly distributed number of Questions per category
        let numPerCat = this.questionGenerator.getNumArr(toalQuestions, categories.length);
        
        categories.forEach( async (category, i) => {
           const response = await this.questionGenerator.getQuestions(category, difficulty, numPerCat[i]);
           questions = await questions.concat(response.questions);
           
           
        //    Basically i need this to run AFTER all the API calls have been made. but it is not happening
           if (i == categories.length - 1) {
               console.log(questions.length);
           }
        })
        

        


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
