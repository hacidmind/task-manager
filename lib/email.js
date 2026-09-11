export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendLoginCode(email, code) {
  if (!emailConfigured()) throw new Error("Email delivery is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Your Momentum sign-in code",
      text: `Your Momentum sign-in code is ${code}.\n\nThis code expires in 10 minutes and can be used only once. If you did not request it, you can ignore this email. Never share your sign-in code.`,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Email provider rejected delivery");
}
