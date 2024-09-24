class ProcessMessages {
  constructor(emailDB) {
    this.emailDB = emailDB;
  }

  async process(messages) {
    try {
      for (const message of messages) {
        if (message.bounce) {
          await this.handleBounce(message.bounce);
        } else if (message.complaint) {
          await this.handleComplaint(message.complaint);
        } else {
          throw new Error("Invalid failed message type.");
        }
      }
    } catch (e) {
      console.error(e);
      throw new Error("Something went processing the failed email.", {
        cause: e,
      });
    }
  }

  async handleBounce(bounce) {
    const failedReason = `bounce-${bounce.bounceType}`;

    for (const recipient of bounce.bouncedRecipients) {
      const emailAddress = recipient.emailAddress;
      await this.emailDB.addFailedEmail(emailAddress, failedReason);
    }
  }

  async handleComplaint(complaint) {
    const failedReason = "complaint";

    for (const recipient of complaint.complainedRecipients) {
      const emailAddress = recipient.emailAddress;
      await this.emailDB.addFailedEmail(emailAddress, failedReason);
    }
  }
}
module.exports = ProcessMessages;
