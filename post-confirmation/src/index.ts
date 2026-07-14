import type { PostConfirmationTriggerHandler } from 'aws-lambda';

interface HenngeEmailRequest {
  to: string;
  subject: string;
  body: string;
}

// TODO: placeholder request/response contract — replace once HENNGE API docs are confirmed.
async function sendHenngeEmail(payload: HenngeEmailRequest): Promise<void> {
  const apiUrl = process.env.HENNGE_API_URL;
  const apiKey = process.env.HENNGE_API_KEY;
  if (!apiUrl || !apiKey) {
    throw new Error('HENNGE_API_URL and HENNGE_API_KEY must be set');
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HENNGE email send failed: ${res.status} ${await res.text()}`);
  }
}

export const handler: PostConfirmationTriggerHandler = async (event) => {
  // Only notify on password-change confirmation, not on sign-up confirmation.
  if (event.triggerSource === 'PostConfirmation_ConfirmForgotPassword') {
    const { email, name } = event.request.userAttributes;
    await sendHenngeEmail({
      to: email,
      subject: 'Your password was changed',
      body: `Hi ${name ?? ''}, your account password was just changed.`,
    });
  }

  return event;
};
