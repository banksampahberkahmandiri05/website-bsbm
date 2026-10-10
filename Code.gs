/**
 * Backend konten publik BSBM — proyek Apps Script TERPISAH dari aplikasi transaksi.
 * Setup:
 * 1) Jalankan setupContentBackend() sekali dari editor.
 * 2) Set Script Properties: ADMIN_PIN (PIN kuat), CONTENT_FOLDER_ID (folder Drive ID, optional).
 * 3) Deploy sebagai Web App: Execute as Me, Who has access: Anyone.
 * 4) Tempel URL /exec ke CONTENT_API_URL di konten-admin.html dan BSBM_CONTENT_API di index.html.
 */
const CONTENT_SHEET_NAME = 'Konten Website BSBM';
function setupContentBackend() {
  const props = PropertiesService.getScriptProperties();
  let sheetId = props.getProperty('CONTENT_SHEET_ID');
  let ss;
  if (sheetId) {
    ss = SpreadsheetApp.openById(sheetId);
  } else {
    ss = SpreadsheetApp.create('Data Konten Website Bank Sampah Berkah Mandiri');
    sheetId = ss.getId();
    props.setProperty('CONTENT_SHEET_ID', sheetId);
  }
  let sh = ss.getSheetByName(CONTENT_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(CONTENT_SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['ID','Tanggal','Kategori','Judul','Deskripsi','URL Foto','Status','Dibuat Pada','Dibuat Oleh']);
    sh.setFrozenRows(1);
  }
  let folderId = props.getProperty('CONTENT_FOLDER_ID');
  if (!folderId) {
    const folder = DriveApp.createFolder('Foto Kegiatan Website BSBM');
    folderId = folder.getId();
    props.setProperty('CONTENT_FOLDER_ID', folderId);
  }
  Logger.log('Spreadsheet: ' + ss.getUrl());
  Logger.log('Folder foto ID: ' + folderId);
  Logger.log('PENTING: buka Project Settings > Script Properties dan set ADMIN_PIN ke PIN kuat.');
}
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== 'list') return json_({ok:true,service:'BSBM Website Content API',message:'Endpoint aktif.'});
  const cb = String(p.callback || '');
  const items = listPublished_();
  const payload = JSON.stringify({ok:true,items:items});
  if (cb && /^[A-Za-z_$][0-9A-Za-z_$\\.]*$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.action !== 'add') return json_({ok:false,message:'Aksi tidak valid.'});
    const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
    if (!expected || !safeEqual_(String(p.pin || ''), expected)) {
      return json_({ok:false,message:'PIN pengelola salah atau belum disetel.'});
    }
    const title = clean_(p.title,100), description = clean_(p.description,1500);
    const date = clean_(p.date,10), category = clean_(p.category,50);
    const status = String(p.status || '').toLowerCase() === 'draft' ? 'Draft' : 'Published';
    if (!title || !description || !date || !category) return json_({ok:false,message:'Judul, tanggal, kategori dan keterangan wajib diisi.'});
    const mime = String(p.mimeType || '');
    if (!['image/jpeg','image/png','image/webp'].includes(mime)) return json_({ok:false,message:'Format foto harus JPG, PNG, atau WebP.'});
    const b64 = String(p.data || '');
    if (!b64 || b64.length > 7 * 1024 * 1024) return json_({ok:false,message:'Foto kosong atau terlalu besar. Maksimum 5 MB.'});
    const bytes = Utilities.base64Decode(b64);
    if (bytes.length > 5 * 1024 * 1024) return json_({ok:false,message:'Foto maksimum 5 MB.'});
    const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp';
    const blob = Utilities.newBlob(bytes, mime, 'BSBM-' + Date.now() + '.' + ext);
    const folderId = PropertiesService.getScriptProperties().getProperty('CONTENT_FOLDER_ID');
    if (!folderId) throw new Error('Folder foto belum disiapkan. Jalankan setupContentBackend().');
    const file = DriveApp.getFolderById(folderId).createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const imageUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    const ssId = PropertiesService.getScriptProperties().getProperty('CONTENT_SHEET_ID');
    if (!ssId) throw new Error('Spreadsheet belum disiapkan. Jalankan setupContentBackend().');
    const ss = SpreadsheetApp.openById(ssId);
    const sh = ss.getSheetByName(CONTENT_SHEET_NAME);
    sh.appendRow([Utilities.getUuid(), date, category, title, description, imageUrl, status, new Date(), 'Website BSBM']);
    return json_({ok:true,message:'Konten tersimpan.',id:file.getId()});
  } catch (err) {
    console.error(err);
    return json_({ok:false,message:'Terjadi kesalahan saat menyimpan konten.'});
  }
}
function listPublished_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('CONTENT_SHEET_ID');
  if (!id) return [];
  const ss = SpreadsheetApp.openById(id);
  const sh = ss.getSheetByName(CONTENT_SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getRange(2,1,sh.getLastRow()-1,9).getValues();
  return values.filter(r => String(r[6]).toLowerCase() === 'published').map(r => ({
    id:String(r[0]), date:formatDate_(r[1]), category:String(r[2]), title:String(r[3]),
    description:String(r[4]), imageUrl:String(r[5]), status:String(r[6])
  }));
}
function formatDate_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd');
  return String(v || '');
}
function clean_(v, max) {
  return String(v || '').replace(/[\\u0000-\\u001F\\u007F]/g,' ').trim().slice(0,max);
}
function safeEqual_(a,b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i=0;i<a.length;i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
