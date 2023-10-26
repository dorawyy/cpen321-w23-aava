const axios = require("axios");
const Question = require("./Question.js");

class QuestionGenerator {
  constructor() {
    this.possibleCategories = {};
  }

  /**
   * Purpose: Makes an API call to get all current categories and saves them
   *          as a Map from Category Name to Category ID in a local variable
   * @param   None
   * @returns {[String]} A list of all the possible categories
   *                     Empty list if the API call fails
   */
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

  /**
   * Purpose: Makes API call to get the number of questions in a category for a given difficulty
   * @param   {String} [category]: The question category we are querying
   * @param   {String} [difficulty]: The question difficulty we are querying 
   * @returns {Number} The number of questions in the category for the given difficulty
   *                   -1 if the API call fails 
   */
  getQuestionQuantity = async (category, difficulty) => {
    let count = -1;
    
    // Parameters for API Call
    const parameters = {
      params: {
        category: this.possibleCategories[category],
      },
    };

    // Make API call and save the count
    try {
      const response = await axios.get("https://opentdb.com/api_count.php",parameters );
      count = response.data.category_question_count[`total_${difficulty}_question_count`];
    } catch (err) {
      console.log(err);
    }

    return count;
  };

  /**
   * Purpose: Gets a list of Questions From the API
   * @param {Boolean} [doSpecificCategory]: Determine if questions should be from a specific category 
   * @param {String} [doLimitMCQ]: Determine if questions should be multiple choice 
   * @param {String} [category]: The category of the questions (if doSpecificCategory is true) 
   * @param {String} [difficulty]: The difficulty of the questions 
   * @param {Number} [quantity]: The number of questions to be generated 
   * @returns {Object} An object with
   *                   Response code: (0 for success, 1 refresh Token)
   *                   Question Array: an array of Question objects
   */
  getQuestions = async (doSpecificCategory, doLimitMCQ, category, difficulty, quantity) => {
    
    // Variables to be retuned
    let questions = [];
    let res_code = -1;

    // Parameters that should always be included in API call
    let parameters = {
      params: {
        amount: quantity,
        difficulty: difficulty,
      }
    };

    // Adds parameters limited by boolean arguments
    if (doSpecificCategory) parameters.params.category = this.possibleCategories[category];
    if (doLimitMCQ) parameters.params.type = ApiCode.QUESTION_TYPE_MULTIPLE;

    // API Call attempt
    try {
      
      // Make API Call and parse the response
      const response = await axios.get("https://opentdb.com/api.php",parameters);
      const response_code = response.data.response_code;
      const result = response.data.results;

      // If successfull, add each question to the array of questions
      if (response_code == ApiCode.SUCCESS) {
        result.forEach(elem => {
          if (elem.type == ApiCode.QUESTION_TYPE_MULTIPLE){
            const questionObj = new Question( 
              elem.question, 
              elem.correct_answer, 
              elem.incorrect_answers, 
              elem.difficulty
            );
            questions.push(questionObj);
          }
        });
        res_code = 0;
      }
      else if (response_code == ApiCode.NO_RESULTS) {
        // If Questions quantity too big, find actual quantity and call again 
        // (but do not limit by type as quantity returned includes T/F and MCQ)
        const new_quantity = await this.getQuestionQuantity(category, difficulty);
        const response = await this.getQuestions(
          doSpecificCategory,
          false, 
          category, 
          difficulty, 
          new_quantity
        );
        questions = response.questions;
        res_code = response.res_code;
      } else if (response_code == ApiCode.INVALID_PARAMETER) {
        // If we used invalid paramters, just return empty array
        res_code = 0;
      } else if ( response_code == ApiCode.TOKEN_NOT_FOUND || response_code == ApiCode.TOKEN_EMPTY) {
        res_code = 1;
      }
    } catch (err) {
      console.log(err);
    }

    return { questions, res_code };
  };

  /** 
   * Purpose: Generates an array of evenly distributed number of Questions per category
   * @param   {Number} [totalQuestions]: The total number of questions to be generated
   * @param   {Number} [numberCategories]: The number of categories to be used
   * @returns {[Number]} An array of the number of questions per category
  */
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
 *  Class for tracking the different consatnts used by the trivia question  API 
 *  This includes response codes returned by the API and parameters use the make queries.
 *  For more details, see the API documentation here: https://opentdb.com/api_config.php
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

  static QUESTION_TYPE_MULTIPLE = "multiple";
}

module.exports = QuestionGenerator;
