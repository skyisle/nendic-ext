
// define chrome extension mock
if (typeof chrome === "undefined") {
    window.chrome = {};
}
chrome.extension = {
    sendRequest: function(){
    },
    onRequest: {
        addListener: function(){
        }
    }
};
