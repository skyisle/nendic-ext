/**
 * 익스텐션과 통신하는 모듈
 */
J.module('ui.extension', {
  
  $ps: null,
  
  init: function () {
    var t = this;
    chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
      var command = request.command,
        data = request.data;

      t.$ps.publish('extension.' + command, data);
      
      sendResponse({});
    });
  },
  
  /**
   * 익스텐션으로 요청을 보낸다.
   * @param {string} command 
   * @param {*=} data 요청 데이터
   */
  request: function (command, opt_data) {
    chrome.extension.sendRequest({
      'command': command,
      'data': opt_data
    });
  }
});
