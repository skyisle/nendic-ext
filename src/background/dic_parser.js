/**
 * 단어 제목(h3)과 타입별 의미(.box_a)이 쌍으로 존재한다.
 * 단어에 대한 타입이 추가 정의 되어 있을 경우, box_a와 같은 레벨로 box_b, box_c가 존재한다.
 */
var DicParser = (function () {

  var _wrapper = null,
    _words = null,
    _meanings = null;

  function initialize(elWrapper) {
    _wrapper = $("<div>");
  }

  function createDom(html) {
    _wrapper.html(html);
    _words = _wrapper.find("h3");
    _meanings = _wrapper.find(".box_a");
  }

  function parseHtmlToData() {
    var datas = [],
      i,
      wordData,
      len = _words.length;

    for (i = 0; i < len; i++) {
      WordParser.initialize(_words.get(i));
      MeaningParser.initialize(_meanings.get(i));

      wordData = WordParser.parse();
      wordData.meanings = MeaningParser.parse();

      datas.push(wordData);
    }

    // for debugging parsed data (important debugging point)
    // console.log(datas);

    return { "result": datas };  
  }

  return {
    initialize: function (elWrapper) {
      initialize(elWrapper);
    },
    parse: function (html) {
      createDom(html);
      return parseHtmlToData();
    }
  };

}());


/**
 * 단어의 제목 부분을 파싱한다.
 */
var WordParser = (function () {

  var _wrapper = null;

  function initialize(elWrapper) {
    _wrapper = $(elWrapper);
  }

  function parseHtmlToData() {
    var data = {
      "title": Util.find(_wrapper, ".t1 strong", "text")
	  		|| Util.find(_wrapper, ".t1 a", "text"),
      "number": Util.find(_wrapper, ".t1 sup", "text"),
      "url": Util.find(_wrapper, ".t1 a", "href"),
      "phonetic_symbol": Util.find(_wrapper, ".t2", "text"),
	  "pronunciation": Util.find(_wrapper, "#pron_en", "playlist")
    };   
    return data; 
  }

  return {
    initialize: function (elWrapper) {
      initialize(elWrapper);
    },
    parse: function () {
      return parseHtmlToData();
    }
  };

}());


/**
 * 단어의 타입별 의미 부분을 파싱한다.
 */
var MeaningParser = (function () {

  var _wrapper = null,
    _current = null;

  function initialize(elWrapper) {
    _wrapper = $(elWrapper);
  }

  function parseHtmlToData() {
    var datas = [],
      current = _wrapper;

    getCurrentDataAndTryNext(datas, current);

    return datas;
  }

  function getCurrentDataAndTryNext(datas, current) {
    if (current.hasClass("box_a")
        || current.hasClass("box_b")
        || current.hasClass("box_c")) {
      
      datas.push(getData(current));
      getCurrentDataAndTryNext(datas, current.next());
    }
  }

  /**
   * 한 단어는 여러 타입을 가질 수 있다.
   * 예) 동사, 명사, ...
   */
  function getData(current) {
    var data = {
      "type": Util.find(current, "h4 .fnt_k28", "text"),
      "definitions": getDefinitions(current),
      "moreDefinition": getMoreDefinition()
    };
    
    return data;
  }

  /**
   * 각 타입에는 여러 의미가 있을 수 있다.
   * 각 의미의 마크업 구조
   *   dt : 의미
   *   dd : 샘플 문장
   *   dd : 샘플 해석
   */
  function getDefinitions(current) {
    var datas = [];
    var defs = current.find(".list_ex1 dt"); // 의미 

    defs.each(function () {
      var el = $(this);
      if (el.hasClass("last")) { // 뜻 더보기
        return;
      }

      var def = Util.find(el, "", "text"),
        ex_en = el.next().is("dd") ? Util.find(el.next(), "", "text") : "",
        ex_kr = el.next().next().is("dd") ? Util.find(el.next().next(), "", "text") : "";

      datas.push({
        "def": def,
        "ex_en": ex_en,
        "ex_kr": ex_kr 
      });
    });

    return datas;
  }

  /**
   * 여러 뜻이 있을 경우, 더보기를 가져온다.
   */
  function getMoreDefinition() {
    var more = _wrapper.find("dt.last");
    return {
      "count": Util.find(more, ".fnt_k14", "text"),
      "url": Util.find(more, ".fnt_k22 a", "href")
    };
  }

  return {
    initialize: function (elWrapper) {
      initialize(elWrapper);
    },
    parse: function () {
      return parseHtmlToData();
    }
  };

}());



var Util = {
  "find": function (parent, selector, type) {
    var target = selector ? parent.find(selector) : parent,
      host = "http://endic.naver.com";
    
    if (type === "text") {
      return target.text().trim();

    } else if (type === "href") {
      var href = target.attr("href") || "";
      if (href) {
        href = host + href; 
      }
      return href;
	   
    } else {
	  var attr = target.attr(type) || "";
	  return attr;
	}
  }
};

