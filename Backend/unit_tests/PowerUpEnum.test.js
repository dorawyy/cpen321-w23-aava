const PowerupEnum = require("../models/PowerUpEnum");

describe("PowerupEnum", () => {
  it("should have the correct index values for powerups", () => {
    expect(PowerupEnum.DOUBLE_POINTS).toBe(0);
    expect(PowerupEnum.FIFTY_FIFTY).toBe(1);
    expect(PowerupEnum.STEAL_POINTS).toBe(2);
    expect(PowerupEnum.FREE_LUNCH).toBe(3);
    expect(PowerupEnum.SECOND_LIFE).toBe(4);
  });

  it("should not have duplicate index values", () => {
    const indexValues = [
      PowerupEnum.DOUBLE_POINTS,
      PowerupEnum.FIFTY_FIFTY,
      PowerupEnum.STEAL_POINTS,
      PowerupEnum.FREE_LUNCH,
      PowerupEnum.SECOND_LIFE,
    ];

    const uniqueValues = new Set(indexValues);
    expect(uniqueValues.size).toBe(indexValues.length);
  });

  it("should not have negative index values", () => {
    const indexValues = [
      PowerupEnum.DOUBLE_POINTS,
      PowerupEnum.FIFTY_FIFTY,
      PowerupEnum.STEAL_POINTS,
      PowerupEnum.FREE_LUNCH,
      PowerupEnum.SECOND_LIFE,
    ];

    const hasNegativeValues = indexValues.some((value) => value < 0);
    expect(hasNegativeValues).toBe(false);
  });
});
