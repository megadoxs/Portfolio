"use server";

import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { getContact } from "@/entities/contact";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 2;
const WINDOW_MS = 60 * 60 * 1000;

function getRateLimitKey(ip: string): string {
    return `contact:${ip}`;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime?: number } {
    const key = getRateLimitKey(ip);
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (rateLimitMap.size > 10000) {
        for (const [k, v] of rateLimitMap.entries()) {
            if (now > v.resetTime) {
                rateLimitMap.delete(k);
            }
        }
    }

    if (!record || now > record.resetTime) {
        const resetTime = now + WINDOW_MS;
        rateLimitMap.set(key, { count: 1, resetTime });
        return { allowed: true, remaining: RATE_LIMIT - 1, resetTime };
    }

    if (record.count >= RATE_LIMIT) {
        return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { allowed: true, remaining: RATE_LIMIT - record.count, resetTime: record.resetTime };
}

async function getClientIP(): Promise<string> {
    const headersList = await headers();

    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    const realIP = headersList.get("x-real-ip");
    if (realIP) {
        return realIP;
    }

    return "unknown";
}

export type ContactFormState = {
    success?: boolean;
    error?: string;
};

export async function sendContactEmail(
    formData: FormData
): Promise<ContactFormState> {
    const ip = await getClientIP();
    const { allowed } = checkRateLimit(ip);

    if (!allowed) {
        return { success: false, error: "RATE_LIMIT_EXCEEDED" };
    }

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    if (!name || !email || !message) {
        return { success: false, error: "MISSING_FIELDS" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, error: "INVALID_EMAIL" };
    }

    const contact = await getContact();
    if (!contact?.email) {
        return { success: false, error: "RECIPIENT_NOT_CONFIGURED" };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.verify();

    await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Portfolio Contact Form"}" <${process.env.SMTP_USER}>`,
        to: contact.email,
        replyTo: email,
        subject: `Portfolio Contact: Message from ${name}`,
        text: `
Name: ${name}
Email: ${email}

Message:
${message}
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #ededed;
            background: #0a0a0a;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 650px;
            margin: 0 auto;
            position: relative;
        }
        .glow-wrapper {
            position: relative;
        }
        .glow-wrapper::before {
            content: '';
            position: absolute;
            top: -20px;
            left: -20px;
            right: -20px;
            bottom: -20px;
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #4facfe);
            opacity: 0.2;
            border-radius: 24px;
            filter: blur(40px);
            z-index: -1;
        }
        .glass-card {
            background: rgba(16, 17, 19, 0.85);
            backdrop-filter: saturate(180%) blur(20px);
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 32px;
            text-align: center;
            position: relative;
        }
        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
        }
        .header h2 {
            margin: 0 0 12px 0;
            color: #ededed;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 32px;
        }
        .field-row {
            display: table;
            width: 100%;
            margin-bottom: 24px;
            border-collapse: separate;
            border-spacing: 12px 0;
        }
        .field-cell {
            display: table-cell;
            width: 50%;
        }
        .field {
            margin-bottom: 24px;
        }
        .label {
            font-weight: 600;
            color: #a5b4fc;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
            display: block;
        }
        .value {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 14px 16px;
            border-radius: 8px;
            border-left: 3px solid #667eea;
            color: #ededed;
            font-size: 15px;
        }
        .value a {
            color: #93c5fd;
            text-decoration: none;
        }
        .message-value {
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.7;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            color: #94a3b8;
            font-size: 13px;
        }
        .footer p {
            margin: 8px 0;
        }
        .badge {
            display: inline-block;
            padding: 6px 14px;
            background: rgba(102, 126, 234, 0.12);
            border: 1px solid rgba(102, 126, 234, 0.25);
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            color: #a5b4fc;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="glow-wrapper">
            <div class="glass-card">
                <div class="header">
                    <h2>✉️ New Contact Form Submission</h2>
                    <div class="badge">Portfolio Contact</div>
                </div>
                <div class="content">
                    <div class="field-row">
                        <div class="field-cell">
                            <div class="label">From</div>
                            <div class="value">${name}</div>
                        </div>
                        <div class="field-cell">
                            <div class="label">Email Address</div>
                            <div class="value"><a href="mailto:${email}">${email}</a></div>
                        </div>
                    </div>
                    <div class="field">
                        <div class="label">Message</div>
                        <div class="value message-value">${message.replace(/\n/g, "<br>")}</div>
                    </div>
                    <div class="footer">
                        <p>💬 This message was sent via your portfolio contact form</p>
                        <p>Click reply to respond directly to <strong>${name}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
        `.trim(),
    });

    return { success: true };
}