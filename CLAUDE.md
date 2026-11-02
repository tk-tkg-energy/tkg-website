# tkg-website

東京共同技術株式会社（TKG）のコーポレートサイト。ビルド工程のない静的HTML。公開URLは https://www.tkg-energy.com/ 。

## 構成
- ページ: `index.html`（トップ）, `owners-engineering.html`, `silica.html`, `security-policy.html`, `en.html`（英語版）
- 共通資産: `assets/`（CSS, JS, 画像）。`company.css` は生成物に近い圧縮CSSなので、手で大きく書き換えず、ページ別CSS（`bp-hero.css` など）で上書きする
- `sitemap.xml` / `robots.txt` はルート直下
- 配信基盤は未確認（`.gitignore` に `.wrangler/` あり。デプロイ設定はリポジトリ内に無い）。デプロイ手順を勝手に前提にしない

## 守るルール
- 社名は「東京共同技術株式会社」または「TKG」。「株式会社TKG」は使わない（現状0件。維持する）
- ページの内容を変えたら、`sitemap.xml` の該当ページの `lastmod` を同じ変更で更新する（`/` = index.html, `/en` = en.html など、拡張子なしのURL）
- 事業内容の表現は会社資料と合わせる。確定していない技術・実績は断定しない（例: もみ殻シリカは「ラボ検証準備」段階）
- 画像を差し替えたら、CSS/HTML側のURLに `?v=` を付けて版を上げる（過去にエッジキャッシュ残りで表示が古くなった）
- 新規画像は、ページで使う表示サイズの約2倍幅を上限にし、写真系は JPEG/WebP、PNG は透過が必要なものだけにする
- ヒーローは `bp-hero`（アニメーション）構成。`prefers-reduced-motion` への配慮を消さない
- 顧客名・見積金額・個人の連絡先など、公開してよいか不明な情報は載せない。迷ったら確認する

## 作業の流儀
- コミットメッセージは英語、1行目は命令形（既存履歴に合わせる）
- 指定ブランチで作業し、main への直接 push や PR 作成は依頼があったときだけ
- 変更後はブラウザで主要ページ（`/`, `/owners-engineering`, `/silica`, `/en`）をスマホ幅も含めて確認する
