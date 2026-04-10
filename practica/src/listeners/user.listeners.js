import ee from '../utils/eventBus.js';

// Listeners de eventos de usuario.
// En un proyecto real aqui se enviarian emails reales con un SMTP.
// De momento hacemos console.log para poder verlo durante la practica.

ee.on('user:registered', ({ userId, email, code }) => {
  console.log(`[evt] user:registered -> ${email} (id: ${userId})`);
  console.log(`      codigo de verificacion: ${code}`);
});

ee.on('user:verified', ({ userId, email }) => {
  console.log(`[evt] user:verified   -> ${email} (id: ${userId})`);
});

ee.on('user:invited', ({ email, tempPassword, invitedBy }) => {
  console.log(`[evt] user:invited    -> ${email} por ${invitedBy}`);
  console.log(`      password temporal: ${tempPassword}`);
});

ee.on('user:deleted', ({ userId, soft }) => {
  console.log(
    `[evt] user:deleted    -> ${userId} (${soft ? 'soft' : 'hard'})`,
  );
});
