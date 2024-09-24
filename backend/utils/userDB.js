const { isEmptyObject } = require("./objectUtils");

class UserDB {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async userExistsOrCreateUser(email, hashedPassword) {
    const emailKey = { PK: email, SK: email };
    const existingUser = await this.dbService.getItem(emailKey);
    if (existingUser && !isEmptyObject(existingUser)) {
      this.updateFailedAttemptsCount(0);
      return existingUser;
    } else {
      await this.createUser(email, hashedPassword);
      return false;
    }
  }

  async completeSetup(email) {
    const key = { PK: `${email}`, SK: `${email}` };
    const expression = "SET #isSetupComplete = :isSetupComplete";
    const names = {
      "#isSetupComplete": "isSetupComplete",
    };
    const values = {
      ":isSetupComplete": true,
    };

    await this.dbService.updateItem(expression, key, names, values);
  }

  async updateFailedAttemptsCount(email, count) {
    if (!count) {
      count = 0;
    }
    const key = { PK: `${email}`, SK: `${email}` };
    const expression = "SET #failedAttempts = :failedAttempts";
    const names = {
      "#failedAttempts": "failedAttempts",
    };
    const values = {
      ":failedAttempts": count,
    };

    await this.dbService.updateItem(expression, key, names, values);
  }

  async createUser(email, hashedPassword) {
    const data = {
      PK: `${email}`,
      SK: `${email}`,
      isSetupComplete: false,
      failedAttempts: 0,
      hashedPassword: hashedPassword,
      isSetupComplete: false,
    };

    await this.dbService.putItem(data);
    return { ID: data.SK };
  }

  async updatePassword(email, hashedPassword) {
    const key = { PK: `${email}`, SK: `${email}` };
    const expression = "SET #hashedPassword = :hashedPassword";
    const names = {
      "#hashedPassword": "hashedPassword",
    };
    const values = {
      ":hashedPassword": hashedPassword,
    };

    await this.dbService.updateItem(expression, key, names, values);
  }
}
module.exports = UserDB;
