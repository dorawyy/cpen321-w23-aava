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


    generateQuestions(roomCode){
        // For actuall game
        // const room = this.roomCodeToGameRoom.get(roomCode);
        // const settings = room.settings;

        // For testing
        const settings = new Settings(true, ["Science: Gadgets"], "hard", 2, 10, 7);

        // Get Values out of settings
        const categories = settings.questionCategories;
        const numberCategories = categories.length;
        const difficulty = settings.questionDifficulty;
        const toalQuestions = settings.totalQuestions;
        
        // Generate an Array of evenly distributed number of Questions per category
        let numofQuestion = this.questionGenerator.getNumArr(toalQuestions, numberCategories);

        //  array of questions
        let questions = [];
        
        this.questionGenerator.getQuestions(categories[0], difficulty, numofQuestion[0])

        // categories.forEach( async (category, i) => {
           
        // })

        // Condition to check if questions generated is equal to total questions
        // TODO: Add Token Use
        // if (questions.length != toalQuestions){
        //     const needed = toalQuestions - questions.length;
        //     (async () => {
        //         const response = await axios.get('https://opentdb.com/api.php', {
        //             params: {
        //                 amount: needed,
        //                 category: this.possibleCategoires["General Knowledge"],
        //                 difficulty: difficulty,
        //                 type: "multiple"
        //             }
        //         });
        //         if (response_code == 0){
        //             result.forEach(elem => {
        //                 const questionObj = new Question(elem.question, elem.correct_answer, elem.incorrect_answers, elem.difficulty);
        //                 questions.push(questionObj);
        //             })
        //         }
        //         else if (response_code == 3 || response_code == 4){
        //             // TO DO ADD INVLAID TOKEN SCENRIO 
        //         }

                
        //     })
        // }

        


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