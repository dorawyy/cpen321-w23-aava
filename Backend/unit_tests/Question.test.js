const Question = require("../models/Question");

describe("Question", () => {
  it("should be instantiated with correct initial values", () => {
    const question = new Question(
      "What is the capital of France?",
      "Paris",
      ["Berlin", "London", "Madrid"],
      "easy"
    );

    expect(question.question).toBe("What is the capital of France?");
    expect(question.correctAnswer).toBe("Paris");
    expect(question.incorrectAnswers).toEqual(["Berlin", "London", "Madrid"]);
    expect(question.difficulty).toBe("easy");
  });
});
