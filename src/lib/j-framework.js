/**
 * j-framework
 * 
 * j-framework is a simple javascript framework.
 * The important point of this framework is clarifying dependencies between modules.
 *
 * @author ohgyun@gmail.com
 * @version 0.1
 */
if (!window.J) window.J = {

  _modules: {},
 
  /**
   * define module
   * @param name (string) module name. 'name' property of obj is setted by this name.
   * @param obj (object) object. obj is not function.
   */
  module: function (name, obj) {
    obj.name = name;
    this._modules[name] = obj;
  },

  /**
   * init framework.
   * inject module dependency and init each module.
   */
  init: function () {
    this.module('core', this);
    this.injectDependency();
    this.initModules();
  },

  /**
   * Inject module dependency to variables that start with '$'.
   * e.g. if object has $some variable, module 'some' is assigned to $some.
   */
  injectDependency: function () {
    var t = this;
    t.eachModule(function (name, obj) {
      t.eachProperty(obj, function (k, v) {
        if (k.substring(0, 1) === '$') {
          var refName = k.substring(1);
          this[k] = t.get(refName);
        }
      });
    });
  },

  /**
   * @param callback(name, obj)
   */
  eachModule: function (callback) {
    var ms = this._modules;
    this.eachProperty(ms, callback);
  },

  /**
   * Do callback for each property
   * @param obj
   * @param callback(k, v)
   */
  eachProperty: function (obj, callback) {
    var k, v;
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        v = obj[k];
        callback.call(obj, k, v);
      }
    }
  },
  
  /**
   * Do callback for each array
   * @param arr
   * @param callback(i, v)
   */
  each: function (arr, callback) {
    var i, v, len = arr.length;
    for (i = 0; i < len; i++) {
      v = arr[i];
      callback.call(arr, i, v);
    }
  },  

  /**
   * get module by name
   */
  get: function (name) {
    return this._modules[name];
  },

  /**
   * init method of each module is called
   */
  initModules: function () {
    this.eachModule(function (name, obj) {
      if (typeof obj.init === 'function' && name !== 'core') {
        obj.init();
      }
    });
  },

  /**
   * destroy module
   * @param name name[, name, ...]
   */
  destroy: function () {
    var args = Array.prototype.slice.call(arguments),
      modules = this._modules;
      
    this.each(args, function (i, v) {
      var module = modules[v];
      if (module && typeof module.destroy === 'function') {
        module.destroy(); 
      }
      delete modules[v];
    });
  },
  
  /**
   * Create random unique id
   */
  guid: function () {
    return 'j' + (Math.random() * (1 << 30)).toString(32).replace('.', '');
  }
};
/**
 * call async init function if script downloaded
 */
window.setTimeout(function () {
  if (window.jAsyncInit && !window.jAsyncInit.hasRun) {
    window.jAsyncInit.hasRun = true;
    window.jAsyncInit();
  }
}, 0);


/**
 * Pub/Sub Module
 */
J.module('ps', {

  $core: null,

  /**
   * Subscribers map.
   * e.g. If you subscribe 'some.one.*' and 'some.two',..
   * {
   *   some: {
   *     one: {
   *       *: {
   *         callbackId: callback
   *       }
   *     }
   *   },
   *   two: {
   *     callbackId: callback
   *   }
   * }
   */
  _subscribersMap: {},

  /**
   * Subscribe topic.
   * You can seperate topics by dot(.), and subscribe all topics using asterisk(*).
   * e.g. 'some.topic.*'
   *
   * @param topic string or *
   * @param callback(data, topic)
   * @return subscribed callback id
   */
  subscribe: function (topic, callback) {
    var callbackId = this.$core.guid();
    
    this.eachSubscriberMapDepth(topic, function (n, m, map, isLast) {
      if (isLast) {
        m[callbackId] = callback; 
      }
    });

    return callbackId;
  },  
  
  /**
   * Do callback for each subscribers map depth
   *
   * @param topic
   * @param callback(n, m, map, isLast)
   *           n (string) depth name
   *           m (object) current map
   *           map (object) parent map
   *           isLast (boolean) is last depth
   */
  eachSubscriberMapDepth: function (topic, callback) {
    var map = this._subscribersMap,
      topics = topic.split('.'),
      len = topics.length,
      n, m;
    
    for (var i = 0; i < len; i++) {
      n = topics[i];
      m = map[n] = (map[n] || {});
            
      callback(n, m, map, i + 1 === len); 
      
      map = m;
    }
  },

  /**
   * Unsubscribe specific callback
   */
  unsubscribe: function (topic, callbackId) {
    this.eachSubscriberMapDepth(topic, function (n, m, map, isLast) {
      if (isLast) {
        delete m[callbackId]; 
      }
    });
  },

  /**
   * Publish topic with data
   * @param topic (string) The topic has seperator dot('.'), and does not recommand include '*'.
   * @param data (object)
   */
  publish: function (topic, data) {
    var t = this,
      runCallback = function (m) {
        t.$core.eachProperty(m, function (k, v) {
          if (typeof v === 'function') {
            v(data, topic);
          }
        });
      };
    
    this.eachSubscriberMapDepth(topic, function (n, m, map, isLast) {
      runCallback(map['*']);
      
      if (isLast) {
        runCallback(m);
      }
    });
  },  

  /**
   * Remove subscribers of specific topic
   */
  clear: function (topic) {
    this.eachSubscriberMapDepth(topic, function (n, m, map, isLast) {
      if (isLast) {
        delete map[n];  
      }
    });
  }
});

J.module('aop', {
  
  $core: null,
  
  $advice: null,
  
  $pointcut: null,
  
  /**
   * set advisor to modules.
   * id will be created randomly.
   * @param pointcut (string) pointcut expression
   * @param advice (function) advice
   */
  set: function (pointcut, advice) {
    var id = this.$core.guid();  
    this.addAdvisor(id, pointcut, advice);
    this.applyAdvisorToModules(id);
  },
  
  /**
   * add advisor with specific id
   * @param id (string) advisor id. same with pointcut and advice.
   * @param pointcut (string) pointcut expression
   * @param advice (function) advice
   */
  addAdvisor: function (id, pointcut, advice) {
    this.$pointcut.add(id, pointcut);
    this.$advice.add(id, advice);
  },
  
  /**
   * apply advice to module by with specific advisor id
   * @param id (string) advisor id
   */
  applyAdvisorToModules: function (id) {
    var t = this;
    this.$core.eachModule(function (name, obj) {
      t.$core.eachProperty(obj, function (k, v) {
        if (t.$pointcut.match(id, name, k)) {
          t.$advice.set(id, obj, k);
        }
      });
    });
  }
});

J.module('advice', {
  
  _advices: {},
  
  msg: {
    ADVICE_SHOULD_BE_FUNCTION: 'J.advice: advice should be function'
  },
  
  /**
   * add advice
   * @param id (string) advice id
   * @param advice (function) advice
   *          function (method[, param, ...])
   *              method (function) original method binded by original object.
   *              param (mixed) original method parameters
   *
   * 'this' of advice function is original object
   */           
  add: function (id, advice) {
    if (typeof advice !== 'function') {
      throw this.msg.ADVICE_SHOULD_BE_FUNCTION;  
    }
    this._advices[id] = advice;
  },
  
  /**
   * Set advice to method in object
   * @param id (string) advice id
   * @param obj (object) target object
   * @param methodName (string) target methodName which is applied to advice
   */
  set: function (id, obj, methodName) {
    var advice = this._advices[id],
      oldMethod = this.bind(obj[methodName], obj);
    
    obj[methodName] = function () {
      var args = Array.prototype.slice.call(arguments);
      args.splice(0, 0, oldMethod);
      return advice.apply(obj, args.concat());
    };
  },
  
  /**
   * Bind function to context object
   * @param fn
   * @param context
   * @param data, ...
   */
  bind: function (fn, context) {
    var slice = Array.prototype.slice,
      args = slice.call(arguments, 2);

    return function () {
      return fn.apply(context, args.concat(slice.call(arguments))); 
    };
  }  
});

J.module('pointcut', {
  
  /**
   * pointcut expressions
   * {
   *   { id(string), expression(string) }, { ... }, ...
   * }
   */
  _exprs: {},
  
  /**
   * expression: [moduleName.]methodName()
   * - group1 : moduleName
   * - group2 : methodName
   */
  _rExpr: /^(?:([\w\*]+)\.)?([\w\*]+)\(\)$/,
  
  MSG: {
    INVALID_EXPR: 'J.pointcut: invalid expression',
    ID_REQUIRED: 'J.pointcut: id required'
  },
  
  /**
   * add pointcut and store to _exprs
   * {
   *   id: {
   *     module: 'module expression',
   *     method: 'method expression'
   *   }, ...
   * }
   * @param id (string) pointcut id
   * @param expr (string) expression
   *      expression: [moduleName.]methodName()
   */
  add: function (id, expr) {
    if (!id) {
      throw this.MSG.ID_REQUIRED; 
    }
    
    var parsed = this._rExpr.exec(expr);
    
    if (!parsed) {
      throw this.MSG.INVALID_EXPR; 
    }
    
    this._exprs[id] = {
      module: parsed[1] || '*',
      method: parsed[2]
    };
  },
  
  /**
   * Test if module & method name matches
   * @param id (string) pointcut id
   * @param moduleName (string)
   * @param methodName (string)
   */
  match: function(id, moduleName, methodName) {
    var expr = this._exprs[id];
    if (expr
        && this.matchName(expr.module, moduleName)
        && this.matchName(expr.method, methodName)) {
      return true;     
    }
    return false;
  },

  /**
   * Test if name matches
   * @param expr (string) expression
   * @param name (string) module name
   * @return (boolean) matched result
   */
  matchName: function (expr, name) {
    if (expr === '*') {
      return true; 
    }
    
    // abc* --> /^abc\w+$/
    var nameExpr = '^' + expr.replace(/\*/g, '\\w*') + '$';
    return new RegExp(nameExpr).test(name);
  }
});
