/**
 * ShieldAI — Gmail add-on (Google Apps Script). Deploy with clasp.
 */

function onGmailMessage(e) {
  var accessor = e.gmail;
  var messageId = accessor.messageId;
  var accessToken = accessor.accessToken;

  GmailApp.setCurrentMessageAccessToken(accessToken);
  var message = GmailApp.getMessageById(messageId);

  var from = message.getFrom();
  var subject = message.getSubject();
  var body = message.getPlainBody();
  var htmlBody = message.getBody();

  var linkRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
  var links = [];
  var match;
  while ((match = linkRegex.exec(htmlBody)) !== null) {
    links.push(match[1]);
  }

  var analysis = analyzeEmailAppsScript(from, subject, body, links);
  return buildCard(analysis, from, subject, links);
}

function analyzeEmailAppsScript(from, subject, body, links) {
  var text = (subject + '\n' + body).toLowerCase();
  var score = 0;
  if (/urgent|immediately|act now|verify your account|password|ssn|gift card/i.test(text)) {
    score += 35;
  }
  if (/irs|paypal|microsoft|amazon|apple|google/i.test(text) && /http/i.test(text)) {
    score += 20;
  }
  if (links.length > 5) score += 10;
  score = Math.min(100, score);

  return {
    score: score,
    spf: 'unknown',
    dkim: 'unknown',
    tactics: score > 40 ? ['pattern-heuristic'] : [],
  };
}

function buildCard(analysis, from, subject, links) {
  var scoreColor = analysis.score >= 70 ? '#ef4444' : analysis.score >= 40 ? '#f59e0b' : '#22c55e';

  var header = CardService.newCardHeader()
    .setTitle('🛡️ ShieldAI')
    .setSubtitle('Threat Score: ' + analysis.score + '/100')
    .setImageStyle(CardService.ImageStyle.CIRCLE);

  var threatSection = CardService.newCardSection()
    .setHeader('Analysis Results')
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b>From:</b> ' +
          from +
          '<br><b>SPF:</b> ' +
          analysis.spf +
          ' | <b>DKIM:</b> ' +
          analysis.dkim +
          '<br><b>Tactics:</b> ' +
          (analysis.tactics.join(', ') || 'None detected'),
      ),
    );

  var linksSection = CardService.newCardSection().setHeader('Links (' + links.length + ')');
  for (var i = 0; i < Math.min(links.length, 5); i++) {
    var link = links[i];
    linksSection.addWidget(
      CardService.newTextParagraph().setText(
        '• ' + (link.length > 60 ? link.substring(0, 60) + '…' : link),
      ),
    );
  }

  var actionsSection = CardService.newCardSection().addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('Report Phishing')
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setOpenLink(
            CardService.newOpenLink().setUrl('https://support.google.com/mail/answer/8251'),
          ),
      )
      .addButton(
        CardService.newTextButton()
          .setText('Trust Sender')
          .setOnClickAction(CardService.newAction().setFunctionName('trustSender')),
      ),
  );

  var card = CardService.newCardBuilder()
    .setHeader(header)
    .addSection(threatSection)
    .addSection(linksSection)
    .addSection(actionsSection)
    .build();

  return CardService.newUniversalActionResponseBuilder().displayAddOnCards([card]).build();
}

function trustSender() {
  return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText('Marked trusted locally (extend to store).')).build();
}

function reportPhishing() {
  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl('https://support.google.com/mail/answer/8251'))
    .build();
}
