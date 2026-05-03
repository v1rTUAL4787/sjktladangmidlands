const BASE_URL = "https://graph.facebook.com/v21.0";

interface TextMessage {
  to: string;
  text: string;
}

interface TemplateMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components?: object[];
}

async function sendRequest(body: object) {
  const res = await fetch(
    `${BASE_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  return res.json();
}

export async function sendTemplateMessage({
  to,
  templateName,
  languageCode,
  components,
}: TemplateMessage) {
  return sendRequest({
    messaging_product: "whatsapp",
    to: normaliseNumber(to),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}

export async function sendTextMessage({ to, text }: TextMessage) {
  return sendRequest({
    messaging_product: "whatsapp",
    to: normaliseNumber(to),
    type: "text",
    text: { body: text },
  });
}

function normaliseNumber(number: string): string {
  return number.replace(/[\s\-()]/g, "").replace(/^0/, "60");
}
