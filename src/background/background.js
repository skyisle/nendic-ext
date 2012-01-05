/**
 * Naver English Dictionary Chrome Extension
 * Background Script
 *
 * @author ohgyun@gmail.com
 */
var NendicExt = (function () {

  var __parser = null,
    _recentQuery = "";

  function createContextMenu() {
    chrome.contextMenus.create({
      "title": "네이버 영어사전에서 '%s' 검색",
      "contexts": ["selection"],
      "onclick": function (info) {
        searchWord(info.selectionText);
      }
    });
  }
  
  /**
   * 단어를 검색한다.
   * @param {string} query
   */
  function searchWord(query) {
    var url = "http://endic.naver.com/searchAssistDict.nhn?query=" + query;
      _recentQuery = query;
    
    $.ajax({
      url: url,
      crossDomain: false, // chrome extension makes request to same domain
      dataType: "html", // searched result is html type
      success: function (data) {
        showResult(data, query);
      }
    });
  }

  /**
   * 결과에 대한 응답을 보낸다.
   * @param {?Object} data
   * @param {string} query
   */
  function showResult(data, query) {
    var parsedData = __parser.parse(data);
    parsedData.query = query; // 데이터에 쿼리를 포함해 응답한다.
    
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.sendRequest(tab.id, {
        "command": "showResult",
        "data": parsedData
      });
    });
  }

  /**
   * 익스텐션으로 오는 요청 처리를 위한 핸들러를 등록한다.
   */
  function bindRequestEventListener() {
    chrome.extension.onRequest.addListener(
      function (request, sender, sendResponse) {
        var command = request.command,
          data = request.data,
          tabId = sender.tab.id;
        
        if (command) {
          doAction(command, data, tabId);
        }
      
        sendResponse({});
      }
    );
  }
  
  /**
   * 커맨드에 해당하는 액션을 수행한다.
   * NendicExt.action 목록에 커맨드가 있을 경우 수행하고,
   * 없는 경우 받은 명령을 응답으로 돌려보낸다. (단순히 익스텐션을 통해 명령을 포워딩하는 목적)
   *
   * @param {string} command
   * @param {*} data
   * @param {string} tabId 호출된 탭의 아이디
   */
  function doAction(command, data, tabId) {
    var action = NendicExt.action[command];
    if (typeof action === "function") {
      action(data, tabId);
      
    } else {
      // 해당하는 명령이 없을 경우 그대로 보낸다.
      chrome.tabs.sendRequest(tabId, {
        "command": command,
        "data": data
      });
    }
  }
  
  return {
    initialize: function () {
      createContextMenu();
      bindRequestEventListener();
    },
    setParser: function (parser) {
      __parser = parser;
    },
    searchWord: function (query) {
      searchWord(query);
    },
    searchWordWithRecentQuery: function () {
      searchWord(_recentQuery);
    }
  };

}()); 

/**
 * 프레임 처리 모듈
 * 요청한 프레임이 탭 내에서 활성화된 프레임인지 판단한다.
 * 판단 기준: 탭 내에서 사이즈가 가장 큰 프레임.
 * 
 */
NendicExt.frame = {
  /**
   * currentMap (object)
   *   tabId (string): frames (object)
   *   
   * frames
   *   activated (object) activated frame data
   *   list (array) current frame list
   *   
   * activated
   *   id (string) frame id
   *   width (string) frame width
   *   height (string) frame height
   */
  map: {},
  
  /**
   * try to set data of current frame
   * 
   * @param data (object)
   *   id (string) frame id
   *   width (string) frame width
   *   height (string) frame height
   * @param tabId (string)
   */
  initFrame: function(data, tabId) {
    var frames = this.map[tabId];
    
    if (!frames) {
      frames = {
        activated: null,
        list: []
      };
    }
    
    // 활성화할 프레임 결정
    if (frames.activated) {
      var currentSize = frames.activated.width * frames.activated.height,
        newSize = data.width * data.height;
      
      if (newSize > currentSize) {
        frames.activated = data;
      }
      
    } else {
      frames.activated = data;
    }
    
    // 리스트에 추가
    frames.list.push(data.id);
    
    this.map[tabId] = frames;
    
    
    chrome.tabs.sendRequest(tabId, {
      "command": "frameActivated",
      "data": frames.activated.id
    });
    
  },
  
  /**
   * 현재 프레임이 존재하지 않으면, 프레임을 리셋한다.
   */
  checkFrameExist: function(data, tabId) {
    var frameId = data;
    
    if (this.isNotExist(frameId, tabId)) {
      this.resetFrame(tabId);
    }
  },
  
  /**
   * 탭 내 프레임 목록에 요청한 프레임 아이디가 존재하는지 확인한다.
   */
  isNotExist: function (frameId, tabId) {
    var frames = this.map[tabId];
    
    if (!frames) { return true; }
    
    var frameList = frames.list;
    
    for (var i = 0, len = frameList.length; i < len; i++) {
      if (frameList[i] === frameId) {
        return false;
      }
    }
    
    return true;
  },
  
  /**
   * 프레임 정보를 리셋하고, 컨텐츠에 프레임 정보 초기화 메세지를 보낸다.
   */
  resetFrame: function(tabId) {
    delete this.map[tabId];
    
    chrome.tabs.sendRequest(tabId, {
      "command": "needFrameInfo"
    }); 
  },
  
};

NendicExt.action = {
  /** 
   * 활성화 한다
   */
  "init": function (data, tabId) {
  NendicExt.frame.initFrame(data, tabId); 
  },
  
  "checkFrameExist": function (data, tabId) {
    NendicExt.frame.checkFrameExist(data, tabId);
  },
  
  "close": function (data) {
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.sendRequest(tab.id, {
        "command": "close"
      });
    });      
  },
  
  /**
   * 한영/영영 사전을 전환한다.
   * 쿠키에 isOnlyViewEE 값을 Y로 설정하면 영영사전으로 응답이 온다.
   */
  "toggleDicType": function (data) {
    var url = "http://endic.naver.com/searchAssistDict.nhn",
      cookieName = "isOnlyViewEE";
    
    // 1. 쿠키를 가져오는 것이 완료되면, 
    chrome.cookies.get({
      "url": url,
      "name": cookieName
      
    }, function (cookie) {
      // 2. 쿠기값을 확인해 변경할 값을 정하고,
      var toggledValue;
      
      if (cookie === null || cookie.value === "N") {
        toggledValue = "Y";
      } else {
        toggledValue = "N";
      }
      
      // 3. 선택된 쿠키를 삭제한 후, (fix: Mac OS에서 쿠키가 삭제되지 않고 append 되는 문제)
      chrome.cookies.remove({
        "url": url,
        "name": cookieName,
      }, function () {
        // 4. 쿠키를 다시 셋팅하고 검색 요청을 보낸다.
        chrome.cookies.set({
          "url": url,
          "name": cookieName,
          "value": toggledValue
        }, function (cookie) {
          NendicExt.searchWordWithRecentQuery();
        });
      });
      
    });
  },
  
  "search": function (data) {
    NendicExt.searchWord(data);
  }
};
