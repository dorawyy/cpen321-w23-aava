// Version: 1.0
// Description: Class that represents a room's settings. This class is used to store the settings of a room. 

class Settings {
    constructor(isPublic, questionCategories, questionDifficulties, maxPlayers, questionTime, numberQuestions) {
        this.roomIsPublic = isPublic
        this.questionCategories = questionCategories
        this.questionDifficulties = questionDifficulties
        this.maxPlayers = maxPlayers
        this.questionTime = questionTime
        this.numberQuestions = numberQuestions
    }

    
}

export default Settings;