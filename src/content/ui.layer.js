/**
 * UI를 구성하는 모듈
 */
J.module('ui.layer', {

  $ps: null,

  __frame: null,
  
  __markup: null,
  
  _wrapper: null,
    
  init: function(){
    this.createWrapperElement();
  },
  
  /**
   * 사전을 표시할 래퍼 엘리먼트를 생성한다.
   */
  createWrapperElement: function () {
    var el = document.createElement('div');
    el.id = 'endic_ext_wrapper';
        
    if (document.body) {
      document.body.appendChild(el);
    }
        
    this._wrapper = el;
  },
  
  /**
   * 검색된 결과로 사전을 연다.
   * @param {Object} data
   */
  open: function (data) {
    // 검색 결과는 활성화되어 있는 프레임에서만 보여준다.
    if ( ! this.__frame.isActivatedFrame()) { return; }
        
    if (data) {
      this.__markup.print(this._wrapper, data);
    }
    
    this._wrapper.style.display = 'block';
  },
    
  close: function () {
    this._wrapper.style.display = 'none';
    this._wrapper.innerHTML = '';
  },
  
  /**
   * 사전이 열려있는가?
   * @return {boolean}
   */
  isOpened: function () {
    return this._wrapper.style.display === 'block';
  },
  
  /**
   * 단축키 도움말을 연다.
   */
  showShortcutGuide: function () {
    var guide = document.getElementById('endic_ext_shortcut_guide');
    if (guide) {
      guide.style.display = 'block';
    }
  },
  
  /**
   * 사전 페이지로 이동한다.
   */
  goToDictionaryPage: function () {
    var link = document.querySelector('#endic_ext_wrapper .endic_ext_title');
    if (link) {
      window.open(link.getAttribute('href'));
    }
  } 
});
