// Version: 1.0
// Description: Class that represents a question.

class Question {
    constructor(question, correctAnswer, incorrectAnswers, difficulty) {
        this.question = question;
        this.correctAnswer = correctAnswer;
        this.incorrectAnswers = incorrectAnswers;
        this.difficulty = difficulty;
    }
}

export default Question;