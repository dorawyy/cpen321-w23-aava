const axios = require('axios');

class GameManager {
    constructor() {
        this.roomCodeToGameRoom = new Map();
        this.possibleCategoires = {};
        this.possibleDifficulties = ["easy", "medium", "hard"];
    }

    updateCategories() {
        // make api call to https://opentdb.com/api_category.php using axios
        // update this.possibleCategories

        axios.get("https://opentdb.com/api_category.php")
        .then(response => {
            response.data.trivia_categories.forEach(category => {
                this.possibleCategoires[category.name] = category.id;
            });
        })
        .catch(error => {
            console.log(error);
        });
    }
}

module.exports = GameManager;