/**
 * 전반적인 액션의 퍼사드 역할을 하는 모듈.
 */
J.module('command', {

  $ps: null,

  $ui: null,
  
  $audio: null,
  
  $extension: null,
    
  init: function () {
    this.initSubscriber();
  },
  
  initSubscriber: function() {
    this.subscribeMouseEventMessage();
    this.subscribeShorcutMessage();
    this.subscribeExtensionMessage();
  },
  
  /**
   * 마우스 메세지를 받아 해당 명령을 익스텐션에 요청한다.
   */
  subscribeMouseEventMessage: function () {
    var t = this;
    this.$ps.subscribe('mouseEvent.*', function (data, topic) {
      var cmd = topic.split('.')[1];
      t.$extension.request(cmd, data);
    });    
  },
  
  /**
   * 단축키 메세지를 받아 해당 명령을 익스텐션에 요청한다.
   */
  subscribeShorcutMessage: function () {
    var t = this;
    /*
     * @param {!Object.{when: string, value: Object}} data
     * @param {string} topic
     */
    this.$ps.subscribe('shortcut.*', function (data, topic) {
      var cmd = topic.split('.')[1],
        when = data.when, // 'all' or 'opened'
        value = data.value;
      
      if (when === 'opened' && t.$ui.isOpened() === false) {
        return;
      }
      t.$extension.request(cmd, value);
    });    
  },
  
  /**
   * 익스텐션의 메세지를 받아 command의 메서드를 수행한다.
   * 모든 프레임에 명령을 전달하기 위해, 모든 요청은 익스텐션을 통해 전달한다.
   * 마우스 또는 단축키 ---> command 모듈 ---> extension ---> command 모듈 ---> 동작.
   */
  subscribeExtensionMessage: function () {
    var t = this;
    this.$ps.subscribe('extension.*', function (data, topic) {
      var cmd = topic.split('.')[1];
      if (typeof t[cmd] === 'function') {
        t[cmd](data);
      }
    });    
  },
  
  /**
   * 결과를 보여준다.
   */
  showResult: function (data) {
    this.$ui.open(data);
  },
  
  /**
   * 사전을 닫는다.
   */
  close: function () {
    this.$ui.close();
  },
  
  /**
   * 사전 서비스 페이지로 이동한다.
   */
  goToDictionaryPage: function() {
    this.$ui.goToDictionaryPage();
  },
  
  /**
   * 단축키 가이드를 보여준다.
   */
  showShortcutGuide: function() {
    this.$ui.showShortcutGuide();
  },
  
  /**
   * 오디오를 재생한다.
   */
  playAudio: function(audioIdx) {
    this.$audio.play(audioIdx);
  }
});
