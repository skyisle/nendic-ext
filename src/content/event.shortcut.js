/**
 * 단축키 모듈
 */
J.module('event.shortcut', {

  $ps: null,
    
  init: function () {
    this.bindKeyEvent();
  },
    
  bindKeyEvent: function () {
    var t = this,
      ps = t.$ps;
      
    // keydown일 경우, 한글일 때 키코드를 정확하게 찾지 못하는 버그가 있다.
    // keyup 이벤트를 할당한다.
    document.documentElement.addEventListener('keyup', function (evt) {
      switch (evt.keyCode) {
      case 67: // c
      case 27: // esc
        ps.publish('shortcut.close', { when: 'all' });
        break;
                    
      case 83: // s
        ps.publish('shortcut.toggleDicType', { when: 'opened' });
        break;
                    
      case 71: // g
        ps.publish('shortcut.goToDictionaryPage', { when: 'opened' });
        break;
                    
      case 72: // h
        ps.publish('shortcut.showShortcutGuide', { when: 'opened' });
        break;
                    
      case 65: // a
        ps.publish('shortcut.playAudio', { when: 'all' });
        break;
                    
      case 191: // /(slash)
        break;
      }
            
    });
  }
});
