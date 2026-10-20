// Build app/ into a .wgt and sign it with the Samsung Partner cert
// (same author+distributor signing the TizenBrew Installer uses).
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { Signature } = require('tizen');

const APP_DIR = path.join(__dirname, '..', 'app');
const OUT = path.join(__dirname, '..', 'out', 'ChannelProbe.wgt');
const cert = JSON.parse(fs.readFileSync(path.join(__dirname, 'cert.json'), 'utf8'));

// config stored certs as base64 of binary DER (p12); restore to binary string
const certificates = {
  authorCert: Buffer.from(cert.authorCert, 'base64').toString('binary'),
  distributorCert: Buffer.from(cert.distributorCert, 'base64').toString('binary'),
  password: cert.password,
};

async function buildUnsignedFiles() {
  const names = fs.readdirSync(APP_DIR);
  return names
    .filter((n) => fs.statSync(path.join(APP_DIR, n)).isFile())
    .map((n) => ({ uri: encodeURIComponent(n), data: fs.readFileSync(path.join(APP_DIR, n)) }));
}

async function sign(files) {
  const forge = require('node-forge');
  const dP12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(certificates.distributorCert), false, certificates.password);
  const aP12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(certificates.authorCert), false, certificates.password);
  const authorSig = new Signature('AuthorSignature', files);
  const withAuthor = await authorSig.sign(aP12);
  const distSig = new Signature('DistributorSignature', withAuthor);
  return await distSig.sign(dP12);
}

(async () => {
  const files = await buildUnsignedFiles();
  console.log('packaging files:', files.map((f) => decodeURIComponent(f.uri)).join(', '));
  const signed = await sign(files);
  const zip = new JSZip();
  for (const f of signed) zip.file(decodeURIComponent(f.uri), f.data);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  console.log('wrote', OUT, buf.length, 'bytes');
})().catch((e) => { console.error('SIGN FAILED:', e); process.exit(1); });
