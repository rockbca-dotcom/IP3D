import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const WEB3FORMS_ENDPOINT = process.env.WEB3FORMS_ENDPOINT || "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = env.WEB3FORMS_ACCESS_KEY;

const SMTP_HOST = env.SMTP_HOST;
const SMTP_PORT = env.SMTP_PORT;
const SMTP_USER = env.SMTP_USER;
const SMTP_PASS = env.SMTP_PASS;
const SMTP_FROM = env.SMTP_FROM;
const SALES_NOTIFICATION_EMAIL = env.SALES_NOTIFICATION_EMAIL;

interface NotificationPayload {
  subject: string;
  message: string;
  customerName?: string;
  customerEmail?: string;
  to?: string;
}

function hasSmtpConfig() {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);
}

async function sendSmtpNotification(payload: NotificationPayload) {
  if (!hasSmtpConfig()) {
    return false;
  }

  const recipient = payload.to || SALES_NOTIFICATION_EMAIL;
  if (!recipient) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: recipient,
      replyTo: payload.customerEmail || undefined,
      subject: payload.subject,
      text: payload.message,
    });

    return true;
  } catch (error) {
    console.error("Error sending SMTP notification:", error);
    return false;
  }
}

async function sendWeb3FormsNotification(payload: NotificationPayload) {
  if (!WEB3FORMS_ACCESS_KEY) {
    return false;
  }

  const recipientEmail = payload.to || payload.customerEmail || "no-reply@ip3d.com.br";

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        from_name: payload.customerName || "IP3D",
        subject: payload.subject,
        email: recipientEmail,
        message: payload.message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Web3Forms response error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Web3Forms notification:", error);
    return false;
  }
}

export async function sendWeb3FormNotification(payload: NotificationPayload) {
  const sentViaSmtp = await sendSmtpNotification(payload);
  if (sentViaSmtp) {
    return;
  }

  const sentViaWeb3Forms = await sendWeb3FormsNotification(payload);
  if (!sentViaWeb3Forms) {
    console.warn(
      "Notification skipped: configure SMTP_* + SALES_NOTIFICATION_EMAIL or WEB3FORMS_ACCESS_KEY to receive purchase e-mails."
    );
  }
}
