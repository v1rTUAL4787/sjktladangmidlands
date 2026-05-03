import { sendTemplateMessage } from "./client";

export async function notifyParentApproved(whatsappNumber: string, parentName: string) {
  return sendTemplateMessage({
    to: whatsappNumber,
    templateName: "parent_approved",
    languageCode: "en",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: parentName },
          { type: "text", text: process.env.NEXT_PUBLIC_SCHOOL_URL! },
        ],
      },
    ],
  });
}

export async function notifyAppointmentConfirmed(
  whatsappNumber: string,
  teacherName: string,
  date: string,
  time: string
) {
  return sendTemplateMessage({
    to: whatsappNumber,
    templateName: "appt_confirmed",
    languageCode: "en",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: teacherName },
          { type: "text", text: date },
          { type: "text", text: time },
        ],
      },
    ],
  });
}

export async function notifyAppointmentCancelled(
  whatsappNumber: string,
  date: string
) {
  return sendTemplateMessage({
    to: whatsappNumber,
    templateName: "appt_cancelled",
    languageCode: "en",
    components: [
      {
        type: "body",
        parameters: [{ type: "text", text: date }],
      },
    ],
  });
}

export async function notifyProgressUpdated(
  whatsappNumber: string,
  childName: string
) {
  return sendTemplateMessage({
    to: whatsappNumber,
    templateName: "progress_updated",
    languageCode: "en",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: childName },
          { type: "text", text: process.env.NEXT_PUBLIC_SCHOOL_URL! },
        ],
      },
    ],
  });
}
