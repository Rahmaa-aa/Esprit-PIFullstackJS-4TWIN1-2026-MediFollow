/** pdfkit est CommonJS : évite `default is not a constructor` avec Nest/ts. */
import PDFDocument = require('pdfkit');

type PdfDoc = InstanceType<typeof PDFDocument>;

/** MediFollow : turquoise (proche du modèle « bleu clinique » du gabarit). */
const DS = {
  pad: 40,
  teal: '#089bab',
  tealDeep: '#067a82',
  tealLight: '#4dc8d0',
  white: '#ffffff',
  text: '#212529',
  textSecondary: '#343a40',
  muted: '#6c757d',
  footerBg: '#067a82',
} as const;

const HEADER_BOTTOM = 128;
const FOOTER_H = 56;
/** Espace réservé en bas de page (pied de page + signature). */
const BOTTOM_RESERVE = FOOTER_H + 100;

/**
 * PDFKit polices standard = WinAnsi ; normaliser pour éviter les erreurs sur caractères hors plage.
 */
export function textForPrescriptionPdf(input: unknown): string {
  const raw = String(input ?? '')
    .replace(/\u2014|\u2013/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00b5|\u03bc/gi, 'u')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '');
  let out = '';
  for (const ch of raw) {
    const c = ch.charCodeAt(0);
    if (c === 10 || c === 13) out += ch;
    else if (c >= 32 && c <= 126) out += ch;
    else out += ' ';
  }
  return out.replace(/\s+/g, ' ').trim();
}

export type PrescriptionLineInput = {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
};

export type BuildPrescriptionPdfParams = {
  patientFirstName: string;
  patientLastName: string;
  patientDob?: string;
  patientAge?: string;
  patientAddressLine?: string;
  /** Ville patiente (pied de page « localisation »). */
  patientCity?: string;
  doctorDisplayName: string;
  doctorSpecialty?: string;
  doctorDepartment?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  /** Photo de profil du médecin (PNG/JPEG) pour le cercle d’en-tête */
  doctorAvatarBuffer?: Buffer | null;
  /** Libellé site / URL courte pour le pied de page */
  clinicWeb?: string;
  issuedDateYmd: string;
  lines: PrescriptionLineInput[];
};

function innerWidth(doc: PdfDoc): number {
  return doc.page.width - 2 * DS.pad;
}

function drawDottedLine(doc: PdfDoc, x1: number, y: number, x2: number, color: string = DS.teal): void {
  doc.save();
  doc.dash(1.2, { space: 3 });
  doc.strokeColor(color).lineWidth(0.6).moveTo(x1, y).lineTo(x2, y).stroke();
  doc.restore();
}

/** En-tête pleine largeur : fond teal, vague, accent clair, cercle (photo médecin), textes, logo. */
function drawWaveHeader(
  doc: PdfDoc,
  p: {
    drName: string;
    spec: string;
    dept: string;
    clinicTagline: string;
    doctorAvatarBuffer: Buffer | null;
  },
): void {
  const w = doc.page.width;
  doc.save();

  doc.fillColor(DS.tealDeep).moveTo(0, 0).lineTo(w, 0).lineTo(w, 86).lineTo(0, HEADER_BOTTOM - 18).lineTo(0, 0).fill();

  doc
    .fillColor(DS.teal)
    .moveTo(0, 0)
    .lineTo(w, 0)
    .lineTo(w, 78)
    .bezierCurveTo(w * 0.72, 112, w * 0.42, 68, 0, 92)
    .lineTo(0, 0)
    .fill();

  doc
    .fillColor(DS.tealLight)
    .opacity(0.38)
    .moveTo(w * 0.52, 0)
    .lineTo(w, 0)
    .lineTo(w, 70)
    .bezierCurveTo(w * 0.82, 98, w * 0.62, 36, w * 0.52, 0)
    .fill();
  doc.restore();

  const cx = 62;
  const cy = 58;
  const r = 36;
  if (p.doctorAvatarBuffer && p.doctorAvatarBuffer.length > 0) {
    try {
      doc.save();
      doc.circle(cx, cy, r).clip();
      doc.image(p.doctorAvatarBuffer, cx - r, cy - r, {
        width: 2 * r,
        height: 2 * r,
        cover: [2 * r, 2 * r],
      });
      doc.restore();
    } catch {
      /* image invalide : cercle vide */
    }
  }
  doc.circle(cx, cy, r).lineWidth(2.5).strokeColor(DS.white).stroke();

  const tx = 118;
  let ty = 28;
  doc.font('Helvetica-Bold').fontSize(13).fillColor(DS.white).opacity(1).text(p.drName.toUpperCase(), tx, ty, {
    width: w - tx - 150,
  });
  ty = doc.y + 2;
  doc.font('Helvetica').fontSize(9).fillColor(DS.white).opacity(0.92).text(p.spec || 'Suivi medical numerique', tx, ty, {
    width: w - tx - 150,
  });
  ty = doc.y + 6;
  const clinicTitle = p.dept ? p.dept.toUpperCase() : 'CABINET / SERVICE';
  doc.font('Helvetica-Bold').fontSize(10).text(clinicTitle, tx, ty, { width: w - tx - 150 });
  ty = doc.y + 2;
  doc.font('Helvetica').fontSize(8).opacity(0.88).text(p.clinicTagline, tx, ty, { width: w - tx - 150, lineGap: 2 });

  doc.font('Helvetica-Bold').fontSize(17).fillColor(DS.white).opacity(1).text('MediFollow', w - DS.pad - 130, 38, {
    width: 130,
    align: 'right',
  });
}

function drawPatientFormBlock(
  doc: PdfDoc,
  p: {
    patientName: string;
    age: string;
    dateStr: string;
    address: string;
  },
): number {
  const w = doc.page.width;
  const x = DS.pad;
  let y = HEADER_BOTTOM + 18;
  const x2 = w - DS.pad;
  const mid = x + innerWidth(doc) * 0.5;
  const rowGap = 20;
  const baseline = 8;

  doc.font('Helvetica-Bold').fontSize(9).fillColor(DS.teal).text('Nom du patient', x, y);
  doc.font('Helvetica').fontSize(10).fillColor(DS.text);
  const nx = x + 92;
  doc.text(p.patientName, nx, y, { lineBreak: false });
  const nameEnd = nx + doc.widthOfString(p.patientName) + 4;
  drawDottedLine(doc, nameEnd, y + baseline, x2);

  y += rowGap;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(DS.teal).text('Age', x, y);
  doc.font('Helvetica').fontSize(10).fillColor(DS.text);
  const ageStr = p.age || '—';
  const ax = x + 28;
  doc.text(ageStr, ax, y, { lineBreak: false });
  drawDottedLine(doc, ax + doc.widthOfString(ageStr) + 4, y + baseline, mid - 6);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(DS.teal).text('Date', mid, y);
  doc.font('Helvetica').fontSize(10).fillColor(DS.text);
  const dx = mid + 34;
  doc.text(p.dateStr, dx, y, { lineBreak: false });
  drawDottedLine(doc, dx + doc.widthOfString(p.dateStr) + 4, y + baseline, x2);

  y += rowGap;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(DS.teal).text('Adresse', x, y);
  doc.font('Helvetica').fontSize(9).fillColor(DS.text);
  const adx = x + 56;
  const addrStr = (p.address || '—').slice(0, 140);
  doc.text(addrStr, adx, y, { width: x2 - adx, lineBreak: false });
  const addrW = Math.min(doc.widthOfString(addrStr), x2 - adx - 20);
  drawDottedLine(doc, adx + addrW + 4, y + baseline, x2);

  return y + rowGap + 14;
}

function drawFooterOnCurrentPage(
  doc: PdfDoc,
  p: {
    phone: string;
    email: string;
    web: string;
    city: string;
  },
): void {
  const w = doc.page.width;
  const h = doc.page.height;
  const y0 = h - FOOTER_H;

  doc.save();
  doc.rect(0, y0, w, FOOTER_H).fillColor(DS.footerBg).fill();
  doc.restore();

  const colW = (w - 2 * DS.pad) / 3;
  const tx = DS.pad;
  const ty = y0 + 11;
  const white = DS.white;
  const tel = p.phone || '—';
  const em = p.email || '—';
  const wb = p.web || '—';
  const ct = p.city || '—';

  doc.font('Helvetica-Bold').fontSize(8).fillColor(white).text('Tel.', tx, ty, { lineBreak: false });
  doc.font('Helvetica').fontSize(8).fillColor(white).text(`  ${tel}`, tx + 22, ty, { width: colW - 22 });

  doc.font('Helvetica-Bold').fontSize(8).fillColor(white).text('Email', tx, ty + 15);
  doc.font('Helvetica').fontSize(8).fillColor(white).text(`  ${em}`, tx + 36, ty + 15, { width: colW - 36 });

  const tx2 = tx + colW;
  doc.font('Helvetica-Bold').fontSize(8).fillColor(white).text('Web', tx2, ty);
  doc.font('Helvetica').fontSize(8).fillColor(white).text(`  ${wb}`, tx2 + 26, ty, { width: colW - 26 });

  doc.font('Helvetica-Bold').fontSize(8).fillColor(white).text('Lieu', tx2, ty + 15);
  doc.font('Helvetica').fontSize(8).fillColor(white).text(`  ${ct}`, tx2 + 28, ty + 15, { width: colW - 28 });

  const tx3 = tx + colW * 2;
  doc.font('Helvetica').fontSize(8).fillColor(white).text('Contact cabinet', tx3, ty);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(white).text(tel !== '—' ? tel : 'MediFollow', tx3, ty + 14, {
    width: colW,
    align: 'left',
  });
}

function applyFootersToAllPages(
  doc: PdfDoc,
  footer: { phone: string; email: string; web: string; city: string },
): void {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    drawFooterOnCurrentPage(doc, footer);
  }
}

/**
 * Ordonnance A4 — gabarit type « bloc médical » : en-tête graphique, zone patient, liste médicaments, signature, pied bleu.
 */
export function buildPrescriptionPdfBuffer(params: BuildPrescriptionPdfParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    try {
      const pName = textForPrescriptionPdf(
        `${params.patientFirstName} ${params.patientLastName}`.trim() || 'Patient',
      );
      const drName = textForPrescriptionPdf(params.doctorDisplayName);
      const spec = textForPrescriptionPdf(params.doctorSpecialty || '');
      const dept = textForPrescriptionPdf(params.doctorDepartment || '');
      const age = params.patientAge ? textForPrescriptionPdf(params.patientAge) : '';
      const addr = params.patientAddressLine ? textForPrescriptionPdf(params.patientAddressLine) : '';
      const cityFoot = params.patientCity ? textForPrescriptionPdf(params.patientCity) : '';
      const dateStr = textForPrescriptionPdf(params.issuedDateYmd);
      const drEmail = textForPrescriptionPdf(params.doctorEmail || '');
      const drPhone = textForPrescriptionPdf(params.doctorPhone || '');
      const web = textForPrescriptionPdf(params.clinicWeb || 'medifollow.app');

      const clinicTagline =
        'Plateforme de suivi des soins — prescription electronique securisee.';
      const avatarBuf =
        params.doctorAvatarBuffer && params.doctorAvatarBuffer.length > 0
          ? params.doctorAvatarBuffer
          : null;

      drawWaveHeader(doc, {
        drName,
        spec: spec || 'Medecin prescripteur',
        dept,
        clinicTagline,
        doctorAvatarBuffer: avatarBuf,
      });

      let y = drawPatientFormBlock(doc, {
        patientName: pName,
        age,
        dateStr,
        address: addr,
      });

      const iw = innerWidth(doc);
      const xPad = DS.pad;
      const pageBottom = doc.page.height;

      const lines = params.lines || [];
      if (!lines.length) {
        doc.font('Helvetica').fontSize(10).fillColor(DS.muted).text('(aucune ligne medicamenteuse)', xPad, y, { width: iw });
        y = doc.y + 8;
      } else {
        lines.forEach((L, i) => {
          if (y > pageBottom - BOTTOM_RESERVE) {
            doc.addPage();
            y = DS.pad + 16;
            doc.font('Helvetica-Bold').fontSize(11).fillColor(DS.teal).text('MediFollow — ordonnance (suite)', xPad, y);
            y += 24;
          }
          const name = textForPrescriptionPdf(L.name);
          const dosage = textForPrescriptionPdf(L.dosage);
          const freq = textForPrescriptionPdf(L.frequency);
          const start = textForPrescriptionPdf(L.startDate);
          const end = textForPrescriptionPdf(L.endDate);
          const period =
            start && end
              ? `du ${start} au ${end}`
              : start
                ? `a partir du ${start}`
                : end
                  ? `jusqu'au ${end}`
                  : '';
          const note = textForPrescriptionPdf(L.notes);

          doc.font('Helvetica-Bold').fontSize(11).fillColor(DS.text).text(`${i + 1}. ${name}`, xPad, y, { width: iw });
          y = doc.y + 2;
          const details: string[] = [];
          if (dosage) details.push(`Dosage : ${dosage}`);
          if (freq) details.push(`Posologie : ${freq}`);
          if (period) details.push(period);
          if (details.length) {
            doc.font('Helvetica').fontSize(10).fillColor(DS.textSecondary).text(`    ${details.join('  |  ')}`, xPad, y, {
              width: iw,
            });
            y = doc.y + 2;
          }
          if (note) {
            doc.font('Helvetica').fontSize(9).fillColor(DS.muted).text(`    Note : ${note}`, xPad, y, { width: iw });
            y = doc.y + 2;
          }
          y += 10;
        });
      }

      y += 8;
      if (y > pageBottom - BOTTOM_RESERVE) {
        doc.addPage();
        y = DS.pad + 16;
      }

      const sigW = 200;
      const sigX = doc.page.width - DS.pad - sigW;
      doc.font('Helvetica').fontSize(9).fillColor(DS.teal).text('Signature', sigX, y, { width: sigW, align: 'center' });
      y += 12;
      doc.strokeColor(DS.teal).lineWidth(1).moveTo(sigX, y).lineTo(sigX + sigW, y).stroke();
      y += 8;
      doc.font('Helvetica-Bold').fontSize(10).fillColor(DS.text).text(drName, sigX, y, { width: sigW, align: 'center' });

      y += 36;
      if (y < pageBottom - FOOTER_H - 50) {
        doc.font('Helvetica').fontSize(8).fillColor(DS.muted).text(
          "Document emis via MediFollow. Conservez-le ou imprimez-le pour votre pharmacie.",
          xPad,
          y,
          { width: iw },
        );
      }

      const cityLine = cityFoot || dept || '';
      applyFootersToAllPages(doc, {
        phone: drPhone,
        email: drEmail,
        web,
        city: cityLine,
      });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
