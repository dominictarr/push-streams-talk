(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var hl = require('highlight-syntax/all')
var HAXOR = false

function isElementInViewport (el) {
    var _el = el
    while(_el) {
      if(_el.style && _el.style.display == 'none') return false
      _el = _el.parentNode
    }
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

function haxor (el) {
  //var el = document.querySelector('code')

  var cursor = document.createElement('span')
  cursor.className = 'blinking-cursor'
  cursor.textContent = '|'

  var _el = hl(el.textContent, {lang: 'js'})
  el.innerHTML = _el
//  EL = el
  var tokens = []

  var lines = 0, indent = 0, character = 0
  ;[].slice.call(el.firstChild.children).forEach(function (e) {
    if(/^\s$/.test(e.textContent[0])) {
      lines ++
      indent = e.textContent.length
      e.dataset.indent = indent
      e.dataset.line = lines
      e.dataset.char = character ++
      if(HAXOR)
        e.style = 'display: none'
      tokens.push(e)
    }
    else {
      var chars = e.textContent.split('')
      e.textContent = ''
      chars.forEach(function (c) {
        var char = document.createElement('span')
        char.textContent = c
        e.appendChild(char)
        if(HAXOR)
          char.style = 'display: none'
        char.dataset.indent = indent
        char.dataset.line = lines
        char.dataset.char = character ++
        tokens.push(char)
      })
    }
  })
  
  if(HAXOR) {
    el.firstChild.appendChild(cursor)
    window.addEventListener('keydown', function (e) {
      if(!tokens.length) return
      if(/^\w$/.test(e.key)) {
        if(tokens[0].textContent[0] === '\n') return
        if(isElementInViewport(el)) {
          var t = tokens.shift()
          if(t) t.style = ''
        }
      }
      else if(e.key === 'Enter')
        if(tokens[0].textContent[0] === '\n')
        tokens.shift().style = ''

    })
  }
}
//tokens.sort(function (a, b) {
//  return a.dataset.indent - b.dataset.indent || a.dataset.line - b.dataset.line || a.dataset.char - b.dataset.char
//})
//
//tokens.forEach(function (e) {
//  console.log('CHAR', e.textContent, [e.dataset.indent, e.dataset.line, e.dataset.char])
//})

//[].slice.call(document.querySelectorAll('code')).forEach(function (e) {
//
//})

var div = document.createElement('div'), pages = [div],
index = +location.hash.substring(1) || 0
window.onload = function () {
  ;[].slice.call(document.body.children).forEach(function (e) {
    if(e.tagName === 'HR')
      pages.push(div = document.createElement('div'))
    else
      div.appendChild(e)
  })
  document.body.innerHTML = ''
  var content = document.createElement('div')
  document.body.appendChild(content)
  pages.forEach(function (e) {
    e.style = 'display: none'
    content.appendChild(e)
  })
  pages[index].style = 'display: block'


  ;[].slice.call(document.querySelectorAll('code')).forEach(haxor)

}

window.addEventListener('keydown', function (e) {
  var _index = index
  if('ArrowLeft' === e.key)
    index = Math.max(index - 1, 0)
  else if( 'ArrowRight' === e.key || ' ' === e.key)
    index = Math.min(index + 1, pages.length - 1)
  console.log(e.key, index)
  
  if(_index != index) {
    pages[_index].style = 'display: none'
    pages[index].style = 'display: block'
  }
  location.hash = '#' + index

})

},{"highlight-syntax/all":5}],3:[function(require,module,exports){
(function (process){
function disect_sync (min, max, fn) {
  var array;
  var index;
  var tested = {};

  if(Array.isArray(min) && typeof fn === 'undefined') {
    array = min;
    min = 0;
    predicate = max;
    max = array.length;
    fn = function(index) {
      return predicate(array[index], index);
    }
  }

  function test (i) {
    if(typeof tested[i] === 'undefined') {
      return tested[i] = fn(i);
    }
    else {
      return tested[i];
    }
  }

  while(max > min +1) {
    index = min + Math.floor((max - min) / 2);
    // true if what we're looking for is lower
    // false if what we're looking for is higher
    if(test(index)) {
      max = index;
    }
    else {
      min = index;
    }
  }
  return test(min) ? min : max;
}

function disect_async (min, max, fn, result_callback) {
  var tested = {};
  var index;

  if(Array.isArray(min) && typeof result_callback === 'undefined') {
    array = min;
    min = 0;
    predicate = max;
    max = array.length;
    result_callback = fn;
    fn = function(index, callback) {
      predicate(array[index], index, callback);
    }
  }

  function test (i, cb) {
    if(typeof tested[i] === 'undefined') {
      fn(i, function (res) {
        tested[i] = res;
        cb(res);
      });
    }
    else {
      process.nextTick(cb.bind(this, tested[i]));
    }
  }

  function iterate () {
    if(min+1 >= max) {
      test(min, function (res) {
        if(res) result_callback(min);
        else result_callback(max);
      })
    }
    else {
      index = min + Math.floor((max-min) / 2);
      test(index, function (res) {
        if(res) {
          max = index;
        }
        else {
          min = index;
        }
        iterate();
      })
    }
  }
  process.nextTick(iterate);
}

/**
 * find the first item in the range to validate the predicate
 */
module.exports = function disect(min, max, fn, callback) {
  if (callback || arguments.length === 3 && max.length === 3) {
    disect_async(min, max, fn, callback);
    return;
  }
  else {
    return disect_sync(min, max, fn);
  }

};

}).call(this,require('_process'))
},{"_process":1}],4:[function(require,module,exports){
module.exports = [ require('./c.json'), require('./js.json'),
  require('./sh.json') ]

},{"./c.json":6,"./js.json":8,"./sh.json":9}],5:[function(require,module,exports){
module.exports = require('./')(require('./all-rules.js'))

},{"./":7,"./all-rules.js":4}],6:[function(require,module,exports){
module.exports={
  "name": "c",
  "match": "^c$",
  "kw0": ["asm","auto","break","case","continue","default","do","else",
    "for","goto","if","return","sizeof","switch","typeof","while"],
  "kw1":["char","const","double","enum","extern","float","inline","int","long",
    "register","short","signed","static","struct","typedef","union","unsigned",
    "void","volatile","size_t","time_t","uint8_t","uint16_t","uint32_t",
    "uint64_t","int8_t","int16_t","int32_t","int64_t"],
  "rules": [
    ["area comment","^/\\*([^*]|\\*(?!/))*\\*/$"],
    ["area comment continue","^/\\*([^*]|\\*(?!/))*\\*?$"],
    ["line comment","^//[^\\n]*$"],
    ["quote","^\"([^\"\\n]|\\\\\")*\"?$"],
    ["char","^'(\\\\?[^'\\n]|\\\\')'?$"],
    ["char continue","^'[^']*$"],
    ["directive","^#(\\S*)$"],
    ["open paren","^\\($"],
    ["close paren","^\\)$"],
    ["open square","^\\[$"],
    ["close square","^\\]$"],
    ["open curly","^{$"],
    ["close curly","^}$"],
    ["operator","^([-<>~!%^&*/+=?|.,:;]|->|<<|>>|\\*\\*|\\|\\||&&|--|\\+\\+|[-+*|&%/=!]=)$"],
    ["identifier","^([_A-Za-z]\\w*)$"],
    ["number","^(\\d*\\.?\\d+([eE][-+]?\\d*)?|0x\\d+)$"],
    ["whitespace","^(\\s+)$"],
    ["line continue","^\\\\\\n?$"]
  ]
}

},{}],7:[function(require,module,exports){
var tokenize = require('tokenizer-array')

module.exports = function (rules) {
  var rrules = {}, rmatches = {}
  var matches = rules.map(function (r) { return RegExp(r.match,'i') })
  return function (src, opts) {
    if (typeof opts === 'string') opts = { lang: opts }
    if (!opts) opts = {}
    var ri = getRule(opts.lang)
    if (ri < 0) return esc(src)
    var r = rules[ri]
    if (!rrules[ri]) {
      rrules[ri] = r.rules.map(function f (x) {
        return {
          type: x[0],
          regex: RegExp(x[1]),
          children: x[2] ? x[2].map(g) : null
        }
        function g (x) { return x.map(f) }
      })
    }
    var kw0 = {}, kw1 = {}, kw2 = {}
    ;(r.kw0 || []).forEach(function (key) { kw0[key] = true })
    ;(r.kw1 || []).forEach(function (key) { kw1[key] = true })
    ;(r.kw2 || []).forEach(function (key) { kw2[key] = true })
    var tokens = tokenize(src, rrules[ri])
    return '<span class="' + r.name + '">' + tokens.map(function f (t) {
      var c = xclass(t.type)
      if (t.type === 'identifier') {
        if (kw0[t.source]) c += ' kw0 kw-' + xclass(t.source)
        else if (kw1[t.source]) c += ' kw1 kw-' + xclass(t.source)
        else if (kw2[t.source]) c += ' kw2 kw-' + xclass(t.source)
      }
      return '<span class="' + c + '">'
        + (t.children ? t.children.map(g).join('') : esc(t.source))
        + '</span>'
      function g (x) { return x.map(f).join('') }
    }).join('') + '</span>'
  }
  function getRule (lang) {
    if (rmatches[lang]) return rmatches[lang]
    for (var i = 0; i < matches.length; i++) {
      if (matches[i].test(lang)) return i
    }
    return -1
  }
}

function xclass (s) { return s.replace(/[\s_]+/g,'-') }
function esc (s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

},{"tokenizer-array":10}],8:[function(require,module,exports){
module.exports={
  "name": "js",
  "match": "^(js|javascript)$",
  "kw0": ["break","case","continue","import","export","default","do","else",
    "for","goto","if","return","switch","typeof","while","undefined","null",
    "eval","self","window","try","catch","throw","new"],
  "kw1":["Array","Boolean","Date","Error","EvalError","Function","Infinity",
    "JSON","Math","NaN","Number","Object","RangeError","ReferenceError",
    "RegExp","String","SyntaxError","TypeError","URIError","ArrayBuffer",
    "Buffer","DataView","Float32Array","Float64Array","Int16Array",
    "Int32Array","Int8Array","Intl","Map","Promise","Proxy","Reflect","Set",
    "Symbol","Uint16Array","Uint32Array","Uint8Array","Uint8ClampedArray",
    "WeakMap","WeakSet"],
  "kw2":["function","var"],
  "rules": [
    ["area comment","^/\\*([^*]|\\*(?!/))*\\*/$"],
    ["area comment continue","^/\\*([^*]|\\*(?!/))*\\*?$"],
    ["line comment","^//[^\\n]*$"],
    ["template string","^(`([^`$]|\\\\`|\\$\\{([^}]|`([^`]|\\\\`)*`)*\\}?|\\$([^{]|$))*`?)$",[
      [
        ["text","^([^$]|\\\\\\$|\\$[^{])*$"],
        ["template expr","^\\$\\{([^`}]|\\\\\\}|`([^`$]|\\\\`|\\$[^{]|\\$\\{[^}]*\\}?)*(`|$))*\\}?$"]
      ]
    ]],
    ["regex","^/([^/]|\\\\/)*/[a-z]*$"],
    ["double quote","^\"([^\"\\n]|\\\\\")*\"?$"],
    ["single quote","^'([^'\\n]|\\\\')*'?$"],
    ["directive","^#(\\S*)$"],
    ["open paren","^\\($"],
    ["close paren","^\\)$"],
    ["open square","^\\[$"],
    ["close square","^\\]$"],
    ["open curly","^{$"],
    ["close curly","^}$"],
    ["operator","^([-<>~%^&*/+?|.,:;]|<<|>>|\\*\\*|\\|\\||&&|--|\\+\\+|[-+*|&%/]=|[!=](=?=?|>))$"],
    ["identifier","^([_A-Za-z]\\w*)$"],
    ["number","^(\\d*\\.?\\d+([eE][-+]?\\d*)?|0x\\d+)$"],
    ["whitespace","^(\\s+)$"],
    ["line continue","^\\\\\\n?$"],
    ["shebang","^(#![^\\n]*)$"]
  ]
}

},{}],9:[function(require,module,exports){
module.exports={
  "name": "sh",
  "match": "^(ba)?sh$",
  "kw0":["alias","bg","bind","break","builtin","caller","cd","command",
    "compgen","complete","compopt","continue","declare","typeset","dirs",
    "disown","echo","enable","eval","exec","exit","export","fc","fg","getopts",
    "hash","help","history","jobs","kill","let","local","logout","mapfile",
    "readarray","popd","printf","pushd","pwd","read","readonly","return","set",
    "shift","shopt","source","suspend","test","[","]","times","trap","type",
    "ulimit","umask","unalias","unset","wait","."],
  "kw1":["ls","sed","grep"],
  "rules": [
    ["shebang","^(#![^\\n]*)$"],
    ["line comment","^#[^\\n]*$"],
    ["whitespace","^(\\s+)$"],
    ["set var","^(export\\s+)?(\\w+=)(.*)$",[
      [
        ["identifier","^\\w+$"],
        ["whitespace","^\\s+$"]
      ],
      [["variable","^.+$"]],
      [
        ["argument","^([^'\"\\s<>|\\\\$]+)$"],
        ["variable","^(\\$[\\w*@#?$!-]*)$"],
        ["single quote","^'[^']*'?$"],
        ["double quote","^\"([^\"]|\\\\\")*\"?$"]
      ]
    ]],
    ["open paren","^\\($"],
    ["close paren","^\\)$"],
    ["command","^([^\\s'\"|&;()]+)((?:[^\\n'\"|&;]|\\\\[\\n'\"|&;]|'[^']*(?:'|$)|\"(?:[^\"]|\\\\\")*(?:\"|$)|<<(\\S*)(?:.|\\n(?!\\3))*(?:\\n\\1?)?)*)$", [
      [
        ["identifier","^.+$"]
      ],
      [
        ["argument","^([^'\"\\s<>|$]+|\\\\\\$)*$"],
        ["variable","^(\\$[\\w*@#?$!-]*)$"],
        ["command-substitution","^\\$\\{[^}]*\\}?$"],
        ["single quote","^'[^']*'?$"],
        ["double quote","^(\"(?:[^\"]|\\\\\")*\"?)$",[[
          ["variable","^(\\$[\\w*@#?$!-]*)$"],
          ["command-substitution","^\\$\\{[^}]*\\}?$"],
          ["text","^([^$]|\\\\\\$?)+$"]
        ]]],
        ["heredoc","^(<<)(\\S*)((?:.|\\n(?!\\2))*)(\\n\\2)?$",[
          [["operator","^.+$"]],
          [["operator","^.+$"]],
          [
            ["variable","^(\\$[\\w*@#?$!-]*)$"],
            ["command-substitution","^\\$\\{[^}]*\\}?$"],
            ["text","^([^$]|\\\\\\$?)+$"]
          ],
          [
            ["whitespace","^\\s+$"],
            ["operator","^\\S+$"]
          ]
        ]],
        ["operator","^([<|&;!\\[\\]]|>>?|\\|\\||&&)$"],
        ["whitespace","^(\\s+)$"],
        ["line continue","^\\\\\\n?$"]
      ]
    ] ],
    ["operator","^([|&;]|\\|\\||&&)$"]
  ]
}

},{}],10:[function(require,module,exports){
var disect = require('disect')

module.exports = function tokenize (src, rules) {
  var len = src.length
  var tokens = []
  for (var i = 0, j = 0; i < len; i=j) {
    j = disect(i, len, fn)
    if (j === 0 || i === j) throw new Error('could not tokenize')
    var s = src.slice(i,j)
    var rule = getRule(s)
    if (!rule) throw new Error('no match')
    var token = { type: rule.type, source: s }
    if (rule.children) {
      var m = rule.regex.exec(s)
      token.children = []
      for (var k = 1; m && k < m.length && k-1 < rule.children.length; k++) {
        token.children.push(tokenize(m[k], rule.children[k-1]))
      }
    }
    tokens.push(token)
  }
  return tokens

  function fn (ix) {
    return getRule(src.slice(i, ix+1)) === null
  }
  function getRule (str) {
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].regex.test(str)) return rules[i]
    }
    return null
  }
}

},{"disect":3}]},{},[2]);
