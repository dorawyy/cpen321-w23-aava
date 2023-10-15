// Version: 1.0
// Description: Class that represents a room's settings. This class is used to store the settings of a room. 

class Settings {
    constructor(isPublic, categories, difficulty, maxPlayers, time, total) {
        this.roomIsPublic = isPublic;
        this.questionCategories = categories;
        this.questionDifficulty = difficulty;
        this.maxPlayers = maxPlayers;
        this.questionTime = time;
        this.totalQuestions = total;
    }

    
}

module.exports = Settings;