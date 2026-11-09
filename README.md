# ゴミ出しLINE通知（SEKIYA.so前・別府市 令和8年度）

- `Code.gs` … Google Apps Script 本体（収集日データ込み）
- `schedule.json` … 収集日データ（PDFのセル色から抽出、曜日ルールと照合済み）
- `docs/` … GitHub Pages で公開する添付画像
- スクリプトプロパティ: `LINE_TOKEN`（チャネルアクセストークン）, `GROUP_ID`（招待時に自動保存）
- 年度更新: 新しいPDFから `SCHEDULE` と画像を差し替える（令和9年度は2027-04から）
