const axios = require("axios");
const Question = require("./Question.js");

class QuestionGenerator {
  constructor() {
    this.possibleCategories = {};
  }

  // Purpose: Calls API to get a list of all its categories and makes a map of the category name to its id, saves that as local variable
  // Parameters: None
  // Returns: the map of category name to id
  getCategories = async () => {
    let return_arr = [];

    try {
      const response = await axios.get("https://opentdb.com/api_category.php");
      const res_arr = response.data.trivia_categories;

      // Save each category in possibleCategories by mapping name to id
      res_arr.forEach((category) => {
        this.possibleCategories[category.name] = category.id;
      });

      return_arr = Object.keys(this.possibleCategories);
    } catch (err) {
      console.log(err);
    }

    return return_arr;
  };

  getQuestionQuantity = async (category, difficulty) => {
    // Parameter Object
    let count = -1;
    const parameters = {
      params: {
        category: this.possibleCategories[category],
      },
    };

    // API CALL
    try {
      const response = await axios.get(
        "https://opentdb.com/api_count.php",
        parameters
      );
      count =
        response.data.category_question_count[
          `total_${difficulty}_question_count`
        ];
    } catch (err) {
      console.log(err);
    }

    return count;
  };

  // Purpose: Gets a list of questions from the API
  // Parameters: category: the category of the questions
  //             difficulty: the difficulty of the questions
  //             quantity: the number of questions to be generated
  // Returns: Object with
  //              an array of Question objects
  //             a response code (0 for success, 1 refresh Token)
  getQuestions = async (category, difficulty, quantity) => {
    let questions = [];
    let res_code = -1;

    // Parameter Object
    let parameters = {
      params: {
        amount: quantity,
        category: this.possibleCategories[category],
        difficulty: difficulty,
        type: "multiple",
      },
    };

    try {
      // Get Make API Call
      const response = await axios.get(
        "https://opentdb.com/api.php",
        parameters
      );

      // Parse the response
      const response_code = response.data.response_code;
      const result = response.data.results;

      // If Success, add each question to the array of questions
      if (response_code == ApiCode.SUCCESS) {
        result.forEach((elem) => {
          const questionObj = new Question(
            elem.question,
            elem.correct_answer,
            elem.incorrect_answers,
            elem.difficulty
          );
          questions.push(questionObj);
        });
        res_code = 0;
      }
      // If Questions quantity too big, find actual quantity and call again
      else if (response_code == ApiCode.NO_RESULTS) {
        const new_quantity = await this.getQuestionQuantity(
          category,
          difficulty
        );
        const response = await this.getQuestions(
          category,
          difficulty,
          new_quantity
        );
        questions = response.questions;
        res_code = response.res_code;
      } else if (response_code == ApiCode.INVALID_PARAMETER) {
        res_code = 0;
      } else if (
        response_code == ApiCode.TOKEN_NOT_FOUND ||
        response_code == ApiCode.TOKEN_EMPTY
      ) {
        res_code = 1;
      }
    } catch (err) {
      console.log(err);
    }

    return { questions, res_code };
  };

  // Purpose: Generates an array of evenly distributed number of Questions per category
  // Parameters: totalQuestions: the total number of questions to be generated
  //             numberCategories: the number of categories to be used
  // Returns: an array of the number of questions per category
  getNumArr = (toalQuestions, numberCategories) => {
    // Calculates the mimimum number of questions per category
    const baseQuantity = Math.floor(toalQuestions / numberCategories);

    // Calculates the number of categories that will have an extra question
    const remainder = toalQuestions % numberCategories;

    // Make an array of the number of questions per category (extra Qs distributed evenly)
    let numofQuestion = Array(numberCategories - remainder)
      .fill(baseQuantity)
      .concat(Array(remainder).fill(baseQuantity + 1));

    // Randomize the order and return the array
    numofQuestion.sort(() => Math.random() - 0.5);
    return numofQuestion;
  };
}

/**
 *  Enum class for tracking the different response codes returned by the trivia question API.
 *  For more details, see the API documentation here: https://opentdb.com/api_config.php
 *
 */
class ApiCode {
  /** Returned results successfully. */
  static SUCCESS = 0;

  /**
   * Could not return results due to lack of
   * questions for the specific query.
   */
  static NO_RESULTS = 1;

  /** Invalid parameters were passed in to the query */
  static INVALID_PARAMETER = 2;

  /** The session token does not exist. */
  static TOKEN_NOT_FOUND = 3;

  /**
   * The session token has returned all possible questions
   * for the query.
   */
  static TOKEN_EMPTY = 4;
}

module.exports = QuestionGenerator;
