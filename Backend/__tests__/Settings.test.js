const Settings = require("../models/Settings");

describe("Settings", () => {
  it("should be instantiated with correct initial values", () => {
    const settings = new Settings();

    expect(settings.roomIsPublic).toBe(false);
    expect(settings.questionCategories).toEqual(["General Knowledge"]);
    expect(settings.questionDifficulty).toBe("easy");
    expect(settings.maxPlayers).toBe(6);
    expect(settings.questionTime).toBe(20);
    expect(settings.totalQuestions).toBe(10);
  });

  it("updateIsPublic should update the isPublic setting", () => {
    const settings = new Settings();
    const newIsPublic = true;

    settings.updateIsPublic(newIsPublic);
    expect(settings.roomIsPublic).toBe(newIsPublic);
  });

  it("addCategory should add a category to the list of categories", () => {
    const settings = new Settings();
    const initialCategories = [...settings.questionCategories];
    const newCategory = "Science";

    settings.addCategory(newCategory);
    expect(settings.questionCategories).toEqual([
      ...initialCategories,
      newCategory,
    ]);
  });

  it("removeCategory should remove a category from the list of categories", () => {
    const initialCategories = ["General Knowledge", "Science", "History"];
    const settings = new Settings(
      false,
      initialCategories,
      "medium",
      4,
      15,
      15
    );
    const categoryToRemove = "Science";

    settings.removeCategory(categoryToRemove);
    expect(settings.questionCategories).toEqual([
      "General Knowledge",
      "History",
    ]);
  });

  it("updateDifficulty should update the difficulty setting", () => {
    const settings = new Settings();
    const newDifficulty = "medium";

    settings.updateDifficulty(newDifficulty);
    expect(settings.questionDifficulty).toBe(newDifficulty);
  });

  it("updateMaxPlayers should update the maxPlayers setting", () => {
    const settings = new Settings();
    const newMaxPlayers = 4;

    settings.updateMaxPlayers(newMaxPlayers);
    expect(settings.maxPlayers).toBe(newMaxPlayers);
  });

  it("updateTime should update the questionTime setting", () => {
    const settings = new Settings();
    const newTime = 15;

    settings.updateTime(newTime);
    expect(settings.questionTime).toBe(newTime);
  });

  it("updateTotal should update the totalQuestions setting", () => {
    const settings = new Settings();
    const newTotal = 15;

    settings.updateTotal(newTotal);
    expect(settings.totalQuestions).toBe(newTotal);
  });
});
