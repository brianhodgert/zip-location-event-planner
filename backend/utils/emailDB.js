class EmailDB {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async addFailedEmail(emailAddress, failedReason) {
    if (!emailAddress) {
      throw new Error("Invalid input");
    }

    try {
      const recordToInsert = this.getEmailRecord(emailAddress, failedReason);
      await this.dbService.putItem(recordToInsert);
    } catch (e) {
      throw new Error("Something went wrong sending adding the failed email.", {
        cause: e,
      });
    }
  }

  getEmailRecord(emailAddress, failedReason) {
    let recordToInsert = {};
    recordToInsert.PK = emailAddress;
    recordToInsert.SK = emailAddress;
    recordToInsert.failedReason = failedReason;

    return recordToInsert;
  }

  async verifyEmailAddress(emailAddress) {
    try {
      const { expression, names, values } =
        this.getVerifyEmailCondition(emailAddress);

      const response = await this.dbService.queryItem(
        expression,
        names,
        values
      );

      if (response?.[0]?.failedReason) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong verifying the email address.", {
        cause: e,
      });
    }
  }
  getVerifyEmailCondition(emailAddress) {
    return {
      expression: "#pk = :emailAddress AND #sk = :emailAddress ",
      names: {
        "#pk": "PK",
        "#sk": "SK",
      },
      values: {
        ":emailAddress": emailAddress,
      },
    };
  }
}
module.exports = EmailDB;
