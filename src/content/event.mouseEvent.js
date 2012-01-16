/**
 * 마우스 이벤트 모듈
 */
J.module('event.mouseEvent', {
  
  $ps: null,
  
  _wrapper: null,
  
  init: function () {
    this.initClickEventOfWrapper();
    this.initDoubleClickEvent();
  },
  
  /**
   * 최상위 엘리먼트에 click 이벤트를 바인딩한다.
   * @param {Element} wrapper
   */
  initClickEventOfWrapper: function (wrapper) {
    var t = this;
    document.documentElement.addEventListener('click', function (evt) {
      var target = evt.target;
      
      if (t.isClickedOnWrapper(target)) {
        t.doAction(target);
        return;
      }
            
      // 여러 개의 프레임으로 나뉘어진 페이지의 경우,
      // 다른 프레임을 클릭하면 현재 프레임의 레이어가 닫기지 않는 문제가 있다.
      // 따라서, 사전 외부 영역 클릭 시, 페이지를 닫도록 메세지를 보낸다.
      t.$ps.publish('mouseEvent.close');
    }, false);
  },
  
  /**
   * wrapper 엘리먼트 내에서 클릭된 것인가?
   * @param {Element} target
   * @return {boolean}
   */
  isClickedOnWrapper: function (target) {
    var wrapper = this.getWrapper();
    
    if (wrapper && wrapper.contains(target)) {
      return true;  
    }
    
    return false;
  },
  
  getWrapper: function () {
    if (this._wrapper) {
      return this._wrapper; 
    }
    
    var wrapper = document.getElementById('endic_ext_wrapper');
    if (wrapper) {
      this._wrapper = wrapper; 
    }
    
    return wrapper;
  },
  
  /**
   * wrapper 엘리먼트에 delegate로 할당된 이벤트를 처리한다.
   * 이벤트가 발생한 엘리먼트에 'nede-cmd' 속성이 있을 경우,
   * .command.(nade-cmd) 형태의 메세지를 퍼블리시한다.
   * @param {Element} target
   */
  doAction: function (target) {
    var command = target.getAttribute('nede-cmd'),
      value = target.getAttribute('nede-cmd-value');
      
    if (command) {
      this.$ps.publish('mouseEvent.' + command, value);
    }
  },
  
  /**
   * 더블클릭으로 사전을 열 수 있도록 한다.
   */
  initDoubleClickEvent: function () {
    var t = this;
    document.documentElement.addEventListener('dblclick', function (evt) {
      var target = evt.target,
        selectionText = t.getSelectedText();
        
      if (t.isValidTarget(target) && selectionText) {
        t.$ps.publish('mouseEvent.search', selectionText);
      }
    });
  },
  
  /**
   * 유효한 대상인가?
   * @param {Element} target
   * @return {boolean}
   */
  isValidTarget: function (target) {
    var reg = /(input|textarea)/i,
      tagName = target.tagName;
      
    if (reg.test(tagName)) {
      return false; 
    }
    
    return true;
  },
  
  /**
   * 현재 선택한 문자열을 가져온다.
   * @return {string}
   */
  getSelectedText: function () {
    return window.getSelection().toString().trim();
  }  
});
