const pdfTextLines = [
  'Gaston Andrada',
  'Ingenieria en Sistemas | Data Science, IA y Automatizacion (RPA)',
  'Estudiante enfocado en convertir datos complejos en decisiones utiles',
  'y en optimizar procesos industriales con soluciones practicas.',
  'Email: gasti.andrada123@gmail.com',
  'LinkedIn: linkedin.com/in/gaston-andrada',
  'GitHub: github.com/GastonAnd',
  'Funes, Argentina',
];

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildPdf(lines: string[]) {
  const encoder = new TextEncoder();
  const objects = [];

  const contentStream = [
    'BT',
    '/F1 18 Tf',
    '72 770 Td',
    ...lines.flatMap((line, index) => {
      const text = `(${escapePdfText(line)}) Tj`;
      return index === 0 ? [text] : ['0 -24 Td', text];
    }),
    'ET',
  ].join('\n');

  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj',
  );
  objects.push(
    `4 0 obj\n<< /Length ${encoder.encode(contentStream).length} >>\nstream\n${contentStream}\nendstream\nendobj`,
  );
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
  );

  const chunks = ['%PDF-1.4\n'];
  const offsets = ['0000000000 65535 f \n'];
  let currentOffset = encoder.encode(chunks[0]).length;

  for (const object of objects) {
    offsets.push(`${String(currentOffset).padStart(10, '0')} 00000 n \n`);
    chunks.push(`${object}\n`);
    currentOffset += encoder.encode(`${object}\n`).length;
  }

  const xrefOffset = currentOffset;
  const pdf = [
    ...chunks,
    `xref\n0 ${objects.length + 1}\n`,
    ...offsets,
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`,
    `startxref\n${xrefOffset}\n%%EOF\n`,
  ].join('');

  return encoder.encode(pdf);
}

export function GET() {
  const pdf = buildPdf(pdfTextLines);

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="CV-Gaston-Andrada.pdf"',
    },
  });
}
