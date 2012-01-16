/**
 * 사운드 재생을 위한 모듈
 */
J.module('ui.audio', {
  /**
   * 오디오를 재생한다.
   * @param {number} audioIdx 오디오 버튼의 인덱스
   */
  play: function (audioIdx) {
    audioIdx = audioIdx || 0; 
    
    var audio = document.getElementById('endic_ext_audio_' + audioIdx),
      button = document.getElementById('endic_ext_audio_btn_' + audioIdx);
    
    // 오디오 버튼이 없을 경우 재생하지 않는다.
    if ( ! audio) { return; }
    
    this.bindAudioEventIfNot(audio, button);   
        
    audio.play();
  },
  
  /**
   * 이벤트가 바인드 되어 있지 않을 경우, 바인드 한다.
   * 오디오 재생 상태에 따라 아이콘을 변경한다.
   * binded 속성 여부로 바인딩 여부를 구분한다.
   * @param {Element} audio 오디오 엘리먼트
   * @param {Element} button 재생 버튼
   */
  bindAudioEventIfNot: function (audio, button) {
    if (audio.getAttribute('binded')) {
      return;
    }
    
    audio.addEventListener('playing', function () {
      button.className = button.className + ' on';
    }, false);
            
    audio.addEventListener('ended', function(){
      button.className = button.className.replace(/on/g, '');
      audio.pause(); // 재생이 종료되면 pause 상태로 만든다.
    }, false);
            
    audio.setAttribute('binded', true);
  }
});
