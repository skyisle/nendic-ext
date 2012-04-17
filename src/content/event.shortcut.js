/**
 * 단축키 모듈
 */
J.module('event.shortcut', {

  $ps: null,
    
  _doing: false,
    
  _timeLimit: 1000,
    
  _timer: null,
    
  init: function () {
    this.bindKeyEvent();
  },
    
  bindKeyEvent: function () {
    var t = this,
      ps = t.$ps;
      
    // keydown일 경우, 한글일 때 키코드를 정확하게 찾지 못하는 버그가 있다.
    // keyup 이벤트를 할당한다.
    document.documentElement.addEventListener('keyup', function (evt) {
      t.process(evt.keyCode);
      
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

      default:
        break;
      }
            
    });
  },
    
  /**
   * 텍스트를 선택하고 fd 키를 연속(1초 이내)으로 클릭하면,
   * 검색을 요청하는 메세지를 보낸다.
   * (fd = find dictionary)
   * @param {number} keyCode
   */
  process: function (keyCode) {
    var t = this;
    if (this._doing === false && keyCode === 70) { // 최초에 f 키를 누른다.
      this._doing = true;
            
      this._timer = setTimeout(function () {
        t._doing = false;
        t._timer = null;
      }, this._timeLimit);
    } else if (this._doing === true) {
      if(keyCode === 68) { // 연속으로 d 키를 누른다. d가 아니면 정리한다.
        var selectionText = this.getSelectedText();
        if (selectionText) {
          this.$ps.publish('shortcut.search', {
            when: 'all',
            value: selectionText
          });
        }
      }
      
      this._doing = false;
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    }
  },
  
  /**
   * 현재 선택한 문자열을 가져온다.
   * @return {string}
   */
  getSelectedText: function () {
    return window.getSelection().toString().trim();
  }
});
