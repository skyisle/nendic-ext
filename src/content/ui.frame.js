/**
 * 모듈 메인
 * 
 * 프레임별로 각각 모든 스크립트가 로드된다.
 * 프레임셋으로 나뉜 페이지일 경우 로드할 수 없기 때문이다.
 * 
 * 사전을 보여줄 프레임을 판단하는 기준은 아래와 같다.
 * 1. document.body가 존재해야 한다. (frameset으로 나뉜 페이지는 피한다)
 * 2. 스크립트가 초기화된 프레임 중 사이즈가 가장 큰 것으로 판단한다.
 * 
 * 프레임을 초기화하는 시점은 '마우스 클릭이 발생했을 때'이다.
 *
 * - 프레임 테스트 사이트: http://addyosmani.com/scalablejs/
 * - http://goo.gl/rvhDA
 */
J.module('ui.frame', {

  $util: null,
  
  $ps: null,

  __extension: null,
  
  _bActivated: false,
  
  _id: null,
  
  init: function () {
    this._id = this.$util.guid();
    
    this.initFrameActivateEvent();
  },
  
  /**
   * 프레임을 활성화하는 이벤트를 초기화한다.
   */
  initFrameActivateEvent: function () {
    this.checkFrameOnMousedown();
    this.subscribeFrameActivatedMessage();
    this.subscribeNeedFrameInfoMessage();
  },
  
  /**
   * 마우스 클릭 시 현재 프레임이 활성화 대상 목록에 존재하는지 확인하는 요청을 보낸다.
   */
  checkFrameOnMousedown: function () {
    var t = this;
    document.documentElement.addEventListener('mousedown', function (evt) {
      t.__extension.request('checkFrameExist', t._id);
    });  
  },
  
  /**
   * 프레임이 활성화되었다는 메세지를 받는다.
   * 활성화된 프레임 아이디가 전달되며, 현재 프레임이 활성화된 것이 아닐 경우, 비활성화 시킨다.
   */
  subscribeFrameActivatedMessage: function () {
    var t = this;
    this.$ps.subscribe('extension.frameActivated', function (data) {
      var sId = data;
      t._bActivated = (t._id === sId);
    });    
  },
  
  /**
   * 탭에서 프레임 정보를 확인할 수 없는 경우, 모든 프레임에 정보를 요청한다.
   * 메세지를 받으면 현재 프레임 정보를 익스텐션으로 보낸다.
   */
  subscribeNeedFrameInfoMessage: function () {
    var t = this,
      doc = document.documentElement;
      
    this.$ps.subscribe('extension.needFrameInfo', function (data) {
      // frameset 인 경우 패스한다.
      if (!document.body) { return; }

      // 익스텐션에 모듈이 초기화 됐음을 알린다.
      t.__extension.request('init', {
        id: t._id,
        width: doc.offsetWidth,
        height: doc.offsetHeight 
      });
    });    
  },
  
  /**
   * @return {boolean} 현재 프레임의 활성화 여부
   */
  isActivatedFrame: function () {
    return this._bActivated;
  }
});
