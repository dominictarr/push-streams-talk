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
