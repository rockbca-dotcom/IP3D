import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Password reset endpoint — ADMIN ONLY, DISABLED IN PRODUCTION WITHOUT SMTP.
//
// Security model (two independent guards, applied in order):
//
//   Guard 1 — requireAdmin()
//     Any unauthenticated request receives 401 before reaching any logic.
//     This prevents account-lockout attacks: an anonymous actor who knows
//     an admin's email cannot overwrite their password via this endpoint.
//     Applied in ALL environments.
//
//   Guard 2 — production block
//     Even an authenticated admin cannot use this route in production until
//     email delivery is confirmed working. Without SMTP the new password is
//     generated, written to the DB, and then lost — locking the account.
//     Remove this guard (or replace with hasNotificationChannel()) once
//     SMTP_* env vars are configured and tested.
//
// SMTP env vars required before enabling in production:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM,
//   SALES_NOTIFICATION_EMAIL  (or WEB3FORMS_ACCESS_KEY for Web3Forms)
//
// Implementation path for full reset flow:
//   1. Configure SMTP_* env vars
//   2. Remove the NODE_ENV === "production" guard below
//   3. Uncomment the sendWeb3FormNotification() call
//   4. Test that the email is received before deploying
// ---------------------------------------------------------------------------

// Factory function — creates a new Response object per request.
// A NextResponse.json() object wraps a ReadableStream that can only be
// consumed once. Reusing a single module-level instance across concurrent
// requests would cause the second caller to receive an empty body.
function makeResetResponse() {
  return NextResponse.json({
    success: true,
    message:
      "Se o e-mail existir em nossa base, uma nova senha será enviada em breve.",
  });
}

export async function POST(request: NextRequest) {
  // Guard 1: active admin session required.
  // Returns 401 { error: "Não autorizado." } for any unauthenticated caller.
  // Placed first so that the production block is never reached by external actors.
  const deny = await requireAdmin();
  if (deny) return deny;

  // Guard 2: disabled in production until SMTP is configured.
  // An authenticated admin must not be able to lock accounts by overwriting
  // passwords that are never delivered. Remove this block once email delivery
  // is implemented and confirmed working in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "Redefinição de senha desabilitada. Configure o envio de e-mail (SMTP_*) antes de usar esta função.",
      },
      { status: 503 }
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Return the same response whether the email exists or not.
    // Prevents user enumeration even for authenticated admin callers.
    if (!user) {
      return makeResetResponse();
    }

    // Generate a cryptographically secure random password.
    // randomBytes(16) → 128 bits of entropy → base64url-encoded (22 chars).
    const newPassword = randomBytes(16).toString("base64url");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // TODO: Send newPassword to the user via email before returning.
    // Uncomment after configuring SMTP and removing the production block above.
    //
    //   await sendWeb3FormNotification({
    //     subject: "Sua nova senha",
    //     message: `Sua nova senha é: ${newPassword}\nAlter-a no primeiro acesso.`,
    //     customerEmail: email,
    //   });
    //
    // WARNING: Do NOT log newPassword. Do NOT include it in the JSON response.

    return makeResetResponse();
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Erro ao recuperar senha" },
      { status: 500 }
    );
  }
}
