/** Dashboard publik BSBM - Apps Script terpisah dari aplikasi transaksi lama. */
const SOURCE_PROP='SOURCE_SPREADSHEET_ID';
const PUBLIC_PROP='PUBLIC_DASHBOARD_SPREADSHEET_ID';
const TZ='Asia/Jakarta';

function setupDashboard(){
  const sourceId=PropertiesService.getScriptProperties().getProperty(SOURCE_PROP);
  if(!sourceId) throw new Error('Isi Script Properties SOURCE_SPREADSHEET_ID dengan ID spreadsheet database BSBM.');
  SpreadsheetApp.openById(sourceId); // hanya membaca/validasi database lama
  const pub=SpreadsheetApp.create('BSBM - Rekap Dashboard Publik');
  pub.getSheets()[0].setName('Publik');
  PropertiesService.getScriptProperties().setProperty(PUBLIC_PROP,pub.getId());
  refreshDashboard();
  return 'Spreadsheet rekap dibuat: '+pub.getUrl();
}

function refreshDashboard(){
  const p=PropertiesService.getScriptProperties(), sourceId=p.getProperty(SOURCE_PROP), publicId=p.getProperty(PUBLIC_PROP);
  if(!sourceId||!publicId) throw new Error('Isi SOURCE_SPREADSHEET_ID dan jalankan setupDashboard() terlebih dahulu.');
  const ss=SpreadsheetApp.openById(sourceId);
  const peopleRows=readRows_(ss,'Nasabah'), deposits=readRows_(ss,'Setoran'), withdrawals=readRows_(ss,'Penarikan');
  const people={}, balances={}, monthly={};
  peopleRows.forEach(r=>{const id=str_(r['ID Nasabah']);if(!id)return;people[id]={name:str_(r['Nama'])||'Nasabah',status:str_(r['Status']).toLowerCase()};balances[id]={name:people[id].name,deposit:0,withdrawal:0,balance:0};});
  let weight=0,totalDeposit=0,totalWithdrawal=0;
  deposits.forEach(r=>{
    const id=str_(r['ID Nasabah']), val=num_(r['Nilai Setoran']), kg=num_(r['Berat (kg)']), d=date_(r['Tanggal']);
    totalDeposit+=val;weight+=kg;
    if(id){if(!balances[id])balances[id]={name:str_(r['Nama Nasabah'])||'Nasabah',deposit:0,withdrawal:0,balance:0};balances[id].deposit+=val;}
    if(d){const m=Utilities.formatDate(d,TZ,'yyyy-MM');if(!monthly[m])monthly[m]={month:m,depositsRp:0,weightKg:0,transactions:0};monthly[m].depositsRp+=val;monthly[m].weightKg+=kg;monthly[m].transactions++;}
  });
  withdrawals.forEach(r=>{const id=str_(r['ID Nasabah']),v=num_(r['Jumlah Penarikan']);totalWithdrawal+=v;if(id){if(!balances[id])balances[id]={name:str_(r['Nama Nasabah'])||'Nasabah',deposit:0,withdrawal:0,balance:0};balances[id].withdrawal+=v;}});
  Object.values(balances).forEach(b=>b.balance=Math.max(0,b.deposit-b.withdrawal));
  const payload={success:true,updatedAt:new Date().toISOString(),stats:{nasabah:peopleRows.filter(r=>str_(r['ID Nasabah'])).length,nasabahAktif:peopleRows.filter(r=>str_(r['ID Nasabah'])&&str_(r['Status']).toLowerCase()!=='nonaktif').length,setoranTransaksi:deposits.length,penarikanTransaksi:withdrawals.length,totalBeratKg:round_(weight,2),totalSetoranRp:Math.round(totalDeposit),totalPenarikanRp:Math.round(totalWithdrawal),saldoTersimpanRp:Math.round(totalDeposit-totalWithdrawal)},monthly:Object.keys(monthly).sort().slice(-6).map(k=>({month:k,depositsRp:Math.round(monthly[k].depositsRp),weightKg:round_(monthly[k].weightKg,2),transactions:monthly[k].transactions})),topBalances:Object.values(balances).filter(b=>b.balance>0).sort((a,b)=>b.balance-a.balance).slice(0,5).map((b,i)=>({rank:i+1,name:b.name,balanceRp:Math.round(b.balance)}))};
  const pub=SpreadsheetApp.openById(publicId);let sh=pub.getSheetByName('Publik');if(!sh)sh=pub.insertSheet('Publik');
  sh.getRange('A1').setValue(JSON.stringify(payload));sh.getRange('A1').setNote('Hanya rekap publik. Jangan menaruh NIK, HP, alamat, atau baris transaksi di sini.');
  return 'Rekap diperbarui: '+new Date().toLocaleString('id-ID');
}

function doGet(e){
  let data;try{const id=PropertiesService.getScriptProperties().getProperty(PUBLIC_PROP);if(!id)throw new Error('Jalankan setupDashboard() dahulu.');data=JSON.parse(String(SpreadsheetApp.openById(id).getSheetByName('Publik').getRange('A1').getValue()||'{}'));}catch(err){data={success:false,error:String(err.message||err)};}
  const json=JSON.stringify(data).replace(/</g,'\\u003c'), cb=e&&e.parameter?String(e.parameter.callback||''):'';
  if(cb&&/^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(cb))return ContentService.createTextOutput(cb+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function installRefreshTrigger(){ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='refreshDashboard').forEach(t=>ScriptApp.deleteTrigger(t));ScriptApp.newTrigger('refreshDashboard').timeBased().everyHours(1).create();return 'Pembaruan otomatis setiap jam dipasang.';}
function readRows_(ss,name){const sh=ss.getSheetByName(name);if(!sh)throw new Error('Sheet sumber tidak ditemukan: '+name);const v=sh.getDataRange().getValues();if(v.length<2)return[];const h=v.shift().map(x=>String(x).trim());return v.filter(r=>r.some(x=>x!==''&&x!==null)).map(r=>{const o={};h.forEach((k,i)=>o[k]=r[i]);return o;});}
function str_(v){return v===null||v===undefined?'':String(v).trim();}
function num_(v){if(typeof v==='number')return isFinite(v)?v:0;const s=String(v||'').replace(/[^\d,.-]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.');const n=Number(s);return isFinite(n)?n:0;}
function date_(v){if(v instanceof Date&&!isNaN(v))return v;if(!v)return null;const d=new Date(v);return isNaN(d)?null:d;}
function round_(n,d){const p=Math.pow(10,d);return Math.round((Number(n)||0)*p)/p;}
