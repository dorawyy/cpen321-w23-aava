const GameManager = require('../models/GameManager.js');
const QuestionGenerator = require('../models/QuestionGenerator.js')

jest.mock("uuid", () => ({ v4: () => "randCode" }));

jest.spyOn(QuestionGenerator.prototype, 'getCategories')
    .mockImplementation(() => {
        return ["Science"]
    })

// jest.SpyOn(questionGenerator, 'getNumArr').mockImplementation( (n1, n2) => {
//     return [n1]
// })

// jest.SpyOn(questionGenerator, 'getQuestions').mockImplementation( (_, _, _, _, quantity) => {
//     return Array(quantity).fill(0);
// })

describe('GameManager', () => {
    
    const gameManager = new GameManager();
    
    it("constructor should set properties correctly", () => {
        expect(gameManager.roomCodeToGameRoom).toBeInstanceOf(Map);
        expect(gameManager.questionGenerator).toBeInstanceOf(QuestionGenerator)
        expect(gameManager.possibleCategories).toEqual([]);
        expect(gameManager.possibleDifficulties).toEqual(["easy", "medium", "hard"]);
        expect(gameManager.possibleAnswerTimeSeconds).toEqual([10, 15, 20, 25, 30]);
        expect(gameManager.possibleNumberOfQuestions).toEqual([5, 10, 15, 20]);
        expect(gameManager.possibleMaxPlayers).toEqual([2, 3, 4, 5, 6])
    });

    it("updateCategories should change possibleCategories", () => {
        
        
        gameManager.possibleCategories = ["PE", "time"];
        gameManager.updateCategories();

        expect(gameManager.possibleCategories).not.toEqual(["PE", "time"]);
        expect(gameManager.possibleCategories).toEqual(["Science"]);
        expect(questionGenerator.getCategories).toHaveBeenCalledTimes(1);
    })

})