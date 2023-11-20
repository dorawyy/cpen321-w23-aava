// Version: 1.0
// Description: Class that represents a question.

class Question {
  constructor(question, correctAnswer, incorrectAnswers, difficulty) {
    /**
     * The string containing the full question.
     */
    this.question = question;

    /**
     * The string containing the correct answer.
     */
    this.correctAnswer = correctAnswer;

    /**
     * An array of strings containing incorrect answers.
     */
    this.incorrectAnswers = incorrectAnswers;

    /**
     * The difficulty of this question.
     *
     * Must match one of the strings found in
     * GameManager.possibleDifficulties
     */
    this.difficulty = difficulty;
  }
}

module.exports = Question;
