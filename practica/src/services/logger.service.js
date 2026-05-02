import { IncomingWebhook } from '@slack/webhook';

const webhook = process.env.SLACK_WEBHOOK
  ? new IncomingWebhook(process.env.SLACK_WEBHOOK)
  : null;

export const notifyError = async ({ method, path, status, message }) => {
  if (!webhook) return;
  try {
    await webhook.send({
      text: `Error ${status} en ${method} ${path}: ${message}`,
    });
  } catch (err) {
    console.error('[slack]', err.message);
  }
};
