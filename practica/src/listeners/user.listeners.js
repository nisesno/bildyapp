import ee from '../utils/eventBus.js';
import {
  sendVerificationEmail,
  sendInviteEmail,
} from '../services/mail.service.js';

// Listeners de eventos de usuario.
// Mando los mails reales con nodemailer; en local sin SMTP el transport
// es jsonTransport y simplemente lo loguea por consola.

ee.on('user:registered', async ({ userId, email, code }) => {
  console.log(`[evt] user:registered -> ${email} (id: ${userId})`);
  try {
    await sendVerificationEmail(email, code);
  } catch (err) {
    console.error('[mail] no se pudo enviar verificacion:', err.message);
  }
});

ee.on('user:verified', ({ userId, email }) => {
  console.log(`[evt] user:verified   -> ${email} (id: ${userId})`);
});

ee.on('user:invited', async ({ email, tempPassword, invitedBy }) => {
  console.log(`[evt] user:invited    -> ${email} por ${invitedBy}`);
  try {
    await sendInviteEmail(email, tempPassword);
  } catch (err) {
    console.error('[mail] no se pudo enviar invitacion:', err.message);
  }
});

ee.on('user:deleted', ({ userId, soft }) => {
  console.log(
    `[evt] user:deleted    -> ${userId} (${soft ? 'soft' : 'hard'})`,
  );
});
