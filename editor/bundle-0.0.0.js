!function e(t,n,i){function s(o,a){if(!n[o]){if(!t[o]){var l="function"==typeof require&&require;if(!a&&l)return l(o,!0);if(r)return r(o,!0);var c=new Error("Cannot find module '"+o+"'");throw c.code="MODULE_NOT_FOUND",c}var u=n[o]={exports:{}};t[o][0].call(u.exports,function(e){var n=t[o][1][e];return s(n?n:e)},u,u.exports,e,t,n,i)}return n[o].exports}for(var r="function"==typeof require&&require,o=0;o<i.length;o++)s(i[o]);return s}({1:[function(e,t,n){"use strict";function i(e,t){var n=JSON.parse(JSON.stringify(e));return n.name=t,n}function s(e){for(;e.hasChildNodes();)e.removeChild(e.firstChild)}function r(){document.body.scrollTop=document.documentElement.scrollTop=0}var o=e("hyperglue"),a=e("./edit-story"),l=e("./edit-location"),c=e("./edit-screen"),u='<form class="story-editor" action="#" onsubmit="return false;">\n  <textarea name="text" cols="30" rows="15"></textarea>\n  <div class="actions">\n    <input type="submit" class="action import" value="Import">\n    <input type="submit" class="action cancel" value="Cancel">\n  </div>\n</form>\n',p={locations:{start:{}},screens:{start:{type:"text",text:"## Welcome",next:"finish"},finish:{type:"finish"}}};document.addEventListener("DOMContentLoaded",function(){function e(e){s(d);var t=l.create(d,e);t.on("location.save",function(e,t){p.locations[e]=t,h()}),t.on("cancel",h)}function t(e,t,n){p.screens[e]=t,n&&n(e,t),r()}function n(e,o){s(d),e.screenNames=Object.keys(p.screens),e.locations=JSON.parse(JSON.stringify(p.locations));var a=c.create(d,e);a.on("location.save",function(e,t){p.locations[e]=t}),a.on("screen.save",function(e,n){t(e,n,o),h()}),a.on("screen.next",function(e,s){t(e,s,o),s.next?n(i(p.screens[s.next],s.next)):n({},function(e){s.next=e})}),a.on("cancel",h),r()}var h,d=document.querySelector("#content");(h=function f(){s(d);var t=a.create(d,p);t.on("location.edit",function(t){e(i(p.locations[t],t))}),t.on("screen.edit",function(e){n(i(p.screens[e],e))}),t.on("location.delete",function(e){delete p.locations[e],f()}),t.on("screen.delete",function(e){delete p.screens[e],f()}),t.on("location.add",function(){e({})}),t.on("screen.add",function(){n({})}),t.on("json",function(){s(d);var e=o(u,{textarea:JSON.stringify(p,null,"  ")});e.querySelector(".action.import").onclick=function(){try{p=JSON.parse(e.querySelector("textarea").value),f()}catch(t){alert("Import failed: "+String(t))}},e.querySelector(".action.cancel").onclick=function(){f()},d.appendChild(e),r()}),r()})()})},{"./edit-location":2,"./edit-screen":3,"./edit-story":4,hyperglue:7}],2:[function(e,t,n){"use strict";var i=e("events"),s=e("hyperglue"),r=e("./location"),o='<form class="editor" action="#" onsubmit="return false;">\n  <h2>Location</h2>\n  <div class="edit-location">\n  </div>\n  <div class="actions">\n    <input type="submit" class="action save" value="Save + Return">\n    <input type="submit" class="action cancel" value="Cancel">\n  </div>\n</form>\n';n.create=function(e,t){var n=s(o,{}),a=n.querySelector(".edit-location"),l=r.create(a,t);e.appendChild(n);var c=new i.EventEmitter;return n.querySelector(".action.save").onclick=function(){l.destroy();var e=l.getData();t.name&&e.name!==t.name&&c.emit("location.rename",t.name,e.name),c.emit("location.save",e.name,e.data)},n.querySelector(".action.cancel").onclick=function(){c.emit("cancel")},c}},{"./location":5,events:6,hyperglue:7}],3:[function(e,t,n){"use strict";function i(e,t){[].concat(e).forEach(function(e){t?e.classList.add("hidden"):e.classList.remove("hidden")})}function s(e,t){return e.querySelector(t)}function r(e,t){return e.map(function(e){return"string"==typeof e&&(e={_text:e,value:e}),e.value===t&&(e.selected=!0),{"*":e}})}var o=e("events"),a=e("hyperglue"),l=e("marked"),c=e("./location"),u='<form class="editor" action="#" onsubmit="return false;">\n  <h2>Screen</h2>\n  <label><span class="text">Name:</span>\n    <input type="text" name="screen-name">\n  </label>\n  <label class="screen-type"><span class="text">Screen Type:</span>\n    <select name="type">\n      <option>-</option>\n    </select>\n  </label>\n  <div class="edit-text">\n    <textarea name="text" cols="30" rows="8"></textarea>\n    <div class="text-preview hidden"></div>\n    <a href="#" class="toggle-preview">Preview</a>\n  </div>\n  <div class="edit-answer">\n    <label><span class="text">Answer:</span>\n      <input type="text" name="answer">\n    </label>\n  </div>\n  <div class="edit-options">\n    <input type="submit" class="add-option" value="+">\n  </div>\n  <div class="edit-navigate">\n    <label><span class="text">Location:</span>\n      <select name="location">\n        <option>-</option>\n      </select>\n    </label>\n    <div class="edit-navigate-location">\n    </div>\n    <label><span class="text">&nbsp;</span>\n      <input type="checkbox" name="compass"> Show compass\n    </label>\n    <label><span class="text">&nbsp;</span>\n      <input type="checkbox" name="distance"> Show distance\n    </label>\n    <label><span class="text">&nbsp;</span>\n      <input type="checkbox" name="colors"> Colored background\n    </label>\n    <label class="color-steps hidden"><span class="text">Color steps:</span>\n      <input type="number" name="color-steps" min="5" max="50" step="1"> Meters\n    </label>\n  </div>\n  <div class="edit-next-screen">\n    <label><span class="text">Next Screen:</span>\n      <select name="next-screen">\n        <option>-</option>\n      </select>\n    </label>\n  </div>\n  <div class="actions">\n    <input type="submit" class="action save" value="Save + Return">\n    <input type="submit" class="action next" value="Save + Next Screen">\n    <input type="submit" class="action cancel" value="Cancel">\n  </div>\n</form>\n',p='<div class="option">\n  <input type="submit" class="remove-option" value="x">\n  <label><span class="text title">Option #1</span></label>\n  <label><span class="text">Option Text:</span>\n    <input type="text" class="option-text">\n  </label>\n  <label><span class="text">Points:</span>\n    <input type="number" class="option-points"> <small>(optional)</small>\n  </label>\n  <label><span class="text">Next Screen:</span>\n    <select class="option-next-screen">\n      <option>-</option>\n    </select>\n  </label>\n</div>\n',h=["text","input","choices","navigate","finish"],d={text:"Text",input:"Question & Answer",choices:"Multiple Choice",navigate:"Navigation",finish:"Finish"};n.create=function(e,t){function n(e){for(q&&q.destroy();E.hasChildNodes();)E.removeChild(E.firstChild);var t={},n=x[e];n&&(t=JSON.parse(JSON.stringify(n)),t.name=e),q=c.create(E,t)}function f(e,t,n){return t+=1,a(e,{".title":"Option #"+t,".option-text":{name:"option-text-"+t,value:n.text||""},".option-points":{name:"option-points-"+t,value:n.points||""},".option-next-screen":{name:"option-next-screen-"+t},".option-next-screen option":r(y,n.next)})}function g(){var e=O.querySelectorAll(".option");Array.prototype.forEach.call(e,function(e,t){O.removeChild(e),f(e,t,{}),O.insertBefore(e,T)})}function m(e,t){var n=f(p,t,e||{});O.insertBefore(n,T),s(n,".remove-option").onclick=function(){O.removeChild(n),g()}}function v(e){i(A,"navigate"===e),i(N,"input"!==e),i(O,"choices"!==e),i(C,"navigate"!==e),i(j,"finish"===e),q&&q.destroy(),"navigate"===e&&n(t.location)}function b(){var e=s(L,"[name=type]").value,t={type:e};if("navigate"===e){var n=s(L,"[name=location]").value,i=q.getData(),r=i.name;if("+"!==n&&n!==r&&H.emit("location.rename",n,r),H.emit("location.save",r,i.data),t.location=r,t.options={compass:s(L,"[name=compass]").checked,distance:s(L,"[name=distance]").checked},s(L,"[name=colors]").checked){var o=s(L,"[name=color-steps]").value;t.options.colorSteps=parseInt(o,10)}}else t.text=s(L,"[name=text]").value;return"input"===e?t.answer=s(L,"[name=answer]").value:"choices"===e&&(t.choices=P.map(function(e,t){var n=t+1,i={text:s(L,"[name=option-text-"+n+"]").value},r=s(L,"[name=option-points-"+n+"]").value;r&&(i.points=parseInt(r,10));var o=s(L,"[name=option-next-screen-"+n+"]").value;return o&&(i.next=o),i})),t.next=s(L,"[name=next-screen]").value,t}var y=(t.screenNames||[]).filter(function(e){return e!==t.name});y.unshift({value:"",_text:"None"});var x=t.locations||{},k=Object.keys(x);k.unshift({value:"+",_text:"New Location"});var _={value:t.name||""};("start"===t.name||"finish"===t.name)&&(_.disabled=!0);var w=t.options||{};w.hasOwnProperty("compass")||(w.compass=!0),w.hasOwnProperty("distance")||(w.distance=!0);var S={"[name=screen-name]":_,"[name=type] option":h.filter(function(e){return"finish"!==e||"start"!==t.name}).map(function(e){var n={value:e,_text:d[e]};return e===t.type&&(n.selected="selected"),{"*":n}}),"[name=text]":t.text||"","[name=answer]":{value:t.answer||""},"[name=location] option":r(k,t.location),"[name=color-steps]":{value:w.colorSteps||""},"[name=next-screen] option":r(y,t.next)};w.compass&&(S["[name=compass]"]={checked:!0}),w.distance&&(S["[name=distance]"]={checked:!0}),w.colorSteps&&(S["[name=colors]"]={checked:!0}),"finish"===t.name&&(S["[name=type]"]={disabled:!0});var L=a(u,S),C=s(L,".edit-navigate"),E=s(L,".edit-navigate-location");e.appendChild(L);var q;L.querySelector("[name=location]").onchange=function(){n(this.value)};var A=s(L,".edit-text"),$=s(L,".toggle-preview"),N=s(L,".edit-answer"),O=s(L,".edit-options"),T=s(L,".add-option"),j=s(L,".edit-next-screen");$.onclick=function(e){e.stopPropagation();var t=s(A,"textarea"),n=s(A,".text-preview"),r="Preview"===this.textContent;i(t,r),i(n,!r),r&&(n.innerHTML=l(t.value)),this.textContent=r?"Edit":"Preview"};var P=t.choices||[];P.length||P.push({}),P.forEach(m),T.onclick=function(){var e=P.length;P.push({}),m(P[e],e)},v(t.type),s(L,"select[name=type]").onchange=function(){v(this.value)};var M=s(L,".color-steps");w.colorSteps&&i(M,!1),s(L,"[name=colors]").onchange=function(){this.checked&&(s(L,"[name=color-steps]").value="5"),i(M,!this.checked)};var H=new o.EventEmitter;return s(L,".action.save").onclick=function(){var e=s(L,"[name=screen-name]").value;H.emit("screen.save",e,b())},s(L,".action.next").onclick=function(){var e=s(L,"[name=screen-name]").value;H.emit("screen.next",e,b())},L.querySelector(".action.cancel").onclick=function(){H.emit("cancel")},H}},{"./location":5,events:6,hyperglue:7,marked:10}],4:[function(e,t,n){"use strict";function i(e){return function(t){var n={a:t};return-1!==e.indexOf(t)&&(n["[name=delete]"]={"class":"hidden"}),n}}var s=e("events"),r=e("hyperglue"),o='<form class="story-editor" action="#" onsubmit="return false;">\n  <h2>Story</h2>\n  <h4>Screens</h4>\n  <ul class="screens">\n    <li><a href="#"></a> <input type="submit" name="delete" value="x"></li>\n  </ul>\n  <input type="submit" name="screen-add" value="+">\n  <h4>Locations</h4>\n  <ul class="locations">\n    <li><a href="#"></a> <input type="submit" name="delete" value="x"></li>\n  </ul>\n  <input type="submit" name="location-add" value="+">\n  <div class="actions">\n    <input type="submit" class="action json" value="Story JSON">\n  </div>\n</form>\n';n.create=function(e,t){function n(e,t,n){Array.prototype.slice.call(c.querySelectorAll(e)).forEach(function(e,i){e.onclick=function(){u.emit(t,n[i])}})}var a=Object.keys(t.locations),l=Object.keys(t.screens),c=r(o,{".locations li":a.map(i(["start"])),".screens li":l.map(i(["start","finish"]))}),u=new s.EventEmitter;return n(".locations li a","location.edit",a),n(".locations li [name=delete]","location.delete",a),n(".screens li a","screen.edit",l),n(".screens li [name=delete]","screen.delete",l),c.querySelector("[name=location-add]").onclick=function(){u.emit("location.add")},c.querySelector("[name=screen-add]").onclick=function(){u.emit("screen.add")},c.querySelector(".action.json").onclick=function(){u.emit("json")},e.appendChild(c),u}},{events:6,hyperglue:7}],5:[function(e,t,n){"use strict";function i(e,t){[].concat(e).forEach(function(e){t?e.classList.add("hidden"):e.classList.remove("hidden")})}function s(e,t){return e.querySelector(t)}var r=e("hyperglue"),o=e("locatify"),a='<div class="edit-location">\n  <label><span class="text">Loc. Name:</span>\n    <input type="text" name="location-name">\n  </label>\n  <label><span class="text">Latitude:</span>\n    <input type="text" name="latitude">\n    <span class="current-latitude hidden">-</span>\n  </label>\n  <label><span class="text">Longitude:</span>\n    <input type="text" name="longitude">\n    <span class="current-longitude hidden">-</span>\n  </label>\n  <label><span class="text">Radius:</span>\n    <input type="number" name="radius" min="3" max="25" value="5"> Meters\n    <span class="current-accuracy hidden">-</span>\n  </label>\n  <label class="use-location hidden"><span class="text">&nbsp;</span>\n    <input type="submit" name="use-location" value="Use current location">\n  </label>\n  <label><span class="text">&nbsp;</span>\n    <input type="submit" name="toggle-tracker" value="Show current location">\n  </label>\n</div>\n';n.create=function(e,t){function n(){h.destroy(),h=null,f.value="Show current location",i([v,b,y,g],!0)}var l={value:t.name||""};"start"===t.name&&(l.disabled=!0);var c=t.center||{},u={"[name=location-name]":l,"[name=latitude]":{value:c.latitude||""},"[name=longitude]":{value:c.longitude||""},"[name=radius]":{value:t.radius||""}},p=r(a,u);e.appendChild(p);var h,d,f=s(p,"input[name=toggle-tracker]"),g=s(p,".use-location"),m=s(p,"input[name=use-location]"),v=s(p,".current-latitude"),b=s(p,".current-longitude"),y=s(p,".current-accuracy");return f.onclick=function(){h?n():(h=o.create(),h.on("position",function(e){d={latitude:e.latitude.toFixed(6),longitude:e.longitude.toFixed(6)},v.textContent=d.latitude,b.textContent=d.longitude,y.textContent=String(e.accuracy)}),f.value="Hide current location",i([v,b,y,g],!1))},m.onclick=function(){s(p,"[name=latitude]").value=d.latitude,s(p,"[name=longitude]").value=d.longitude,n()},{getData:function(){return{name:s(p,"[name=location-name]").value,data:{type:"circle",center:{latitude:parseFloat(s(p,"[name=latitude]").value),longitude:parseFloat(s(p,"[name=longitude]").value)},radius:parseInt(s(p,"[name=radius]").value,10)}}},destroy:function(){h&&n()}}}},{hyperglue:7,locatify:9}],6:[function(e,t,n){function i(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function s(e){return"function"==typeof e}function r(e){return"number"==typeof e}function o(e){return"object"==typeof e&&null!==e}function a(e){return void 0===e}t.exports=i,i.EventEmitter=i,i.prototype._events=void 0,i.prototype._maxListeners=void 0,i.defaultMaxListeners=10,i.prototype.setMaxListeners=function(e){if(!r(e)||0>e||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},i.prototype.emit=function(e){var t,n,i,r,l,c;if(this._events||(this._events={}),"error"===e&&(!this._events.error||o(this._events.error)&&!this._events.error.length)){if(t=arguments[1],t instanceof Error)throw t;throw TypeError('Uncaught, unspecified "error" event.')}if(n=this._events[e],a(n))return!1;if(s(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:for(i=arguments.length,r=new Array(i-1),l=1;i>l;l++)r[l-1]=arguments[l];n.apply(this,r)}else if(o(n)){for(i=arguments.length,r=new Array(i-1),l=1;i>l;l++)r[l-1]=arguments[l];for(c=n.slice(),i=c.length,l=0;i>l;l++)c[l].apply(this,r)}return!0},i.prototype.addListener=function(e,t){var n;if(!s(t))throw TypeError("listener must be a function");if(this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,s(t.listener)?t.listener:t),this._events[e]?o(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,o(this._events[e])&&!this._events[e].warned){var n;n=a(this._maxListeners)?i.defaultMaxListeners:this._maxListeners,n&&n>0&&this._events[e].length>n&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),"function"==typeof console.trace&&console.trace())}return this},i.prototype.on=i.prototype.addListener,i.prototype.once=function(e,t){function n(){this.removeListener(e,n),i||(i=!0,t.apply(this,arguments))}if(!s(t))throw TypeError("listener must be a function");var i=!1;return n.listener=t,this.on(e,n),this},i.prototype.removeListener=function(e,t){var n,i,r,a;if(!s(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(n=this._events[e],r=n.length,i=-1,n===t||s(n.listener)&&n.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t);else if(o(n)){for(a=r;a-->0;)if(n[a]===t||n[a].listener&&n[a].listener===t){i=a;break}if(0>i)return this;1===n.length?(n.length=0,delete this._events[e]):n.splice(i,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},i.prototype.removeAllListeners=function(e){var t,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[e],s(n))this.removeListener(e,n);else for(;n.length;)this.removeListener(e,n[n.length-1]);return delete this._events[e],this},i.prototype.listeners=function(e){var t;return t=this._events&&this._events[e]?s(this._events[e])?[this._events[e]]:this._events[e].slice():[]},i.listenerCount=function(e,t){var n;return n=e._events&&e._events[t]?s(e._events[t])?1:e._events[t].length:0}},{}],7:[function(e,t,n){function i(e,t){t||(t={});var n="object"==typeof e?[e]:l(e);return c||(c=document.createElement("div")),r(u(t),function(e){var i=t[e];r(n,function(t){var n=t.parentNode;if(":first"===e)s(t,i);else if(/:first$/.test(e)){var r=e.replace(/:first$/,"");n&&n.removeChild(t),c.appendChild(t);var o=c.querySelector(r);c.removeChild(t),n&&n.appendChild(t),o&&s(o,i)}else{n&&n.removeChild(t),c.appendChild(t);var a=t.parentNode.querySelectorAll(e);if(c.removeChild(t),n&&n.appendChild(t),0===a.length)return;for(var l=0;l<a.length;l++)s(a[l],i)}})}),1===n.length?n[0]:n}function s(e,t){if(o(t))e.innerHTML="",e.appendChild(t);else if(p(t)){for(var n=0;n<t.length;n++){var s=i(e.cloneNode(!0),t[n]);e.parentNode.insertBefore(s,e)}e.parentNode.removeChild(e)}else t&&"object"==typeof t?r(u(t),function(n){if("_text"===n)a(e,t[n]);else if("_html"===n&&o(t[n]))e.innerHTML="",e.appendChild(t[n]);else if("_html"===n)e.innerHTML=t[n];else if(t[n]&&"object"==typeof t[n]){var i=t[n];i.append?e.setAttribute(n,e.getAttribute(n)+i.append):i.prepend&&e.setAttribute(n,i.prepend+e.getAttribute(n))}else e.setAttribute(n,t[n])}):a(e,t)}function r(e,t){if(e.forEach)return e.forEach(t);for(var n=0;n<e.length;n++)t(e[n],n)}function o(e){return e&&"object"==typeof e&&e.childNodes&&("function"==typeof e.appendChild||"object"==typeof e.appendChild)}function a(e,t){e.innerHTML="";var n=document.createTextNode(String(t));e.appendChild(n)}var l=e("domify");t.exports=i;var c=null,u=Object.keys||function(e){var t=[];for(var n in e)t.push(n);return t},p=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)}},{domify:8}],8:[function(e,t,n){function i(e){if("string"!=typeof e)throw new TypeError("String expected");var t=/<([\w:]+)/.exec(e);if(!t)throw new Error("No elements were generated.");var n=t[1];if("body"==n){var i=document.createElement("html");return i.innerHTML=e,[i.removeChild(i.lastChild)]}var o=r[n]||r._default,a=o[0],l=o[1],c=o[2],i=document.createElement("div");for(i.innerHTML=l+e+c;a--;)i=i.lastChild;return s(i.children)}function s(e){for(var t=[];e.length;)t.push(e[0].parentNode.removeChild(e[0]));return t}t.exports=i;var r={option:[1,'<select multiple="multiple">',"</select>"],optgroup:[1,'<select multiple="multiple">',"</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tbody:[1,"<table>","</table>"],tfoot:[1,"<table>","</table>"],colgroup:[1,"<table>","</table>"],caption:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],th:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],_default:[0,"",""]}},{}],9:[function(e,t,n){(function(t){"use strict";var i=e("events"),s={1:"Position tracking not allowed",2:"Position tracking unavailable",3:"Position tracking timeout",DEFAULT:"Position tracking error"};n.create=function(){function e(e){o.emit("position",{latitude:e.coords.latitude,longitude:e.coords.longitude,accuracy:e.coords.accuracy})}function n(e){e.message=s[e.code]||s.DEFAULT,o.emit("error",e)}function r(e){o.emit("heading",e.hasOwnProperty("webkitCompassHeading")?e.webkitCompassHeading:e.alpha)}var o=new i.EventEmitter,a=navigator.geolocation.watchPosition(e,n,{enableHighAccuracy:!0,maximumAge:0});return t.addEventListener("deviceorientation",r,!1),o.destroy=function(){t.removeEventListener("deviceorientation",r),o.removeAllListeners(),navigator.geolocation.clearWatch(a)},o}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{events:6}],10:[function(e,t,n){(function(e){(function(){function e(e){this.tokens=[],this.tokens.links={},this.options=e||p.defaults,this.rules=h.normal,this.options.gfm&&(this.options.tables?this.rules=h.tables:this.rules=h.gfm)}function i(e,t){if(this.options=t||p.defaults,this.links=e,this.rules=d.normal,this.renderer=this.options.renderer||new s,this.renderer.options=this.options,!this.links)throw new Error("Tokens array requires a `links` property.");this.options.gfm?this.options.breaks?this.rules=d.breaks:this.rules=d.gfm:this.options.pedantic&&(this.rules=d.pedantic)}function s(e){this.options=e||{}}function r(e){this.tokens=[],this.token=null,this.options=e||p.defaults,this.options.renderer=this.options.renderer||new s,this.renderer=this.options.renderer,this.renderer.options=this.options}function o(e,t){return e.replace(t?/&/g:/&(?!#?\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function a(e){return e.replace(/&([#\w]+);/g,function(e,t){return t=t.toLowerCase(),"colon"===t?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""})}function l(e,t){return e=e.source,t=t||"",function n(i,s){return i?(s=s.source||s,s=s.replace(/(^|[^\[])\^/g,"$1"),e=e.replace(i,s),n):new RegExp(e,t)}}function c(){}function u(e){for(var t,n,i=1;i<arguments.length;i++){t=arguments[i];for(n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e}function p(t,n,i){if(i||"function"==typeof n){i||(i=n,n=null),n=u({},p.defaults,n||{});var s,a,l=n.highlight,c=0;try{s=e.lex(t,n)}catch(h){return i(h)}a=s.length;var d=function(e){if(e)return n.highlight=l,i(e);var t;try{t=r.parse(s,n)}catch(o){e=o}return n.highlight=l,e?i(e):i(null,t)};if(!l||l.length<3)return d();if(delete n.highlight,!a)return d();for(;c<s.length;c++)!function(e){return"code"!==e.type?--a||d():l(e.text,e.lang,function(t,n){return t?d(t):null==n||n===e.text?--a||d():(e.text=n,e.escaped=!0,void(--a||d()))})}(s[c])}else try{return n&&(n=u({},p.defaults,n)),r.parse(e.lex(t,n),n)}catch(h){if(h.message+="\nPlease report this to https://github.com/chjj/marked.",(n||p.defaults).silent)return"<p>An error occured:</p><pre>"+o(h.message+"",!0)+"</pre>";throw h}}var h={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:c,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,nptable:c,lheading:/^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,blockquote:/^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,list:/^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,table:c,paragraph:/^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,text:/^[^\n]+/};h.bullet=/(?:[*+-]|\d+\.)/,h.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,h.item=l(h.item,"gm")(/bull/g,h.bullet)(),h.list=l(h.list)(/bull/g,h.bullet)("hr","\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))")("def","\\n+(?="+h.def.source+")")(),h.blockquote=l(h.blockquote)("def",h.def)(),h._tag="(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b",h.html=l(h.html)("comment",/<!--[\s\S]*?-->/)("closed",/<(tag)[\s\S]+?<\/\1>/)("closing",/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,h._tag)(),h.paragraph=l(h.paragraph)("hr",h.hr)("heading",h.heading)("lheading",h.lheading)("blockquote",h.blockquote)("tag","<"+h._tag)("def",h.def)(),h.normal=u({},h),h.gfm=u({},h.normal,{fences:/^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,paragraph:/^/}),h.gfm.paragraph=l(h.paragraph)("(?!","(?!"+h.gfm.fences.source.replace("\\1","\\2")+"|"+h.list.source.replace("\\1","\\3")+"|")(),h.tables=u({},h.gfm,{nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/}),e.rules=h,e.lex=function(t,n){var i=new e(n);return i.lex(t)},e.prototype.lex=function(e){return e=e.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    ").replace(/\u00a0/g," ").replace(/\u2424/g,"\n"),this.token(e,!0)},e.prototype.token=function(e,t,n){for(var i,s,r,o,a,l,c,u,p,e=e.replace(/^ +$/gm,"");e;)if((r=this.rules.newline.exec(e))&&(e=e.substring(r[0].length),r[0].length>1&&this.tokens.push({type:"space"})),r=this.rules.code.exec(e))e=e.substring(r[0].length),r=r[0].replace(/^ {4}/gm,""),this.tokens.push({type:"code",text:this.options.pedantic?r:r.replace(/\n+$/,"")});else if(r=this.rules.fences.exec(e))e=e.substring(r[0].length),this.tokens.push({type:"code",lang:r[2],text:r[3]});else if(r=this.rules.heading.exec(e))e=e.substring(r[0].length),this.tokens.push({type:"heading",depth:r[1].length,text:r[2]});else if(t&&(r=this.rules.nptable.exec(e))){for(e=e.substring(r[0].length),l={type:"table",header:r[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:r[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:r[3].replace(/\n$/,"").split("\n")},u=0;u<l.align.length;u++)/^ *-+: *$/.test(l.align[u])?l.align[u]="right":/^ *:-+: *$/.test(l.align[u])?l.align[u]="center":/^ *:-+ *$/.test(l.align[u])?l.align[u]="left":l.align[u]=null;for(u=0;u<l.cells.length;u++)l.cells[u]=l.cells[u].split(/ *\| */);this.tokens.push(l)}else if(r=this.rules.lheading.exec(e))e=e.substring(r[0].length),this.tokens.push({type:"heading",depth:"="===r[2]?1:2,text:r[1]});else if(r=this.rules.hr.exec(e))e=e.substring(r[0].length),this.tokens.push({type:"hr"});else if(r=this.rules.blockquote.exec(e))e=e.substring(r[0].length),this.tokens.push({type:"blockquote_start"}),r=r[0].replace(/^ *> ?/gm,""),this.token(r,t,!0),this.tokens.push({type:"blockquote_end"});else if(r=this.rules.list.exec(e)){for(e=e.substring(r[0].length),o=r[2],this.tokens.push({type:"list_start",ordered:o.length>1}),r=r[0].match(this.rules.item),i=!1,p=r.length,u=0;p>u;u++)l=r[u],c=l.length,l=l.replace(/^ *([*+-]|\d+\.) +/,""),~l.indexOf("\n ")&&(c-=l.length,l=this.options.pedantic?l.replace(/^ {1,4}/gm,""):l.replace(new RegExp("^ {1,"+c+"}","gm"),"")),this.options.smartLists&&u!==p-1&&(a=h.bullet.exec(r[u+1])[0],o===a||o.length>1&&a.length>1||(e=r.slice(u+1).join("\n")+e,u=p-1)),s=i||/\n\n(?!\s*$)/.test(l),u!==p-1&&(i="\n"===l.charAt(l.length-1),s||(s=i)),this.tokens.push({type:s?"loose_item_start":"list_item_start"}),this.token(l,!1,n),this.tokens.push({type:"list_item_end"});this.tokens.push({type:"list_end"})}else if(r=this.rules.html.exec(e))e=e.substring(r[0].length),this.tokens.push({type:this.options.sanitize?"paragraph":"html",pre:"pre"===r[1]||"script"===r[1]||"style"===r[1],text:r[0]});else if(!n&&t&&(r=this.rules.def.exec(e)))e=e.substring(r[0].length),this.tokens.links[r[1].toLowerCase()]={href:r[2],title:r[3]};else if(t&&(r=this.rules.table.exec(e))){for(e=e.substring(r[0].length),l={type:"table",header:r[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:r[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:r[3].replace(/(?: *\| *)?\n$/,"").split("\n")},u=0;u<l.align.length;u++)/^ *-+: *$/.test(l.align[u])?l.align[u]="right":/^ *:-+: *$/.test(l.align[u])?l.align[u]="center":/^ *:-+ *$/.test(l.align[u])?l.align[u]="left":l.align[u]=null;for(u=0;u<l.cells.length;u++)l.cells[u]=l.cells[u].replace(/^ *\| *| *\| *$/g,"").split(/ *\| */);this.tokens.push(l)}else if(t&&(r=this.rules.paragraph.exec(e)))e=e.substring(r[0].length),this.tokens.push({type:"paragraph",text:"\n"===r[1].charAt(r[1].length-1)?r[1].slice(0,-1):r[1]});else if(r=this.rules.text.exec(e))e=e.substring(r[0].length),this.tokens.push({type:"text",text:r[0]});else if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0));return this.tokens};var d={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:c,tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,em:/^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,code:/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,del:c,text:/^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/};d._inside=/(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/,d._href=/\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/,d.link=l(d.link)("inside",d._inside)("href",d._href)(),d.reflink=l(d.reflink)("inside",d._inside)(),d.normal=u({},d),d.pedantic=u({},d.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/}),d.gfm=u({},d.normal,{escape:l(d.escape)("])","~|])")(),url:/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,del:/^~~(?=\S)([\s\S]*?\S)~~/,text:l(d.text)("]|","~]|")("|","|https?://|")()}),d.breaks=u({},d.gfm,{br:l(d.br)("{2,}","*")(),text:l(d.gfm.text)("{2,}","*")()}),i.rules=d,i.output=function(e,t,n){var s=new i(t,n);return s.output(e)},i.prototype.output=function(e){for(var t,n,i,s,r="";e;)if(s=this.rules.escape.exec(e))e=e.substring(s[0].length),r+=s[1];else if(s=this.rules.autolink.exec(e))e=e.substring(s[0].length),"@"===s[2]?(n=":"===s[1].charAt(6)?this.mangle(s[1].substring(7)):this.mangle(s[1]),i=this.mangle("mailto:")+n):(n=o(s[1]),i=n),r+=this.renderer.link(i,null,n);else if(this.inLink||!(s=this.rules.url.exec(e))){if(s=this.rules.tag.exec(e))!this.inLink&&/^<a /i.test(s[0])?this.inLink=!0:this.inLink&&/^<\/a>/i.test(s[0])&&(this.inLink=!1),e=e.substring(s[0].length),r+=this.options.sanitize?o(s[0]):s[0];else if(s=this.rules.link.exec(e))e=e.substring(s[0].length),this.inLink=!0,r+=this.outputLink(s,{href:s[2],title:s[3]}),this.inLink=!1;else if((s=this.rules.reflink.exec(e))||(s=this.rules.nolink.exec(e))){if(e=e.substring(s[0].length),t=(s[2]||s[1]).replace(/\s+/g," "),t=this.links[t.toLowerCase()],!t||!t.href){r+=s[0].charAt(0),e=s[0].substring(1)+e;continue}this.inLink=!0,r+=this.outputLink(s,t),this.inLink=!1}else if(s=this.rules.strong.exec(e))e=e.substring(s[0].length),r+=this.renderer.strong(this.output(s[2]||s[1]));else if(s=this.rules.em.exec(e))e=e.substring(s[0].length),r+=this.renderer.em(this.output(s[2]||s[1]));else if(s=this.rules.code.exec(e))e=e.substring(s[0].length),r+=this.renderer.codespan(o(s[2],!0));else if(s=this.rules.br.exec(e))e=e.substring(s[0].length),r+=this.renderer.br();else if(s=this.rules.del.exec(e))e=e.substring(s[0].length),r+=this.renderer.del(this.output(s[1]));else if(s=this.rules.text.exec(e))e=e.substring(s[0].length),r+=o(this.smartypants(s[0]));else if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0))}else e=e.substring(s[0].length),n=o(s[1]),i=n,r+=this.renderer.link(i,null,n);return r},i.prototype.outputLink=function(e,t){
var n=o(t.href),i=t.title?o(t.title):null;return"!"!==e[0].charAt(0)?this.renderer.link(n,i,this.output(e[1])):this.renderer.image(n,i,o(e[1]))},i.prototype.smartypants=function(e){return this.options.smartypants?e.replace(/--/g,"—").replace(/(^|[-\u2014\/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014\/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…"):e},i.prototype.mangle=function(e){for(var t,n="",i=e.length,s=0;i>s;s++)t=e.charCodeAt(s),Math.random()>.5&&(t="x"+t.toString(16)),n+="&#"+t+";";return n},s.prototype.code=function(e,t,n){if(this.options.highlight){var i=this.options.highlight(e,t);null!=i&&i!==e&&(n=!0,e=i)}return t?'<pre><code class="'+this.options.langPrefix+o(t,!0)+'">'+(n?e:o(e,!0))+"\n</code></pre>\n":"<pre><code>"+(n?e:o(e,!0))+"\n</code></pre>"},s.prototype.blockquote=function(e){return"<blockquote>\n"+e+"</blockquote>\n"},s.prototype.html=function(e){return e},s.prototype.heading=function(e,t,n){return"<h"+t+' id="'+this.options.headerPrefix+n.toLowerCase().replace(/[^\w]+/g,"-")+'">'+e+"</h"+t+">\n"},s.prototype.hr=function(){return this.options.xhtml?"<hr/>\n":"<hr>\n"},s.prototype.list=function(e,t){var n=t?"ol":"ul";return"<"+n+">\n"+e+"</"+n+">\n"},s.prototype.listitem=function(e){return"<li>"+e+"</li>\n"},s.prototype.paragraph=function(e){return"<p>"+e+"</p>\n"},s.prototype.table=function(e,t){return"<table>\n<thead>\n"+e+"</thead>\n<tbody>\n"+t+"</tbody>\n</table>\n"},s.prototype.tablerow=function(e){return"<tr>\n"+e+"</tr>\n"},s.prototype.tablecell=function(e,t){var n=t.header?"th":"td",i=t.align?"<"+n+' style="text-align:'+t.align+'">':"<"+n+">";return i+e+"</"+n+">\n"},s.prototype.strong=function(e){return"<strong>"+e+"</strong>"},s.prototype.em=function(e){return"<em>"+e+"</em>"},s.prototype.codespan=function(e){return"<code>"+e+"</code>"},s.prototype.br=function(){return this.options.xhtml?"<br/>":"<br>"},s.prototype.del=function(e){return"<del>"+e+"</del>"},s.prototype.link=function(e,t,n){if(this.options.sanitize){try{var i=decodeURIComponent(a(e)).replace(/[^\w:]/g,"").toLowerCase()}catch(s){return""}if(0===i.indexOf("javascript:")||0===i.indexOf("vbscript:"))return""}var r='<a href="'+e+'"';return t&&(r+=' title="'+t+'"'),r+=">"+n+"</a>"},s.prototype.image=function(e,t,n){var i='<img src="'+e+'" alt="'+n+'"';return t&&(i+=' title="'+t+'"'),i+=this.options.xhtml?"/>":">"},r.parse=function(e,t,n){var i=new r(t,n);return i.parse(e)},r.prototype.parse=function(e){this.inline=new i(e.links,this.options,this.renderer),this.tokens=e.reverse();for(var t="";this.next();)t+=this.tok();return t},r.prototype.next=function(){return this.token=this.tokens.pop()},r.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0},r.prototype.parseText=function(){for(var e=this.token.text;"text"===this.peek().type;)e+="\n"+this.next().text;return this.inline.output(e)},r.prototype.tok=function(){switch(this.token.type){case"space":return"";case"hr":return this.renderer.hr();case"heading":return this.renderer.heading(this.inline.output(this.token.text),this.token.depth,this.token.text);case"code":return this.renderer.code(this.token.text,this.token.lang,this.token.escaped);case"table":var e,t,n,i,s,r="",o="";for(n="",e=0;e<this.token.header.length;e++)i={header:!0,align:this.token.align[e]},n+=this.renderer.tablecell(this.inline.output(this.token.header[e]),{header:!0,align:this.token.align[e]});for(r+=this.renderer.tablerow(n),e=0;e<this.token.cells.length;e++){for(t=this.token.cells[e],n="",s=0;s<t.length;s++)n+=this.renderer.tablecell(this.inline.output(t[s]),{header:!1,align:this.token.align[s]});o+=this.renderer.tablerow(n)}return this.renderer.table(r,o);case"blockquote_start":for(var o="";"blockquote_end"!==this.next().type;)o+=this.tok();return this.renderer.blockquote(o);case"list_start":for(var o="",a=this.token.ordered;"list_end"!==this.next().type;)o+=this.tok();return this.renderer.list(o,a);case"list_item_start":for(var o="";"list_item_end"!==this.next().type;)o+="text"===this.token.type?this.parseText():this.tok();return this.renderer.listitem(o);case"loose_item_start":for(var o="";"list_item_end"!==this.next().type;)o+=this.tok();return this.renderer.listitem(o);case"html":var l=this.token.pre||this.options.pedantic?this.token.text:this.inline.output(this.token.text);return this.renderer.html(l);case"paragraph":return this.renderer.paragraph(this.inline.output(this.token.text));case"text":return this.renderer.paragraph(this.parseText())}},c.exec=c,p.options=p.setOptions=function(e){return u(p.defaults,e),p},p.defaults={gfm:!0,tables:!0,breaks:!1,pedantic:!1,sanitize:!1,smartLists:!1,silent:!1,highlight:null,langPrefix:"lang-",smartypants:!1,headerPrefix:"",renderer:new s,xhtml:!1},p.Parser=r,p.parser=r.parse,p.Renderer=s,p.Lexer=e,p.lexer=e.lex,p.InlineLexer=i,p.inlineLexer=i.output,p.parse=p,"undefined"!=typeof t&&"object"==typeof n?t.exports=p:"function"==typeof define&&define.amd?define(function(){return p}):this.marked=p}).call(function(){return this||("undefined"!=typeof window?window:e)}())}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1]);