/** Dashboard publik BSBM — membaca database transaksi lama secara READ ONLY. */
const SOURCE_PROP='SOURCE_SPREADSHEET_ID';
const PUBLIC_PROP='PUBLIC_DASHBOARD_SPREADSHEET_ID';
const TZ='Asia/Jakarta';

function setupDashboard(){
  const p=PropertiesService.getScriptProperties(), sourceId=p.getProperty(SOURCE_PROP);
  if(!sourceId) throw new Error('Script Properties SOURCE_SPREADSHEET_ID belum diisi dengan ID spreadsheet database BSBM.');
  SpreadsheetApp.openById(sourceId);
  let publicId=p.getProperty(PUBLIC_PROP), pub;
  if(publicId){ try{pub=SpreadsheetApp.openById(publicId);}catch(e){publicId='';} }
  if(!publicId){pub=SpreadsheetApp.create('BSBM - Rekap Dashboard Publik');p.setProperty(PUBLIC_PROP,pub.getId());}
  if(!pub.getSheetByName('Publik'))pub.insertSheet('Publik');
  refreshDashboard();
  return 'Dashboard disiapkan. Spreadsheet rekap: '+pub.getUrl();
}
function refreshDashboard(){
  const p=PropertiesService.getScriptProperties(), sourceId=p.getProperty(SOURCE_PROP), publicId=p.getProperty(PUBLIC_PROP);
  if(!sourceId||!publicId)throw new Error('Isi SOURCE_SPREADSHEET_ID lalu jalankan setupDashboard().');
  const ss=SpreadsheetApp.openById(sourceId);
  const peopleInfo=readTable_(ss,['Nasabah','Data Nasabah','Data Warga','Warga']);
  const depositInfo=readTable_(ss,['Setoran','Data Setoran','Transaksi Setoran','Penerimaan Sampah','Setor Sampah']);
  const withdrawalInfo=readTable_(ss,['Penarikan','Data Penarikan','Transaksi Penarikan','Penarikan Saldo']);
  const peopleRows=peopleInfo.rows, deposits=depositInfo.rows, withdrawals=withdrawalInfo.rows;
  const people={}, balances={}, monthly={}, byType={}; let weight=0,totalDeposit=0,totalWithdrawal=0;
  peopleRows.forEach(r=>{const id=str_(pick_(r,['ID Nasabah','ID','Kode Nasabah','Nomor Nasabah','No Nasabah']));if(!id)return;
    const name=str_(pick_(r,['Nama','Nama Nasabah','Nama Warga','Nama Lengkap']))||'Nasabah';
    people[id]={name,status:str_(pick_(r,['Status','Status Nasabah'])).toLowerCase()};
    balances[id]={name,deposit:0,withdrawal:0,balance:0};});
  deposits.forEach(r=>{
    const id=str_(pick_(r,['ID Nasabah','ID','Kode Nasabah','Nomor Nasabah','No Nasabah']));
    const val=num_(pick_(r,['Nilai Setoran','Total Setoran','Total Nilai Setoran','Total Nilai','Total Harga','Jumlah Setoran','Jumlah Uang','Nilai Rupiah','Nominal Setoran','Nilai','Total','Nominal','Jumlah']));
    const kg=num_(pick_(r,['Berat (kg)','Berat','Berat Kg','Jumlah Kg','Berat Sampah','Kg','Berat Sampah (Kg)']));
    const type=str_(pick_(r,['Jenis Sampah','Jenis','Kategori Sampah','Nama Sampah','Tipe Sampah','Nama Jenis Sampah']))||'Jenis tidak tercatat';
    if(!byType[type])byType[type]={jenis:type,nilaiRp:0,beratKg:0,transaksi:0};byType[type].nilaiRp+=val;byType[type].beratKg+=kg;byType[type].transaksi++;
    const d=date_(pick_(r,['Tanggal','Tanggal Setoran','Tanggal Transaksi','Waktu','Timestamp']));
    totalDeposit+=val;weight+=kg;
    if(id){if(!balances[id])balances[id]={name:str_(pick_(r,['Nama Nasabah','Nama']))||'Nasabah',deposit:0,withdrawal:0,balance:0};balances[id].deposit+=val;}
    if(d){const m=Utilities.formatDate(d,TZ,'yyyy-MM');if(!monthly[m])monthly[m]={month:m,depositsRp:0,weightKg:0,transactions:0};monthly[m].depositsRp+=val;monthly[m].weightKg+=kg;monthly[m].transactions++;}
  });
  withdrawals.forEach(r=>{const id=str_(pick_(r,['ID Nasabah','ID','Kode Nasabah','Nomor Nasabah','No Nasabah']));
    const v=num_(pick_(r,['Jumlah Penarikan','Total Penarikan','Nominal Penarikan','Jumlah Penarikan Saldo','Jumlah','Nominal','Nilai Penarikan','Total']));
    totalWithdrawal+=v;if(id){if(!balances[id])balances[id]={name:str_(pick_(r,['Nama Nasabah','Nama']))||'Nasabah',deposit:0,withdrawal:0,balance:0};balances[id].withdrawal+=v;}});
  Object.values(balances).forEach(b=>b.balance=b.deposit-b.withdrawal);
  const payload={success:true,updatedAt:new Date().toISOString(),
    diagnostics:{sourceSpreadsheetName:ss.getName(),sourceSheets:ss.getSheets().map(s=>s.getName()),
      nasabahSheet:peopleInfo.sheetName,setoranSheet:depositInfo.sheetName,penarikanSheet:withdrawalInfo.sheetName,
      nasabahRows:peopleRows.length,setoranRows:deposits.length,penarikanRows:withdrawals.length,
      nasabahHeaders:peopleInfo.headers,setoranHeaders:depositInfo.headers,penarikanHeaders:withdrawalInfo.headers},
    stats:{nasabah:peopleRows.filter(r=>str_(pick_(r,['ID Nasabah','ID','Kode Nasabah','Nomor Nasabah','No Nasabah']))).length,
      nasabahAktif:peopleRows.filter(r=>str_(pick_(r,['ID Nasabah','ID','Kode Nasabah','Nomor Nasabah','No Nasabah']))&&str_(pick_(r,['Status','Status Nasabah'])).toLowerCase()!=='nonaktif').length,
      setoranTransaksi:deposits.length,penarikanTransaksi:withdrawals.length,totalTransaksi:deposits.length+withdrawals.length,totalBeratKg:round_(weight,2),
      totalSetoranRp:Math.round(totalDeposit),totalPenerimaanSampahRp:Math.round(totalDeposit),totalPenarikanRp:Math.round(totalWithdrawal),saldoTersimpanRp:Math.round(totalDeposit-totalWithdrawal)},
    byType:Object.values(byType).sort((a,b)=>b.nilaiRp-a.nilaiRp).map(x=>({jenis:x.jenis,nilaiRp:Math.round(x.nilaiRp),beratKg:round_(x.beratKg,2),transaksi:x.transaksi})),
    monthly:Object.keys(monthly).sort().slice(-6).map(k=>({month:monthly[k].month,depositsRp:Math.round(monthly[k].depositsRp),weightKg:round_(monthly[k].weightKg,2),transactions:monthly[k].transactions})),
    topBalances:Object.values(balances).filter(b=>b.balance>0).sort((a,b)=>b.balance-a.balance).slice(0,5).map((b,i)=>({rank:i+1,name:b.name,balanceRp:Math.round(b.balance)}))};
  const pub=SpreadsheetApp.openById(publicId);let sh=pub.getSheetByName('Publik');if(!sh)sh=pub.insertSheet('Publik');
  sh.getRange('A1').setValue(JSON.stringify(payload));sh.getRange('A1').setNote('Ringkasan dashboard saja. Tidak menyimpan NIK, HP, alamat, atau baris transaksi.');
  return 'Rekap diperbarui: '+Utilities.formatDate(new Date(),TZ,'dd/MM/yyyy HH:mm:ss');
}
function doGet(e){
  let data;try{const id=PropertiesService.getScriptProperties().getProperty(PUBLIC_PROP);if(!id)throw new Error('Konfigurasi dashboard belum selesai. Jalankan setupDashboard().');
    const sh=SpreadsheetApp.openById(id).getSheetByName('Publik');if(!sh)throw new Error('Sheet Publik tidak ditemukan. Jalankan setupDashboard().');
    data=JSON.parse(String(sh.getRange('A1').getValue()||'{}'));if(!data.success)throw new Error('Rekap belum tersedia. Jalankan refreshDashboard().');
  }catch(err){data={success:false,error:String(err.message||err)};}
  const json=JSON.stringify(data).replace(/</g,'\\u003c'),cb=e&&e.parameter?String(e.parameter.callback||''):'';
  if(cb&&/^[A-Za-z_$][0-9A-Za-z_$\\.]*$/.test(cb))return ContentService.createTextOutput(cb+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function installRefreshTrigger(){ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='refreshDashboard').forEach(t=>ScriptApp.deleteTrigger(t));ScriptApp.newTrigger('refreshDashboard').timeBased().everyHours(1).create();return 'Pembaruan otomatis setiap jam dipasang.';}
function readTable_(ss,candidates){
  const sheets=ss.getSheets();let chosen=null;
  for(const name of candidates){const found=sheets.find(s=>norm_(s.getName())===norm_(name));if(found){chosen=found;break;}}
  if(!chosen){const wanted=candidates.map(norm_);chosen=sheets.find(s=>{const h=s.getLastColumn()?s.getRange(1,1,1,s.getLastColumn()).getDisplayValues()[0].map(norm_):[];return h.some(x=>['idnasabah','kodenasabah','nomornasabah'].includes(x))&&h.some(x=>wanted.some(w=>x.includes(w)||w.includes(x)));})||null;}
  if(!chosen)return {sheetName:null,headers:[],rows:[]};
  const values=chosen.getDataRange().getValues();if(!values.length)return {sheetName:chosen.getName(),headers:[],rows:[]};
  const headers=values[0].map(x=>String(x).trim());const rows=values.slice(1).filter(r=>r.some(x=>x!==''&&x!==null)).map(r=>{const o={};headers.forEach((h,i)=>o[h]=r[i]);return o;});
  return {sheetName:chosen.getName(),headers,rows};
}
function norm_(v){return String(v==null?'':v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');}
function pick_(row,aliases){const keys=Object.keys(row),map={};keys.forEach(k=>map[norm_(k)]=k);for(const a of aliases){const key=map[norm_(a)];if(key!==undefined&&row[key]!==''&&row[key]!==null&&row[key]!==undefined)return row[key];}return '';}
function str_(v){return v===null||v===undefined?'':String(v).trim();}
function num_(v){if(typeof v==='number')return isFinite(v)?v:0;let s=String(v||'').replace(/[^\d,.-]/g,'');if(!s)return 0;if(/\.\d{3}(\D|$)/.test(s))s=s.replace(/\.(?=\d{3}(\D|$))/g,'');s=s.replace(',','.');const n=Number(s);return isFinite(n)?n:0;}
function date_(v){if(v instanceof Date&&!isNaN(v))return v;if(!v)return null;const s=String(v).trim();let m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);const d=m?new Date(Number(m[3]),Number(m[2])-1,Number(m[1])):new Date(v);return isNaN(d)?null:d;}
function round_(n,d){const p=Math.pow(10,d);return Math.round((Number(n)||0)*p)/p;}
