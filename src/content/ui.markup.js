J.module('ui.markup', {

  /**
   * Simple JavaScript Templating
   * John Resig - http://ejohn.org/ - MIT Licensed
   * @param {string} str
   * @param {Object} data
   * @return {string}
   */
  tmpl: (function () {
    var cache = {};
        
    var tmpl = function tmpl(str, data) {
      // Figure out if we're getting a template, or if we need to
      // load the template - and be sure to cache the result.
      var fn = !/\W/.test(str) ? cache[str] = cache[str] || tmpl(str) : // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +
            
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
            
        // Convert the template into pure JavaScript
        str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") +
        "');}return p.join('');");
            
        // Provide some basic currying to the user
        return data ? fn(data) : fn;
      };
        
    return tmpl;
  }()),
  
  /**
   * markup template
   * @type {string}
   */
  _markup: [
    // header
    '<div id="endic_ext_header">',
      '<div class="endic_ext_endic">',
        '<a class="endic_ext_endic_main" href="http://endic.naver.com" target="_blank">네이버 영어사전</a>',
      '</div>',
  
      // toggle ee dic button
      '<% if (result.length > 0) { %>',
        '<div class="endic_ext_toggle_dic_type">',
          '<button nede-cmd="toggleDicType">한영/영영 전환</button>',
        '</div>',
      '<% } %>',
      // end toggle ee dic button
  
    '</div>',
    // end header

    // body
    '<div id="endic_ext_body">',
      // body wrapper
      '<div class="endic_ext_body_wrapper">',
  
      // words
      '<% for (var i = 0; i < result.length; i++) { %>',
        '<% var word = result[i]; %>',

        // word title
        '<h3>',
          '<strong><a href="<%= word.url %>" class="endic_ext_title" target="_blank"><%= word.title %></a></strong>',
          '<sup class="endic_ext_number"><%= word.number %></sup>',
          '<span class="endic_ext_phonetic_symbol"><%= word["phonetic_symbol"] %></span>',
    
          // audio button
          '<% if (word.pronunciation) { %>',
            '<button id="endic_ext_audio_btn_<%= i %>" class="endic_ext_play_audio_btn" nede-cmd="playAudio" nede-cmd-value="<%=i %>">Play Audio</button>',
            '<audio id="endic_ext_audio_<%= i %>" src="<%= word.pronunciation %>"></audio>',
          '<% } %>',
          // end audio button
        
        '</h3>',
        // end word title

        // word meanings
        '<% for (var j = 0; j < word.meanings.length; j++) { %>',
          '<% var meaning = word.meanings[j]; %>',

          // meaning
          '<div class="endic_ext_meaning">',
            '<h4 class="type"><%= meaning.type %></h4>',

            // meaning definitions
            '<% for (var k = 0; k < meaning.definitions.length; k++) { %>',
              '<% var definition = meaning.definitions[k]; %>',

              // definition
              '<div class="endic_ext_defs">',
                '<div class="endic_ext_definition"><%= definition.def %></div>',
                '<div class="endic_ext_ex_en"><%= definition["ex_en"] %></div>',
                '<div class="endic_ext_ex_kr"><%= definition["ex_kr"] %></div>',
              '</div>',
              // end definition

            '<% } %>',
            // end meaning definitions

            // more definition 
            '<% if (meaning.moreDefinition.count > 0) { %>',
              '<div class="endic_ext_moreDefinition">',
                '<a href="<%= meaning.moreDefinition.url %>" target="_blank"><%= meaning.moreDefinition.count %>개 뜻 더보기</a>',
              '</div>',
            '<% } %>',
            // end more definition

          '</div>',
          // end meaning

        '<% } %>',
        // end word meanings
    
      '<% } %>',
      // end words

      // if no result
      '<% if (result.length === 0) { %>',
        '<div class="endic_ext_noresult"><span class="endic_ext_keyword">\'<%= query %>\'</span>에 대한 검색 결과가 없습니다.</div>',
      '<% } %>',
      // end if no result

      '</div>',
      // end body wrapper
  
    '</div>',
    // end body

    // footer
    '<div id="endic_ext_footer">',
  
      // guide area
      '<div class="endic_ext_guide_group">',
        '<button class="endic_ext_show_shortcut_guide_btn" nede-cmd="showShortcutGuide">단축키 도움말</button>',
      '</div>',
      // end guide area
  
      // shortcut guide
      '<div id="endic_ext_shortcut_guide">',
        '<ul>',
          '<li><strong>s</strong> : 한영/영영 전환(Switch dictionary)</li>',
          '<li><strong>a</strong> : 발음듣기(Audio)</li>',
          '<li><strong>g</strong> : 현재 단어의 영어사전 페이지로 이동(Go to)</li>',
          '<li><strong>c</strong> : 닫기(Close)</li>',
          '<li><strong>h</strong> : 단축키 도움말(Help)</li>',
        '</ul>',
      '</div>',
      // end shortcut guide
  
    '</div>'
    // end footer 
  ].join(""),
  
  /**
   * print template to target element
   * @param {Element} target
   * @param {Object} data
   */
  print: function (target, data) {
    target.innerHTML = this.tmpl(this._markup, data);
  }
});
