
module("nede core", {
	setup: function () {
		window._resultA = null;
		window._resultB = null;

		nede.module("A", function () {
			
			nede.subcribe(this, "/A/msgA", function () {
				_resultA = "A received";
			});
			
			return {
				init: function () {
					_resultA = "A inited";
				},
				
				createMsg: function () {
					nede.publish("/A/msgA");
				}
			};
		});
		
		nede.module("B", function () {
			nede.subcribe(this, "/A/msgA", function () {
				_resultB = "B received";
			});
			
			return {
				init: function () {
					_resultB = "B inited";
				}
			};
		});
		
		nede.init();
	},
	teardown: function () {
		nede.destroy();
	}
});


test("모듈을 생성한다.", function() {
	equals(typeof nede.get("A"), "object", "객체가 생성된다.");
	equals(typeof nede.get("B"), "object", "객체가 생성된다.");
});

test("모듈의 초기화 함수가 호출된다.", function() {
	equals(_resultA, "A inited");
	equals(_resultB, "B inited");
});

test("메세지를 보내고 받을 수 있다.", function() {
	nede.get("A").createMsg();
	
	equals(_resultA, "A received", "A는 메세지를 받는다.");
	equals(_resultB, "B received", "B에도 정의되어 있으므로 메세지를 받는다.");
});
