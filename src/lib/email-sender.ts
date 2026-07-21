// =============================================================================
// ZÉLLA — Email Sender Helper
// =============================================================================
// Sends HTML emails via nodemailer using SMTP credentials from env vars.
// Graceful degradation: if SMTP is not configured, logs the email to console
// and returns true (dev mode).
// =============================================================================

import nodemailer from 'nodemailer';

// ── SMTP Configuration ─────────────────────────────────────────────────────────

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'zella@seuzella.com';

/**
 * Check if SMTP credentials are properly configured.
 */
function isSmtpConfigured(): boolean {
  return SMTP_USER.length > 0 && SMTP_PASS.length > 0;
}

// ── Transport Singleton ────────────────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for port 465, false for others
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return _transporter;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Send an HTML email.
 *
 * @param to      - Recipient email address
 * @param subject - Email subject line
 * @param html    - HTML body content
 * @returns true if the email was sent (or logged in dev mode), false on error
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  // ── Dev mode: no SMTP configured ──────────────────────────────────────────
  if (!isSmtpConfigured()) {
    console.log('─────────────────────────────────────────────────────────');
    console.log(`[EmailSender] DEV MODE — SMTP not configured`);
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  From:    ${EMAIL_FROM}`);
    console.log(`  HTML length: ${html.length} chars`);
    console.log('  (Email content logged instead of sent)');
    console.log('─────────────────────────────────────────────────────────');
    return true;
  }

  // ── Production: send via SMTP ─────────────────────────────────────────────
  try {
    const transporter = getTransporter();

    const result = await transporter.sendMail({
      from: `"Zélla — Seu zelador digital" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(
      `[EmailSender] Email sent to ${to} — messageId: ${result.messageId}`
    );
    return true;
  } catch (error) {
    console.error(`[EmailSender] Failed to send email to ${to}:`, error);
    return false;
  }
}
