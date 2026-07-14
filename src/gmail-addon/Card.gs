/**
 * Optional: split card builders here for readability.
 */

function buildReportPhishingButton_() {
  return CardService.newTextButton()
    .setText('Report phishing')
    .setOpenLink(CardService.newOpenLink().setUrl('https://support.google.com/mail/answer/8251'));
}
