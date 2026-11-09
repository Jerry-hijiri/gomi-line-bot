/**
 * 別府市ごみ収集日 LINEグループ通知（SEKIYA.so前・令和8年度）
 * - 前日 EVENING_HOUR 時と当日 MORNING_HOUR 時に、収集がある日だけグループへ送る
 * - 毎回カレンダー画像を添付（1回の送信=テキスト+画像で1通扱い）
 * - グループIDは、公式LINEをグループに招待したときのWebhookで自動保存
 */
const EVENING_HOUR = 20;   // 前日の通知（時）
const MORNING_HOUR = 9;    // 当日の通知（時）。収集は朝8:30まで
const MORNING_ENABLED = false; // 無料枠(月200通)に収めるため前日のみ
const PLACE = 'SEKIYA.so前';
const IMAGE_URL = 'https://jerry-hijiri.github.io/gomi-line-bot/calendar.jpg';
const PREVIEW_URL = 'https://jerry-hijiri.github.io/gomi-line-bot/calendar_preview.jpg';

const KINDS = {
  moyasu:    { name: '燃えるゴミ',       bag: '🟢緑色の袋',   items: '紙・生ごみ・プラ容器', rule: null },
  moyasanai: { name: '燃やさないゴミ',   bag: '⚪️灰色の袋',   items: 'プラスチック製品・小型電気製品・かさ・金属や陶器類・電球など', rule: '第1・第3火曜日' },
  can:       { name: '缶・びん・ペットボトル', bag: '🩷ピンクの袋', items: '缶・びん・ペットボトル', rule: '第2・第4火曜日' },
  koshi:     { name: '古紙',             bag: '🪢紐でくくる', items: 'ダンボール・本', rule: '第2・第4金曜日' },
};

// 令和8年度 別府市カレンダー（石垣西・石垣東・駅前本町・北浜2〜3・北的ヶ浜・京町・南的ヶ浜・弓ヶ浜）
// 祝日の休止・振替を反映済み（5/5・11/3・12/31・9/22・2/23休み、9/29缶びん振替）
const SCHEDULE = {
  '2026-04-02': 'moyasu',
  '2026-04-06': 'moyasu',
  '2026-04-07': 'moyasanai',
  '2026-04-09': 'moyasu',
  '2026-04-10': 'koshi',
  '2026-04-13': 'moyasu',
  '2026-04-14': 'can',
  '2026-04-16': 'moyasu',
  '2026-04-20': 'moyasu',
  '2026-04-21': 'moyasanai',
  '2026-04-23': 'moyasu',
  '2026-04-24': 'koshi',
  '2026-04-27': 'moyasu',
  '2026-04-28': 'can',
  '2026-04-30': 'moyasu',
  '2026-05-04': 'moyasu',
  '2026-05-07': 'moyasu',
  '2026-05-08': 'koshi',
  '2026-05-11': 'moyasu',
  '2026-05-12': 'can',
  '2026-05-14': 'moyasu',
  '2026-05-18': 'moyasu',
  '2026-05-19': 'moyasanai',
  '2026-05-21': 'moyasu',
  '2026-05-22': 'koshi',
  '2026-05-25': 'moyasu',
  '2026-05-26': 'can',
  '2026-05-28': 'moyasu',
  '2026-06-01': 'moyasu',
  '2026-06-02': 'moyasanai',
  '2026-06-04': 'moyasu',
  '2026-06-08': 'moyasu',
  '2026-06-09': 'can',
  '2026-06-11': 'moyasu',
  '2026-06-12': 'koshi',
  '2026-06-15': 'moyasu',
  '2026-06-16': 'moyasanai',
  '2026-06-18': 'moyasu',
  '2026-06-22': 'moyasu',
  '2026-06-23': 'can',
  '2026-06-25': 'moyasu',
  '2026-06-26': 'koshi',
  '2026-06-29': 'moyasu',
  '2026-07-02': 'moyasu',
  '2026-07-06': 'moyasu',
  '2026-07-07': 'moyasanai',
  '2026-07-09': 'moyasu',
  '2026-07-10': 'koshi',
  '2026-07-13': 'moyasu',
  '2026-07-14': 'can',
  '2026-07-16': 'moyasu',
  '2026-07-20': 'moyasu',
  '2026-07-21': 'moyasanai',
  '2026-07-23': 'moyasu',
  '2026-07-24': 'koshi',
  '2026-07-27': 'moyasu',
  '2026-07-28': 'can',
  '2026-07-30': 'moyasu',
  '2026-08-03': 'moyasu',
  '2026-08-04': 'moyasanai',
  '2026-08-06': 'moyasu',
  '2026-08-10': 'moyasu',
  '2026-08-11': 'can',
  '2026-08-13': 'moyasu',
  '2026-08-14': 'koshi',
  '2026-08-17': 'moyasu',
  '2026-08-18': 'moyasanai',
  '2026-08-20': 'moyasu',
  '2026-08-24': 'moyasu',
  '2026-08-25': 'can',
  '2026-08-27': 'moyasu',
  '2026-08-28': 'koshi',
  '2026-08-31': 'moyasu',
  '2026-09-01': 'moyasanai',
  '2026-09-03': 'moyasu',
  '2026-09-07': 'moyasu',
  '2026-09-08': 'can',
  '2026-09-10': 'moyasu',
  '2026-09-11': 'koshi',
  '2026-09-14': 'moyasu',
  '2026-09-15': 'moyasanai',
  '2026-09-17': 'moyasu',
  '2026-09-21': 'moyasu',
  '2026-09-24': 'moyasu',
  '2026-09-25': 'koshi',
  '2026-09-28': 'moyasu',
  '2026-09-29': 'can',
  '2026-10-01': 'moyasu',
  '2026-10-05': 'moyasu',
  '2026-10-06': 'moyasanai',
  '2026-10-08': 'moyasu',
  '2026-10-09': 'koshi',
  '2026-10-12': 'moyasu',
  '2026-10-13': 'can',
  '2026-10-15': 'moyasu',
  '2026-10-19': 'moyasu',
  '2026-10-20': 'moyasanai',
  '2026-10-22': 'moyasu',
  '2026-10-23': 'koshi',
  '2026-10-26': 'moyasu',
  '2026-10-27': 'can',
  '2026-10-29': 'moyasu',
  '2026-11-02': 'moyasu',
  '2026-11-05': 'moyasu',
  '2026-11-09': 'moyasu',
  '2026-11-10': 'can',
  '2026-11-12': 'moyasu',
  '2026-11-13': 'koshi',
  '2026-11-16': 'moyasu',
  '2026-11-17': 'moyasanai',
  '2026-11-19': 'moyasu',
  '2026-11-23': 'moyasu',
  '2026-11-24': 'can',
  '2026-11-26': 'moyasu',
  '2026-11-27': 'koshi',
  '2026-11-30': 'moyasu',
  '2026-12-01': 'moyasanai',
  '2026-12-03': 'moyasu',
  '2026-12-07': 'moyasu',
  '2026-12-08': 'can',
  '2026-12-10': 'moyasu',
  '2026-12-11': 'koshi',
  '2026-12-14': 'moyasu',
  '2026-12-15': 'moyasanai',
  '2026-12-17': 'moyasu',
  '2026-12-21': 'moyasu',
  '2026-12-22': 'can',
  '2026-12-24': 'moyasu',
  '2026-12-25': 'koshi',
  '2026-12-28': 'moyasu',
  '2027-01-04': 'moyasu',
  '2027-01-05': 'moyasanai',
  '2027-01-07': 'moyasu',
  '2027-01-08': 'koshi',
  '2027-01-11': 'moyasu',
  '2027-01-12': 'can',
  '2027-01-14': 'moyasu',
  '2027-01-18': 'moyasu',
  '2027-01-19': 'moyasanai',
  '2027-01-21': 'moyasu',
  '2027-01-22': 'koshi',
  '2027-01-25': 'moyasu',
  '2027-01-26': 'can',
  '2027-01-28': 'moyasu',
  '2027-02-01': 'moyasu',
  '2027-02-02': 'moyasanai',
  '2027-02-04': 'moyasu',
  '2027-02-08': 'moyasu',
  '2027-02-09': 'can',
  '2027-02-11': 'moyasu',
  '2027-02-12': 'koshi',
  '2027-02-15': 'moyasu',
  '2027-02-16': 'moyasanai',
  '2027-02-18': 'moyasu',
  '2027-02-22': 'moyasu',
  '2027-02-25': 'moyasu',
  '2027-02-26': 'koshi',
  '2027-03-01': 'moyasu',
  '2027-03-02': 'moyasanai',
  '2027-03-04': 'moyasu',
  '2027-03-08': 'moyasu',
  '2027-03-09': 'can',
  '2027-03-11': 'moyasu',
  '2027-03-12': 'koshi',
  '2027-03-15': 'moyasu',
  '2027-03-16': 'moyasanai',
  '2027-03-18': 'moyasu',
  '2027-03-22': 'moyasu',
  '2027-03-23': 'can',
  '2027-03-25': 'moyasu',
  '2027-03-26': 'koshi',
  '2027-03-29': 'moyasu'
};

const WD = ['日','月','火','水','木','金','土'];

function ymd_(d) { return Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd'); }

function buildText_(dateStr, when) {
  const kind = SCHEDULE[dateStr];
  if (!kind) return null;
  const k = KINDS[kind];
  const d = new Date(dateStr + 'T00:00:00+09:00');
  const wd = WD[d.getDay()] + '曜日';
  const head = when === 'eve' ? '明日は' : '今日は';
  const tail = when === 'eve' ? '' : '（朝8:30までに出してください）';
  return [
    `${head}${k.name}の収集日です。${tail}`,
    `ゴミ袋の色: ${k.bag}`,
    `捨てて良いもの: ${k.items}`,
    `曜日: ${k.rule && kind !== 'can' || (k.rule && isRegular_(d)) ? k.rule : wd}（${d.getMonth()+1}/${d.getDate()}）`,
    `回収場所: ${PLACE}`,
  ].join('\n');
}

// 缶びんの振替（第5火など）は規則の表記を出さず実際の曜日を出す
function isRegular_(d) { const n = Math.floor((d.getDate()-1)/7)+1; return n === 2 || n === 4; }

function push_(text) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('LINE_TOKEN');
  const to = props.getProperty('GROUP_ID');
  if (!token || !to) throw new Error('LINE_TOKEN または GROUP_ID が未設定');
  const res = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ to, messages: [
      { type: 'text', text },
      { type: 'image', originalContentUrl: IMAGE_URL, previewImageUrl: PREVIEW_URL },
    ]}),
  });
  if (res.getResponseCode() !== 200) throw new Error('LINE送信失敗 ' + res.getResponseCode() + ' ' + res.getContentText());
}

function sendOnce_(dateStr, when) {
  const text = buildText_(dateStr, when);
  if (!text) return;
  const props = PropertiesService.getScriptProperties();
  const key = 'sent_' + dateStr + '_' + when;
  if (props.getProperty(key)) return;   // 二重送信防止
  push_(text);
  props.setProperty(key, '1');
}

/** 前日の通知（トリガーから） */
function notifyEvening() {
  const t = new Date(Date.now() + 24*3600*1000);
  sendOnce_(ymd_(t), 'eve');
  scheduleNext_();
}
/** 当日の通知（トリガーから） */
function notifyMorning() {
  if (MORNING_ENABLED) sendOnce_(ymd_(new Date()), 'morn');
  scheduleNext_();
}

/** 次の20時・9時に1回だけ動くトリガーを張り直す（GASの毎日トリガーは1時間幅でずれるため） */
function scheduleNext_() {
  ScriptApp.getProjectTriggers()
    .filter(t => ['notifyEvening','notifyMorning'].includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('notifyEvening').timeBased().at(nextAt_(EVENING_HOUR)).create();
  if (MORNING_ENABLED) ScriptApp.newTrigger('notifyMorning').timeBased().at(nextAt_(MORNING_HOUR)).create();
}
function nextAt_(hour) {
  const now = new Date();
  const s = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy-MM-dd');
  let t = new Date(s + 'T' + String(hour).padStart(2,'0') + ':00:00+09:00');
  if (t.getTime() <= now.getTime() + 60*1000) t = new Date(t.getTime() + 24*3600*1000);
  return t;
}

/** 保険：毎日1回、トリガーが消えていたら張り直す */
function watchdog() {
  const names = ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction());
  if (!names.includes('notifyEvening')) scheduleNext_();
}

/** 最初に1回だけ手動で実行 */
function setup() {
  scheduleNext_();
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'watchdog'))
    ScriptApp.newTrigger('watchdog').timeBased().everyDays(1).atHour(14).create();
}

/** LINEのWebhook：グループに招待されたらグループIDを保存して返信（返信は無料） */
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const props = PropertiesService.getScriptProperties();
  (body.events || []).forEach(ev => {
    if (ev.source && ev.source.type === 'group' && (ev.type === 'join' || ev.type === 'message')) {
      if (!props.getProperty('GROUP_ID')) {
        props.setProperty('GROUP_ID', ev.source.groupId);
        if (ev.replyToken) UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
          method: 'post', contentType: 'application/json', muteHttpExceptions: true,
          headers: { Authorization: 'Bearer ' + props.getProperty('LINE_TOKEN') },
          payload: JSON.stringify({ replyToken: ev.replyToken, messages: [{ type: 'text',
            text: 'ゴミ出し通知を設定しました🗑️\n収集日の前日' + EVENING_HOUR + '時にお知らせします。' }] }),
        });
      }
    }
  });
  return ContentService.createTextOutput('ok');
}

/** 動作確認：送らずに文面だけログに出す */
function previewTexts() {
  ['2026-11-10','2026-11-12','2026-11-13','2026-11-17','2026-09-29'].forEach(d => {
    Logger.log(d + ' 前日\n' + buildText_(d,'eve')); Logger.log(d + ' 当日\n' + buildText_(d,'morn'));
  });
}
/** 動作確認：今すぐグループに1回送る */
function testPush() { push_('【テスト】ゴミ出し通知のテストです。\n\n' + buildText_('2026-11-12','eve')); }
