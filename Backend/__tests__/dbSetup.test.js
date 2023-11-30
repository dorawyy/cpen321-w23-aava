const { MongoClient } = require("mongodb");
const { connect } = require("../Database/dbSetup");

// Mock the MongoClient and its methods
jest.mock("mongodb");

describe("Database functions", () => {
  let clientMock;

  beforeEach(() => {
    clientMock = {
      connect: jest.fn(),
      close: jest.fn(),
      db: jest.fn(() => ({
        collection: jest.fn(),
      })),
    };

    // Mock the MongoClient constructor
    MongoClient.mockReturnValue(clientMock);
  });

  afterEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks();
  });

  it("should connect successfully", async () => {
    MongoClient.connect.mockResolvedValueOnce();
    const connectSpy = jest.spyOn(MongoClient.prototype, "connect");
    const closeSpy = jest.spyOn(MongoClient.prototype, "close");

    const result = await connect();

    expect(result).toBe(true);
    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it("should handle connection error", async () => {
    const connectSpy = jest.spyOn(MongoClient.prototype, "connect");
    connectSpy.mockRejectedValueOnce(new Error("Connection failed"));

    const closeSpy = jest.spyOn(MongoClient.prototype, "close");

    const result = await connect();

    expect(result).toBe(false);
    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
