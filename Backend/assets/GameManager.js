const axios = require("axios");
const GameRoom = require("./GameRoom.js");
const Question = require("./Question.js");
const Settings = require("./Settings.js");

class GameManager {
  constructor() {
    this.roomCodeToGameRoom = new Map();
    this.possibleCategories = {};
    this.possibleDifficulties = ["easy", "medium", "hard"];
  }

  // Purpose: Calls API to get a list of all its categories and makes a map of the category name to its id, saves that as local variable
  // Parameters: None
  // Returns: None
  updateCategories() {
    axios
      .get("https://opentdb.com/api_category.php")
      .then((response) => {
        // API return list of {id, name} objects for each category
        const arr = response.data.trivia_categories;

        // Save each category in possibleCategories by mapping name to id
        arr.forEach((category) => {
          this.possibleCategories[category.name] = category.id;
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  generateQuestions(roomCode) {
    // For actuall game
    // const room = this.roomCodeToGameRoom.get(roomCode);
    // const settings = room.settings;

    // For testing
    const settings = new Settings(
      true,
      ["General Knowledge"],
      "easy",
      2,
      10,
      20
    );

    // Get Values out of settings
    const categories = settings.questionCategories;
    const numberCategories = categories.length;
    const difficulty = settings.questionDifficulty;
    const toalQuestions = settings.totalQuestions;

    // Array of evenly distributed number of Questions per category
    const baseQuantity = Math.floor(toalQuestions / numberCategories);
    const remainder = toalQuestions % numberCategories;
    let numofQuestion = Array(numberCategories - remainder)
      .fill(baseQuantity)
      .concat(Array(remainder).fill(baseQuantity + 1));
    numofQuestion.sort(() => Math.random() - 0.5);
    console.log(numofQuestion);

    categories.forEach((category, i) => {
      axios
        .get("https://opentdb.com/api.php", {
          amount: numofQuestion[i],
          category: this.possibleCategoires[category],
          difficulty: difficulty,
          type: "multiple",
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  // Purpose: gets a list of all the categories
  // Parameters: None
  // Returns: Array of strings of all the categories
  fetchCategories() {
    return Object.keys(this.possibleCategoires);
  }

  // Purpose: gets a list of all the difficulties
  // Parameters: None
  // Returns: Array of strings of all the difficulties
  fetchDifficulties() {
    return this.possibleDifficulties;
  }
}

module.exports = GameManager;
