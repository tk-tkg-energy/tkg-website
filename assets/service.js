// サービス紹介ページの共通処理：メールアドレスのコピーと、その場で答えるチェックシート。
// チェックシートの回答はページ内だけで数え、どこにも送らない。
(function(){
  document.querySelectorAll('.copy-email').forEach(function(btn){
    btn.addEventListener('click', function(){
      var email = btn.getAttribute('data-email');
      var card = btn.closest('.contact-card');
      var note = card ? card.querySelector('.copy-note') : null;
      var done = function(text){ if(note){ note.textContent = text; } };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function(){ done('コピーしました: ' + email); }).catch(function(){ done(email); });
      } else {
        done(email);
      }
    });
  });

  var items = document.querySelectorAll('#checklist li:not(.grp)');
  var result = document.getElementById('check-result');
  if (!items.length || !result) return;
  var msg = window.SVC_CHECK_MESSAGES || {
    many: function(no){ return '「いいえ」が' + no + '問ありました。一度ご相談ください。'; },
    few: function(no){ return '「いいえ」は' + no + '問でした。'; }
  };
  var answers = new Array(items.length).fill(null);
  function render(){
    var answered = answers.filter(function(a){ return a !== null; }).length;
    var no = answers.filter(function(a){ return a === false; }).length;
    // メーター表示のあるページ（pilot-plant）では、回答数と「いいえ」の数も更新する
    var ring = document.getElementById('check-ring');
    if (ring) {
      ring.setAttribute('stroke-dasharray', (answered / items.length * 100) + ' 100');
      ring.classList.toggle('warn', no >= 3);
      document.getElementById('check-done').textContent = answered;
      document.getElementById('check-no').textContent = no;
    }
    if (answered < items.length) {
      result.textContent = answered + ' / ' + items.length + ' 問に回答済み（「いいえ」' + no + '問）';
      return;
    }
    result.textContent = no >= 3 ? msg.many(no) : msg.few(no);
  }
  items.forEach(function(li, i){
    var box = li.querySelector('.yn');
    [['はい', true], ['いいえ', false]].forEach(function(o){
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = o[0]; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function(){
        answers[i] = o[1];
        box.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
        render();
      });
      box.appendChild(b);
    });
  });
})();
