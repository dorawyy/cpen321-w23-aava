const GameManager = require("../models/GameManager.js");
const QuestionGenerator = require("../models/QuestionGenerator.js");
const uuid = require("uuid").v4;
const PlayerAction = require("../models/PlayerAction.js");
const GameRoom = require("../models/GameRoom.js").GameRoom;

jest.mock("uuid");

afterEach(() => {
  jest.clearAllMocks();
});

describe("GameManager", () => {
    const gameManager = new GameManager();
    let room;
    it("constructor should set properties correctly", () => {
        expect(gameManager.roomCodeToGameRoom).toBeInstanceOf(Map);
        expect(gameManager.questionGenerator).toBeInstanceOf(QuestionGenerator);
        expect(gameManager.possibleCategories).toEqual([]);
        expect(gameManager.possibleDifficulties).toEqual([
          "easy",
          "medium",
          "hard",
        ]);
        expect(gameManager.possibleAnswerTimeSeconds).toEqual([10, 15, 20, 25, 30]);
        expect(gameManager.possibleNumberOfQuestions).toEqual([5, 10, 15, 20]);
        expect(gameManager.possibleMaxPlayers).toEqual([2, 3, 4, 5, 6]);
    });

    it("updateCategories should change possibleCategories", async () => {
        const spy = jest
          .spyOn(QuestionGenerator.prototype, "getCategories")
          .mockImplementation(async () => {
            return ["Science"];
          });

        gameManager.possibleCategories = ["PE", "time"];
        await gameManager.updateCategories();

        console.log(gameManager.possibleCategories);

        expect(gameManager.possibleCategories).not.toEqual(["PE", "time"]);
        expect(gameManager.possibleCategories).toEqual(["Science"]);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("createGameRoom should create a game room", () => {
        
        uuid.mockReturnValue("a1b2c3d4e5f6");
        room = gameManager.createGameRoom("user");

        expect(room.roomId).toEqual("a1b2c3d4e5f6");
        expect(room.roomCode).toEqual("A1B2C3");
    })
    
    it("fetchRoom should return the correct game room", () => {
        expect(gameManager.fetchRoom("A1B2C3")).toEqual(room);
    })

    it("fetchRoom should return undefuned when using bad code", () => {
        expect(gameManager.fetchRoom("65")).toEqual(undefined);
    })

    it("removeRoomById should remove the room", () => {
        gameManager.removeRoomById("a1b2c3d4e5f6");
        
        expect(gameManager.fetchRoomById("a1b2c3d4e5f6")).toEqual(undefined);
    })
    
    it("fetchRoomById should return undefuned when using bad code", () => {
        expect(gameManager.fetchRoomById("a1b2c36")).toEqual(undefined);
    })

    it("getAvailableRooms should return the correct rooms", () => {
        
        uuid.mockReturnValue("00000a")

        let room1 = gameManager.createGameRoom("user1");
        room1.roomSettings.roomIsPublic = true;
        room1.roomSettings.maxPlayers = 10;
        room1.roomState = 0;

        expect(gameManager.getAvailableRooms()).toEqual([room1]);
    })

    it("generateQuestions returns correct questions", async () => {
        uuid.mockReturnValue("A1B2C3")

        room = gameManager.createGameRoom("user1");
        room.roomSettings.totalQuestions = 2;
        room.roomSettings.questionCategories = ["Science", "History"];
        
        
        jest.spyOn(QuestionGenerator.prototype, "getNumArr").mockImplementation(() => {
            return [1, 1];
        });
        jest.spyOn(QuestionGenerator.prototype, "getQuestions").mockImplementation(() => {
            return {questions: ["Question 1"]};
        });

        let result = await gameManager.generateQuestions("A1B2C3");

        expect(result).toEqual(0);
        expect(room.gameQuestions).toEqual(["Question 1", "Question 1"]);
        
    })

    it("generateQuestions returns correct questions and requests random questions when we do not have enough questions", async () => {
        uuid.mockReturnValue("A1B2C4")

        room = gameManager.createGameRoom("user1");
        room.roomSettings.totalQuestions = 3;
        room.roomSettings.questionCategories = ["Science", "History"];
        
        
        jest.spyOn(QuestionGenerator.prototype, "getNumArr").mockImplementation(() => {
            return [1, 1];
        });
        let spy = jest.spyOn(QuestionGenerator.prototype, "getQuestions").mockImplementation(() => {
            return {questions: ["Question 1"]};
        });

        let result = await gameManager.generateQuestions("A1B2C4");

        expect(result).toEqual(0);
        expect(room.gameQuestions).toEqual(["Question 1", "Question 1", "Question 1"]);
        expect(spy).toHaveBeenCalledTimes(3); //Should be called twice for categories, and once for make up
        
    })

    it("generateQuestions called with badd room, error code 1", async () => {
        try {
            await gameManager.generateQuestions("BADROOM");
        }
        catch (e) {
            expect(e).toEqual(1);
        }
    })

    it("generateQuestions called with room with empty Questions Array, error code 2", async () => {
        try{
            uuid.mockReturnValue("A1B654")

            room = gameManager.createGameRoom("user1");
            room.roomSettings.questionCategories = [];
            
            await gameManager.generateQuestions("A1B654");
        }
        catch (e) {
            expect(e).toEqual(2);
        }
    })

    it("calculateScore No Powerups", () => {
        uuid.mockReturnValue("R1")

        room = gameManager.createGameRoom("user1");
        room.roomSettings.questionTime = 10;
        room.actionsArray.push(new PlayerAction("user1", 1000, true, -1, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, -1, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(90);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
    })

    it("calculateScore Double Points ", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, 0, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 0, ""));

        let result = gameManager.calculateScore("R1");
        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(180);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
    })

    it("calculateScore Fifty Fifty", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, 1, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 1, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(90);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
    })

    it("calculateScore Second Life", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, 4, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 4, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(90);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
    })

    it("calculateScore Free Lunch - Correct Answers", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, -1, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, true, 0, ""));
        room.actionsArray.push(new PlayerAction("user3", 3000, false, 3, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(90);
        expect(result.scores.get("user2")).toBe(160);
        expect(result.scores.get("user3")).toBe(90);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
    })

    it("calculateScore Free Lunch - Incorrect Answers", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, false, -1, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, -1, ""));
        room.actionsArray.push(new PlayerAction("user3", 3000, false, 3, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(0);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.scores.get("user3")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
    })

    it("calculateScore Free Lunch - All Players", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, false, 3, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, true, 3, ""));
        room.actionsArray.push(new PlayerAction("user3", 3000, false, 3, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(0);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.scores.get("user3")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
    })

    it("calculateScore user1 steals user2; both are correct", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, 2, "user2"));
        room.actionsArray.push(new PlayerAction("user2", 2000, true, -1, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(170);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(true);
    })

    it("calculateScore user1 steals user2; user1 is correct", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, 2, "user2"));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, -1, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(90);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(true);
    })

    it("calculateScore user1 steals user2; user2 is correct", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, false, 2, "user2"));
        room.actionsArray.push(new PlayerAction("user2", 2000, true, 0, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(160);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(true);
    })

    it("calculateScore user1 steals user2; both are incorrect", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, false, 2, "user2"));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 0, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(0);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(true);
    })

    it("calculateScore user1 & user2 steal from user3; user3 is correct", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, 2, "user3"));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 2, "user3"));
        room.actionsArray.push(new PlayerAction("user3", 3000, true, 0, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(160);
        expect(result.scores.get("user2")).toBe(70);
        expect(result.scores.get("user3")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
        expect(result.stolenPoints.get("user3")).toBe(true);
    })

    it("calculateScore user1 & user2 steal from user3; user3 is incorrect", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, 2, "user3"));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 2, "user3"));
        room.actionsArray.push(new PlayerAction("user3", 3000, false, 0, ""));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(90);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.scores.get("user3")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);
        expect(result.stolenPoints.get("user3")).toBe(true);
    })

    it("calculateScore user1 & user2 steal from user3; user3 steals from user1; user3 is correct", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, false, 2, "user3"));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 2, "user3"));
        room.actionsArray.push(new PlayerAction("user3", 3000, true, 2, "user1"));

        let result = gameManager.calculateScore("R1");

        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(35);
        expect(result.scores.get("user2")).toBe(35);
        expect(result.scores.get("user3")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(true);
        expect(result.stolenPoints.get("user2")).toBe(false);
        expect(result.stolenPoints.get("user3")).toBe(true);
    })

    it("calculateScore user sends time too larger", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 11000, true, 0, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 0, ""));

        let result = gameManager.calculateScore("R1");
        expect(result.returnCode).toEqual(0);
        expect(result.scores.get("user1")).toBe(0);
        expect(result.scores.get("user2")).toBe(0);
        expect(result.stolenPoints.get("user1")).toBe(false);
        expect(result.stolenPoints.get("user2")).toBe(false);   
    })

    it("calculateScore badd room code", () => {
        room.actionsArray = [];
        room.actionsArray.push(new PlayerAction("user1", 1000, true, 0, ""));
        room.actionsArray.push(new PlayerAction("user2", 2000, false, 0, ""));

        let result = gameManager.calculateScore("R2");
        expect(result.returnCode).toEqual(1);
    })

    it("updateRoomState should update the room state", () => {
        room = gameManager.fetchRoom("A1B2C3");
        const currState = room.roomState;

        let result = gameManager.updateRoomState("A1B2C3");
        expect(room.roomState).not.toEqual(currState);
        expect(room.roomState).toEqual(result);
    })

    it("updateRoomState with bad code should return undefined", () => {

        let result = gameManager.updateRoomState("BAD");
        expect(result).toBeUndefined();
        
    })

    it("fetchNextQuestion should return the next question", () => {
        room = gameManager.fetchRoom("A1B2C3");
        room.gameQuestions = ["Question 1", "Question 2"];

        let result = gameManager.fetchNextQuestion("A1B2C3");
        expect(result).toEqual("Question 1");
        expect(room.gameQuestions).not.toContain("Question 1");
    })

    it("fetchNextQuestion when empty array should return undefined", () => {
        room = gameManager.fetchRoom("A1B2C3");
        room.gameQuestions = [];

        let result = gameManager.fetchNextQuestion("A1B2C3");
        expect(result).toBeUndefined();
    })

    it("fetchQuestionsQuantity gets the current quantity of questions left", () => {
        room = gameManager.fetchRoom("A1B2C3");
        room.gameQuestions = ["Question 1", "Question 2"];

        let result = gameManager.fetchQuestionsQuantity("A1B2C3");
        expect(result).toEqual(room.gameQuestions.length);
    })

    it("addResponseToRoom should add a player action to the room", () => {
        room = gameManager.fetchRoom("A1B2C3");
        room.actionsArray = [];

        pAction = new PlayerAction("user1", 1000, true, 0, "");
        gameManager.addResponseToRoom("A1B2C3", pAction);

        expect(room.actionsArray).toContain(pAction);
    })

    it("resetResponses should make array empty", () => {
        room = gameManager.fetchRoom("A1B2C3");
        room.actionsArray = ["BOB"];

        gameManager.resetResponses("A1B2C3");

        expect(room.actionsArray).toEqual([]);
    })

    it("updateScores returns the new Totals", () => {
        const spy = jest
          .spyOn(GameRoom.prototype, "updateScores")
          .mockImplementation(() => {
           return [90,80,8];
          });

        let result  = gameManager.addToPlayerScore("A1B2C3", []);
        expect(result).toEqual([90,80,8]);
        expect(spy).toHaveBeenCalledTimes(1);
    })

    it("isACategory should return true", () => {
        expect(gameManager.isACategory("Science")).toEqual(true);
    })

    it("isACategory should return false", () => {
        expect(gameManager.isACategory("Art")).toEqual(false);
    })

    it("isADifficulty should return true", () => {
        expect(gameManager.isADifficulty("easy")).toEqual(true);
    })

    it("isADifficulty should return false", () => {
        expect(gameManager.isADifficulty("extreeme")).toEqual(false);
    })

    it("isAnAnswerTime should return true", () => {
        expect(gameManager.isAnAnswerTime(10)).toEqual(true);
    })

    it("isAnAnswerTime should return false", () => {
        expect(gameManager.isAnAnswerTime(11)).toEqual(false);
    })

    it("isANumberOfQuestions should return true", () => {
        expect(gameManager.isANumberOfQuestions(5)).toEqual(true);
    })

    it("isANumberOfQuestions should return false", () => {
        expect(gameManager.isANumberOfQuestions(6)).toEqual(false);
    })

    it("isAMaxPlayers should return true", () => {
        expect(gameManager.isAMaxPlayers(2)).toEqual(true);
    })

    it("isAMaxPlayers should return false", () => {
        expect(gameManager.isAMaxPlayers(7)).toEqual(false);
    })
}); 
