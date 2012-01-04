/**
 * 마우스 이벤트 모듈
 */
J.module('mouseEvent', {
  
  $ps: null,
  
  /**
   * 최상위 엘리먼트에 click 이벤트를 바인딩한다.
   * @param {Element} wrapper
   */
  delegate: function (wrapper) {
    var t = this;
    document.documentElement.addEventListener('click', function (evt) {
      var target = evt.target;
      if (wrapper.contains(target)) {
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
  }
});
