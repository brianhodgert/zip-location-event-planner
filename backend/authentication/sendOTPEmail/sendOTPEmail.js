class SendOTPEmail {
  constructor(emailDB, emailService) {
    this.emailDB = emailDB;
    this.emailService = emailService;
  }

  async process(otpRequests) {
    try {
      for (const otpRequest of otpRequests) {
        if (await this.emailDB.verifyEmailAddress(otpRequest.email)) {
          await this.sendEmail(otpRequest);
        }
      }
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong sending a confirmation email.");
    }
  }

  async sendEmail(otpRequest) {
    const toAddress = [];
    toAddress.push(otpRequest.email);
    if (otpRequest.otp) {
      this.emailService.setTemplateName(process.env.OTP_TEMPLATE_NAME);
    } else {
      this.emailService.setTemplateName(
        process.env.TEMP_PASSWAORD_TEMPLATE_NAME
      );
    }

    await this.emailService.sendEmail(toAddress, otpRequest);
  }
}
module.exports = SendOTPEmail;
