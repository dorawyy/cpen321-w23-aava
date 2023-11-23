const Question = require("../models/Question.js");
const QuestionGenerator = require("../models/QuestionGenerator.js");
const axios = require("axios");

jest.mock("axios");


describe("QuestionGenerator", () => {
    const questionGenerator = new QuestionGenerator();

    // Test case for the constructor
    it("constructor should set properties correctly", () => {
        expect(questionGenerator.possibleCategories).toEqual({});
    });

    it("getCategories should return a list of categories", async () => {
        questionGenerator.possibleCategories = {};
        const mockedResults = {data : {trivia_categories :[{"id":9,"name":"General Knowledge"}, {"id":10,"name":"Entertainment: Books"}]}};
        axios.get.mockResolvedValue(mockedResults);

        const categories = await questionGenerator.getCategories();
        expect(categories).toEqual(["General Knowledge", "Entertainment: Books"]);
        expect(questionGenerator.possibleCategories).toEqual({"General Knowledge":9, "Entertainment: Books":10});
    });

    it("getCategories API request fails and error is thrown", async () => {
        questionGenerator.possibleCategories = {};
        axios.get.mockRejectedValue(new Error("Error"));

        const categories = await questionGenerator.getCategories();
        expect(categories).toEqual([]);
        expect(questionGenerator.possibleCategories).toEqual({});
    });

    it("getQuestionQuantity should return the number of questions in a category/difficulty", async () => {
        questionGenerator.possibleCategories = {"General Knowledge" : 9};

        const mockedResults = {data : {"category_id":9,"category_question_count":{"total_question_count":305,"total_easy_question_count":122,"total_medium_question_count":123,"total_hard_question_count":60}}};
        axios.get.mockResolvedValue(mockedResults);

        const quantity = await questionGenerator.getQuestionQuantity("General Knowledge", "easy");
        expect(quantity).toEqual(122);
    })

    it("getQuestionQuantity API request fails and error is thrown", async () => {
        questionGenerator.possibleCategories = {"General Knowledge" : 9};
        axios.get.mockRejectedValue(new Error("Error"));

        const quantity = await questionGenerator.getQuestionQuantity("General Knowledge", "easy");
        expect(quantity).toEqual(-1);
    })

    it("getNumArr should return an array of numbers with 20 questions, 3 categories", () => {
        // 20 total questions, 3 categories should be an array with two 7s one 6
        
        const numArr = questionGenerator.getNumArr(20,3);
        expect(numArr.length).toBe(3);
        expect(numArr).toEqual(expect.arrayContaining([7, 7, 6]));
    })

    it("getNumArr should return an array of numbers with 50 questions, 5 categories", () => {
        // 20 total questions, 3 categories should be an array with five 10s
        
        const numArr = questionGenerator.getNumArr(50,5);
        expect(numArr.length).toBe(5);
        expect(numArr).toEqual(expect.arrayContaining([10, 10, 10, 10, 10]));
    })

    it("getQuestions tested with specific category returns expected questions", async () => {
        questionGenerator.possibleCategories = {"General Knowledge" : 9};
        let expectedQuestionArr = []
        expectedQuestionArr.push(new Question("What airline was the owner of the plane that crashed off the coast of Nova Scotia in 1998?", "Swiss Air", ["Air France", "British Airways", "TWA"], "easy"));
        expectedQuestionArr.push(new Question("What do the letters of the fast food chain KFC stand for?", "Kentucky Fried Chicken", ["Kentucky Fresh Cheese", "Kibbled Freaky Cow", "Kiwi Food Cut"], "easy"));

        const mockedResults = {data : {"response_code":0,"results":[{"type":"multiple","difficulty":"easy","category":"General Knowledge","question":"What airline was the owner of the plane that crashed off the coast of Nova Scotia in 1998?","correct_answer":"Swiss Air","incorrect_answers":["Air France","British Airways","TWA"]},{"type":"multiple","difficulty":"easy","category":"General Knowledge","question":"What do the letters of the fast food chain KFC stand for?","correct_answer":"Kentucky Fried Chicken","incorrect_answers":["Kentucky Fresh Cheese","Kibbled Freaky Cow","Kiwi Food Cut"]}]}};
        axios.get.mockResolvedValue(mockedResults);

        const response = await questionGenerator.getQuestions(true, true, "General Knowledge", "easy", 2);
        expect(response.res_code).toBe(0);
        expect(response.questions).toEqual(expectedQuestionArr);
    });

    // Uses specific category/difficulty and looks for 5 questions
    //  - Not enough questions in that category (only 3: 2 T/F and 1 MCQ)
    //  - should return array of only 1 question (the MCQ)
    it("getQuestions tested with specific category but not enough of that question exist", async () => {
        questionGenerator.possibleCategories = {"General Knowledge" : 9};
        let expectedQuestionArr = []
        expectedQuestionArr.push(new Question("When was the Tamagotchi digital pet released?", "1996", ["1989", "1992", "1990"], "easy"));

        const mockedResults1 = {data : {"response_code":1,"results":[]}}
        const mockedResults2 = {data : {"category_id":30,"category_question_count":{"total_question_count":24,"total_easy_question_count":3,"total_medium_question_count":10,"total_hard_question_count":5}}}
        const mockedResults3 = {data : {"response_code":0,"results":[{"type":"boolean","difficulty":"easy","category":"Science: Gadgets","question":"Microphones can be used not only to pick up sound, but also to project sound similar to a speaker.","correct_answer":"True","incorrect_answers":["False"]},{"type":"multiple","difficulty":"easy","category":"Science: Gadgets","question":"When was the Tamagotchi digital pet released?","correct_answer":"1996","incorrect_answers":["1989","1992","1990"]},{"type":"boolean","difficulty":"easy","category":"Science: Gadgets","question":"The communication protocol NFC stands for Near-Field Control.","correct_answer":"False","incorrect_answers":["True"]}]}}
        axios.get
            .mockResolvedValueOnce(mockedResults1)
            .mockResolvedValueOnce(mockedResults2)
            .mockResolvedValueOnce(mockedResults3);

        const response = await questionGenerator.getQuestions(true, true, "General Knowledge", "easy", 5);
        expect(response.res_code).toBe(0);
        expect(response.questions).toEqual(expectedQuestionArr);
    });

    it("getQuestions tested with no category", async () => {
        questionGenerator.possibleCategories = {"General Knowledge" : 9};
        let expectedQuestionArr = []
        expectedQuestionArr.push(new Question("What is the name of the Jewish New Year?", "Rosh Hashanah", ["Elul", "New Year", "Succoss"], "easy"));
        
        const mockedResult = {data : {"response_code":0,"results":[{"type":"multiple","difficulty":"easy","category":"General Knowledge","question":"What is the name of the Jewish New Year?","correct_answer":"Rosh Hashanah","incorrect_answers":["Elul","New Year","Succoss"]}]}}
        axios.get.mockResolvedValue(mockedResult);

        const response = await questionGenerator.getQuestions(false, true, "General Knowledge", "easy", 1);
        expect(response.res_code).toBe(0);
        expect(response.questions).toEqual(expectedQuestionArr);
    })

    it("getQuestions tested with invalid parameters", async () => {
        questionGenerator.possibleCategories = {"General Knowledge" : 9};
        mockedResult = {data: {"response_code":2,"results":[]}}
        axios.get.mockResolvedValue(mockedResult)

        const response = await questionGenerator.getQuestions(false, true, "General Knowledge", "x", 26);
        expect(response.res_code).toBe(0);
        expect(response.questions).toEqual([]);
    })

    it("getQuestions API usage resulted in different result code", async () => {
        questionGenerator.possibleCategories = {"General Knowledge" : 9};
        const mockedResult = {data: {"response_code": 3,"results":[]}}
        axios.get.mockResolvedValue(mockedResult)

        const response = await questionGenerator.getQuestions(false, true, "General Knowledge", "easy", 1);
        expect(response.res_code).toBe(1);
        expect(response.questions).toEqual([]);
    })


    it("getQuestions API request fails and error is thrown", async () => {
        questionGenerator.possibleCategories = {"General Knowledge" : 9};
        axios.get.mockRejectedValue(new Error("Error"));

        const response = await questionGenerator.getQuestions(false, true, "General Knowledge", "easy", 1);
        expect(response.res_code).toBe(-1);
        expect(response.questions).toEqual([]);
    })
});