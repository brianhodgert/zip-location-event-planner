class EmailService {
  constructor(ses, source, configurationSetName) {
    this.SES = ses;
    this.source = source;
    this.configurationSetName = configurationSetName;
  }

  setTemplateName(templateName) {
    this.templateName = templateName;
  }

  async sendEmail(destinationList, templateData) {
    var params = {};
    var desination = {
      BccAddresses: destinationList,
    };

    params.Source = this.source;
    params.Destination = desination;
    params.Template = this.templateName;
    params.TemplateData = JSON.stringify(templateData);
    params.ConfigurationSetName = this.configurationSetName;

    try {
      await this.SES.sendTemplatedEmail(params);
    } catch (e) {
      console.log(e);
      throw new Error("Something went wrong sending the email template.");
    }
  }
}
module.exports = EmailService;
