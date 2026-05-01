import PDFDocument from 'pdfkit';

// Devuelve el albaran en un buffer pdf, asi el controller decide
// si lo manda por la respuesta o lo sube a la nube.
export const buildDeliveryNotePdf = (note) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const user = note.user || {};
    const client = note.client || {};
    const project = note.project || {};

    doc.fontSize(16).text('Albaran ' + note._id);
    doc.moveDown();

    doc.fontSize(11);
    doc.text('Fecha: ' + new Date(note.workDate).toISOString().slice(0, 10));
    doc.text('Tipo: ' + note.format);
    doc.text('Usuario: ' + (user.email || ''));
    doc.text('Cliente: ' + (client.name || '') + ' (' + (client.cif || '') + ')');
    doc.text('Proyecto: ' + (project.name || '') + ' - ' + (project.projectCode || ''));
    doc.moveDown();

    if (note.format === 'material') {
      doc.text('Material: ' + note.material + ' x' + note.quantity + ' ' + (note.unit || ''));
    } else {
      doc.text('Horas: ' + (note.hours || 0));
      (note.workers || []).forEach((w) => {
        doc.text('- ' + w.name + ': ' + w.hours + 'h');
      });
    }

    if (note.description) doc.text('Notas: ' + note.description);
    if (note.signed) doc.text('Firmado: ' + note.signedAt);

    doc.end();
  });
