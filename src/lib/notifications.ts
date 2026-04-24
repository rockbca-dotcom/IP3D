const WEB3FORMS_ENDPOINT = process.env.WEB3FORMS_ENDPOINT || "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER;
const SALES_NOTIFICATION_EMAIL =
  process.env.SALES_NOTIFICATION_EMAIL || process.env.NOTIFICATION_EMAIL || process.env.SMTP_TO;

interface NotificationPayload {
  subject: string;
  message: string;
  customerName?: string;
  customerEmail?: string;
}

function hasSmtpConfig() {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM && SALES_NOTIFICATION_EMAIL);
}

async function sendSmtpNotification(payload: NotificationPayload) {
  if (!hasSmtpConfig()) {
    return false;
  }

  try {
    const nodemailer = require("nodemailer");
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
      to: SALES_NOTIFICATION_EMAIL,
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
        email: payload.customerEmail || "no-reply@ip3d.com.br",
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
