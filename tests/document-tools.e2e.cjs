const test = require('node:test');
const assert = require('node:assert/strict');
const { PDFDocument, PDFName, PDFString, StandardFonts } = require('pdf-lib');
const { Browser, sleep } = require('./browser.cjs');

function fixture(name, bytes, type = 'application/pdf') { return { name, bytes, type }; }

async function textPdf(pageCount = 2, compact = false) {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let number = 1; number <= pageCount; number++) {
    pdf.addPage([300, 400]).drawText(`Page ${number}: Hello World, caf\u00e9`, { font, size: 18, x: 20, y: 350 });
  }
  const annotation = pdf.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [20, 330, 200, 380], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of('https://example.com') } });
  pdf.getPage(0).node.set(PDFName.of('Annots'), pdf.context.obj([pdf.context.register(annotation)]));
  return pdf.save({ useObjectStreams: compact });
}

function rawPdf(objects) {
  const chunks = [Buffer.from('%PDF-1.4\n')], offsets = [0];
  let length = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(length);
    const chunk = Buffer.concat([Buffer.from(`${index + 1} 0 obj\n`), Buffer.isBuffer(object) ? object : Buffer.from(object), Buffer.from('\nendobj\n')]);
    chunks.push(chunk); length += chunk.length;
  });
  chunks.push(Buffer.from(`xref\n0 ${offsets.length}\n0000000000 65535 f \n` + offsets.slice(1).map(offset => String(offset).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF\n`));
  return Buffer.concat(chunks);
}

function tinyPdf() {
  return rawPdf(['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 300] /Resources << >> /Contents 4 0 R >>', '<< /Length 0 >>\nstream\nendstream']);
}

function scannedPdf() {
  const width = 500, height = 700, bytes = Buffer.alloc(width * height * 3);
  let seed = 12345;
  for (let index = 0; index < bytes.length; index++) { seed = (seed * 1664525 + 1013904223) >>> 0; bytes[index] = seed >>> 24; }
  const stream = 'q 500 0 0 700 0 0 cm /Scan Do Q\n';
  return rawPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 500 700] /Resources << /XObject << /Scan 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
    Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${bytes.length} >>\nstream\n`), bytes, Buffer.from('\nendstream')]),
  ]);
}

async function ready(browser, selector) {
  await browser.wait(`${selector} || document.querySelector('[role=alert]')`, 60000);
  const errors = await browser.eval("[...document.querySelectorAll('[role=alert]')].map(el=>el.textContent)");
  assert.deepEqual(errors, []);
}

test('document tools: real uploads and downloadable output', { timeout: 240000 }, async t => {
  const browser = new Browser(process.env.TEST_BASE_URL || 'http://localhost:3217');
  t.after(() => browser.close());
  await browser.start();
  const text = fixture('text.pdf', await textPdf());
  const scan = fixture('scan.pdf', scannedPdf());
  let images;

  await t.test('all eight tools are active links', async () => {
    await browser.goto('/');
    assert.equal(await browser.eval("document.querySelectorAll('a.tool-card').length"), 8);
    assert.equal(await browser.eval("document.querySelectorAll('.is-unavailable').length"), 0);
    images = (await browser.eval("(() => {return [{name:'wide.jpg',type:'image/jpeg',w:160,h:120,color:'red'},{name:'tall.png',type:'image/png',w:80,h:140,color:'green'},{name:'square.webp',type:'image/webp',w:96,h:96,color:'blue'}].map(item=>{const canvas=document.createElement('canvas');canvas.width=item.w;canvas.height=item.h;const context=canvas.getContext('2d');context.fillStyle=item.color;context.fillRect(0,0,item.w,item.h);return {...item,data:canvas.toDataURL(item.type).split(',')[1]};});})()")).map(item => fixture(item.name, Buffer.from(item.data, 'base64'), item.type));
  });

  await t.test('multiple image inputs become ordered PDF pages with matching orientation', async () => {
    await browser.goto('/converter/image-to-pdf');
    await browser.upload(images);
    assert.equal(await browser.eval("document.querySelectorAll('.image-pdf-list li').length"), 3);
    await browser.click('.document-actions > button');
    await ready(browser, "document.querySelector('.document-result')");
    const saved = await browser.download('.document-result button');
    assert.equal(saved.name, 'combined-images.pdf');
    const pdf = await PDFDocument.load(saved.bytes);
    assert.equal(pdf.getPageCount(), 3);
    assert.ok(pdf.getPage(0).getWidth() > pdf.getPage(0).getHeight());
    assert.ok(pdf.getPage(1).getWidth() < pdf.getPage(1).getHeight());
    assert.ok(pdf.getPage(2).getWidth() < pdf.getPage(2).getHeight());
  });

  await t.test('reordering, page size, margins, and removal change the actual PDF', async () => {
    await browser.click('[aria-label="Move image 3 up"]');
    await browser.click('[aria-label="Move image 2 up"]');
    assert.equal(await browser.eval("!!document.querySelector('.document-result')"), false);
    await browser.set('.document-settings label:nth-child(1) select', 'image');
    await browser.set('.document-settings label:nth-child(3) select', '0');
    await browser.click('.document-actions > button');
    await ready(browser, "document.querySelector('.document-result')");
    const pdf = await PDFDocument.load((await browser.download('.document-result button')).bytes);
    assert.deepEqual(pdf.getPages().map(page => page.getSize()), [{ width: 72, height: 72 }, { width: 120, height: 90 }, { width: 60, height: 105 }]);
    await browser.click('[aria-label="Remove image 2"]');
    assert.equal(await browser.eval("document.querySelectorAll('.image-pdf-list li').length"), 2);
    assert.equal(await browser.eval("!!document.querySelector('.document-result')"), false);
    await browser.eval("[...document.querySelectorAll('button')].find(el=>el.textContent==='Clear images').click()");
    await sleep(100);
    assert.equal(await browser.eval("document.querySelector('.document-actions button').disabled"), true);
  });

  await t.test('corrupt images produce an error without a PDF download', async () => {
    await browser.upload([fixture('broken.png', Buffer.from('not an image'), 'image/png')]);
    await browser.click('.document-actions button');
    await browser.wait("document.querySelector('[role=alert]')");
    assert.match(await browser.eval("document.querySelector('[role=alert]').textContent"), /Could not read/);
    assert.equal(await browser.eval("!!document.querySelector('.document-result')"), false);
  });

  await t.test('text extraction preserves page order and UTF-8 in preview and download', async () => {
    await browser.goto('/converter/pdf-to-text');
    await browser.upload([text]);
    await browser.click('.document-actions > button');
    await ready(browser, "document.querySelector('#extracted-text')");
    const preview = await browser.eval("document.querySelector('#extracted-text').value");
    assert.match(preview, /Page 1: Hello World, caf\u00e9/);
    assert.match(preview, /Page 2: Hello World, caf\u00e9/);
    assert.ok(preview.indexOf('Page 1') < preview.indexOf('Page 2'));
    const saved = await browser.download('.text-extraction-result .document-actions button');
    assert.equal(saved.name, 'text.txt');
    assert.equal(saved.bytes.toString('utf8'), preview);
    await browser.click('.text-extraction-result .document-actions button:nth-child(2)');
    await browser.wait("document.querySelector('.text-extraction-result').textContent.includes('Text copied.')");
    assert.equal((await browser.eval('navigator.clipboard.readText()')).replace(/\r\n/g, '\n'), preview);
  });

  await t.test('scanned PDFs report that OCR is required rather than exporting empty text', async () => {
    await browser.click('[aria-label="Remove file"]'); await browser.upload([scan]);
    await browser.click('.document-actions > button');
    await ready(browser, "document.querySelector('.text-extraction-result')");
    assert.match(await browser.eval("document.querySelector('.text-extraction-result').textContent"), /No selectable text found/);
    assert.equal(await browser.eval("!!document.querySelector('#extracted-text')"), false);
  });

  await t.test('cancel extraction prevents stale results and allows retry', async () => {
    await browser.click('[aria-label="Remove file"]');
    await browser.upload([fixture('many-pages.pdf', await textPdf(100))]);
    await browser.eval("document.querySelector('.document-actions > button').click()");
    await browser.wait("document.querySelector('.document-progress button')");
    await browser.click('.document-progress button');
    await sleep(700);
    assert.equal(await browser.eval("!!document.querySelector('.text-extraction-result')"), false);
    assert.match(await browser.eval("document.querySelector('.document-progress').textContent"), /cancelled/);
    assert.equal(await browser.eval("document.querySelector('.document-actions > button').disabled"), false);
  });

  await t.test('preserving optimization makes a valid PDF and retains text streams and links', async () => {
    await browser.goto('/converter/pdf-compressor'); await browser.upload([text]);
    await browser.click('.document-actions > button');
    await ready(browser, "document.querySelector('.optimization-result')");
    const saved = await browser.download('.optimization-result button');
    assert.ok(saved.bytes.length < text.bytes.length, `Expected reduction: ${saved.bytes.length} vs ${text.bytes.length}`);
    const original = await PDFDocument.load(text.bytes);
    const output = await PDFDocument.load(saved.bytes);
    assert.equal(output.getPageCount(), 2);
    assert.equal(output.getPage(0).node.Annots().size(), 1);
    for (let index = 0; index < 2; index++) {
      const before = original.context.lookup(original.getPage(index).node.Contents().get(0)).getContents();
      const after = output.context.lookup(output.getPage(index).node.Contents().get(0)).getContents();
      assert.ok(Buffer.from(after).equals(Buffer.from(before)));
    }
  });

  await t.test('image compression reduces image-heavy PDF and preserves page dimensions', async () => {
    t.diagnostic(`Image-heavy source: ${scan.bytes.length} bytes`);
    await browser.goto('/converter/pdf-compressor'); await browser.upload([scan]);
    await browser.set('.optimizer-mode select', 'images');
    assert.match(await browser.eval("document.querySelector('#optimization-note').textContent"), /Selectable text, links, and form fields are removed/);
    await browser.set('.document-settings label:nth-child(2) select', '72');
    await browser.click('.document-actions > button');
    await ready(browser, "document.querySelector('.optimization-result')");
    const saved = await browser.download('.optimization-result button');
    t.diagnostic(`Downloaded image-compressed PDF: ${saved.bytes.length} bytes`);
    assert.ok(saved.bytes.length < scan.bytes.length * 0.6, `Expected meaningful image compression, got ${saved.bytes.length} from ${scan.bytes.length}`);
    const output = await PDFDocument.load(saved.bytes);
    assert.equal(output.getPageCount(), 1);
    assert.deepEqual(output.getPage(0).getSize(), { width: 500, height: 700 });
    assert.equal(output.getPage(0).node.Annots()?.size() || 0, 0);
  });

  await t.test('optimizer keeps exact original when compression would increase size', async () => {
    const small = fixture('tiny.pdf', tinyPdf());
    await browser.click('[aria-label="Remove file"]'); await browser.upload([small]);
    await browser.set('.optimizer-mode select', 'preserve');
    await browser.click('.document-actions > button');
    await ready(browser, "document.querySelector('.optimization-result')");
    assert.match(await browser.eval("document.querySelector('.optimization-result').textContent"), /original is already smaller/);
    const saved = await browser.download('.optimization-result button');
    assert.equal(saved.name, 'tiny.pdf');
    assert.deepEqual(saved.bytes, small.bytes);
  });

  await t.test('invalid PDFs show recoverable errors in both PDF tools', async () => {
    for (const route of ['pdf-to-text', 'pdf-compressor']) {
      await browser.goto('/converter/' + route);
      await browser.upload([fixture('invalid.pdf', Buffer.from('not a PDF'))]);
      await browser.click('.document-actions > button');
      await browser.wait("document.querySelector('[role=alert]')");
      assert.match(await browser.eval("document.querySelector('[role=alert]').textContent"), /valid, unlocked PDF/);
      await browser.click('[aria-label="Remove file"]');
      assert.equal(await browser.eval("!!document.querySelector('[role=alert]')"), false);
    }
  });

  await t.test('all new tools fit a phone viewport and make no uploads or browser exceptions', async () => {
    await browser.resize(390, 844);
    for (const route of ['image-to-pdf', 'pdf-to-text', 'pdf-compressor']) {
      await browser.goto('/converter/' + route);
      if (route === 'image-to-pdf') await browser.upload(images);
      if (route === 'pdf-compressor') await browser.set('.optimizer-mode select', 'images');
      assert.equal(await browser.eval('document.documentElement.scrollWidth > innerWidth'), false, route + ' overflows');
    }
    assert.deepEqual(browser.posts, []);
    assert.deepEqual(browser.errors, []);
  });
});

test('existing single-file converters still work after multiple-upload support', { timeout: 60000 }, async t => {
  const browser = new Browser(process.env.TEST_BASE_URL || 'http://localhost:3217');
  t.after(() => browser.close());
  await browser.start();
  await browser.goto('/converter/pdf-to-png');
  await browser.upload([fixture('existing.pdf', await textPdf())]);
  await ready(browser, "document.querySelector('.conversion-results')");
  assert.equal(await browser.eval("document.querySelectorAll('.page-preview').length"), 2);
  const png = await browser.download('[aria-label="Download page 1"]');
  assert.ok(png.bytes.toString('hex').startsWith('89504e47'));

  await browser.goto('/converter/png-to-jpg');
  const encoded = await browser.eval("(() => {const canvas=document.createElement('canvas');canvas.width=80;canvas.height=60;const context=canvas.getContext('2d');context.fillStyle='green';context.fillRect(0,0,80,60);return canvas.toDataURL('image/png').split(',')[1];})()");
  await browser.upload([fixture('existing.png', Buffer.from(encoded, 'base64'), 'image/png')]);
  await ready(browser, "document.querySelector('.image-result img')?.naturalWidth > 0");
  const jpg = await browser.download('.image-result button');
  assert.ok(jpg.bytes.toString('hex').startsWith('ffd8ff'));
  assert.deepEqual(browser.errors, []);
});
