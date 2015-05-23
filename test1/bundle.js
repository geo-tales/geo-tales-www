(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global document, alert*/
'use strict';

var makeStory = require('./story');

document.addEventListener('DOMContentLoaded', function () {

  try {
    var story = makeStory.fromJson({
      locations: {
        'A': {
          type: 'circle',
          center: {
            latitude: 47.400217,
            longitude: 8.440767
          },
          radius: 5
        },
        'B': {
          type: 'circle',
          center: {
            latitude: 47.400650,
            longitude: 8.441100
          },
          radius: 5
        }
      },
      screens: {
        start: {
          type: 'text',
          text: '## Hallo Patrik\n\nWir haben dieses kleine Spiel für dich gebastelt. Vorsicht, es macht eigentlich keinen Sinn.\n\nBeachte die Farben beim navigieren ;)\n\nViel Spass!',
          next: '0'
        },
        '0': {
          type: 'navigate',
          location: 'A',
          next: '1',
          options: {
            colorSteps: 3
          },
        },
        '1': {
          type: 'choices',
          text: '## Multiple Choice (yay!)',
          choices: [{
            text: 'Nimm mich!',
            points: 5
          }, {
            text: 'Nein mich',
            points: 2
          }, {
            text: 'Oder mich',
            points: 0
          }],
          next: '2'
        },
        '2': {
          type: 'text',
          text: '## Super!\n\nBis hier hin war\'s ja einfach. Jetzt mal nur mit Farbe!',
          next: '3'
        },
        '3': {
          type: 'navigate',
          location: 'B',
          options: {
            colorSteps: 3,
            compass: false,
            distance: false
          },
          next: 'finish'
        },
        'finish': {
          type: 'finish',
          text: '## Fertig!\n\nVielen Dank fürs ausprobieren. Wir machen dann bald mal ein richtiges Spiel draus.\n\nGruss von Eva und Max'
        }
      }
    });

    story(document.body.querySelector('#content'));

  } catch (e) {
    alert(e.message);
  }

});

},{"./story":11}],2:[function(require,module,exports){
/*globals document*/
'use strict';

var animationEndEvent;
var durationStyle;
var delayStyle;
var iterationCountStyle;

(function () {
  var el = document.createElement('div');
  var animations = {
    'animation': [
      'animationend',
      'animationDuration',
      'animationDelay',
      'animationIterationCount'
    ],
    'MozAnimation': [
      'animationend',
      'mozAnimationDuration',
      'mozAnimationDelay',
      'mozAnimationIterationCount'
    ],
    'WebkitAnimation': [
      'webkitAnimationEnd',
      'webkitAnimationDuration',
      'webkitAnimationDelay',
      'webkitAnimationIterationCount'
    ]
  };
  var t, a;
  for (t in animations) {
    if (animations.hasOwnProperty(t) && el.style[t] !== undefined) {
      a = animations[t];
      animationEndEvent = a[0];
      durationStyle = a[1];
      delayStyle = a[2];
      iterationCountStyle = a[3];
      return;
    }
  }
}());

var disabled = false;

function animate(element, animation, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  if (disabled) {
    if (callback) {
      callback();
    }
    return;
  }
  if (opts.delay) {
    element.style[delayStyle] = opts.delay;
  }
  if (opts.duration) {
    element.style[durationStyle] = opts.duration;
  }
  if (opts.iterationCount) {
    element.style[iterationCountStyle] = opts.iterationCount;
  }
  element.classList.add('animated', animation);
  function animationEnd() {
    element.removeEventListener(animationEndEvent, animationEnd);
    element.classList.remove('animated', animation);
    if (callback) {
      callback();
    }
  }
  element.addEventListener(animationEndEvent, animationEnd);
}

animate.disable = function () {
  disabled = true;
};

module.exports = animate;

},{}],3:[function(require,module,exports){
'use strict';


function hexColorOf(n) {
  // n := [0, 0.33]
  var c = Math.min(Math.floor(n * 3 * 255), 255).toString(16);
  return c.length === 1 ? '0' + c : c;
}


module.exports = function (steps) {
  var initialDistance;
  return function (distance) {
    if (!initialDistance) {
      initialDistance = distance;
    }
    var n = (distance - (distance % steps)) / initialDistance;
    var c;
    if (n > 1) {
      if (n > 1.33) {
        c = '0000ff';
      } else {
        c = '00' + hexColorOf(1.33 - n) + 'ff';
      }
    } else if (n <= 0.33) {
      c = 'ff' + hexColorOf(n) + '00';
    } else if (n <= 0.66) {
      c = hexColorOf(0.66 - n) + 'ff00';
    } else {
      c = '00ff' + hexColorOf(n - 0.66);
    }
    return '#' + c;
  };
};

},{}],4:[function(require,module,exports){
'use strict';

var geolib = require('geolib');
var inherits = require('inherits');


function Shape(center) {
  this.center = center;
}

Shape.prototype.distance = function (pos) {
  return geolib.getDistance(this.center, pos);
};

exports.Shape = Shape;



function Circle(center, radius) {
  Shape.call(this, center);
  this.radius = radius;
}

inherits(Circle, Shape);

Circle.prototype.within = function (pos) {
  return this.distance(pos) <= this.radius;
};

exports.Circle = Circle;



function Polygon(coords) {
  Shape.call(this, geolib.getCenter(coords));
  this.coords = coords;
}

inherits(Polygon, Shape);

Polygon.prototype.within = function (pos) {
  return geolib.isPointInside(pos, this.coords);
};

exports.Polygon = Polygon;



exports.fromJson = function (json) {
  if (json.type === 'circle') {
    return new Circle(json.center, json.radius);
  }
  if (json.type === 'polygon') {
    return new Polygon(json.coords);
  }
  throw new Error('Unkown type: ' + json.type);
};

},{"geolib":13,"inherits":16}],5:[function(require,module,exports){
(function (global){
/*global navigator*/
'use strict';

var events = require('events');


exports.create = function () {
  var location = new events.EventEmitter();

  function success(event) {
    location.emit('position', {
      latitude: event.coords.latitude,
      longitude: event.coords.longitude,
      accuracy: event.coords.accuracy
    });
  }

  function error(err) {
    location.emit('error', err);
  }

  var watch = navigator.geolocation.watchPosition(success, error, {
    enableHighAccuracy: true,
    maximumAge: 0
  });

  function orientationChange(event) {
    location.emit('heading', event.hasOwnProperty('webkitCompassHeading')
        ? event.webkitCompassHeading
        : event.alpha);
  }

  global.addEventListener('deviceorientation', orientationChange, false);

  location.destroy = function () {
    global.removeEventListener('deviceorientation', orientationChange);
    navigator.geolocation.clearWatch(watch);
  };

  return location;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"events":12}],6:[function(require,module,exports){
'use strict';

var animate = require('./animate');


exports.create = function (screen, text, callback) {
  screen.classList.add('warning');
  var message = screen.querySelector('.message');
  message.innerHTML = text;
  animate(message, 'bounceInDown', function () {
    message.classList.add('animated', 'infinite', 'pulse');
    if (callback) {
      callback();
    }
  });

  return {
    destroy: function (callback) {
      message.classList.remove('animated', 'infinite', 'pulse');
      animate(message, 'bounceOutUp', function () {
        screen.classList.remove('warning');
        if (callback) {
          callback();
        }
      });
    }
  };
};

},{"./animate":2}],7:[function(require,module,exports){
/*global location*/
'use strict';


var hyperglue = require('hyperglue');
var marked = require('marked');
var animate = require('./animate');

var html = "<div class=\"screen\">\n  <div class=\"text\"></div>\n  <div class=\"results\">\n    <ul>\n      <li class=\"result\">\n        <span class=\"name\">&nbsp;</span>\n        <span class=\"value\">&nbsp;</span>\n      </li>\n    </ul>\n  </div>\n  <div class=\"footer\">\n    <button class=\"close\">Close</button>\n  </div>\n</div>\n";

function two(n) {
  return n < 10 ? '0' + n : n;
}
function formatTime(ms) {
  var t = [];
  var h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  var m = Math.floor(ms / 60000);
  ms -= m * 60000;
  var s = Math.floor(ms / 1000);
  t.push(h, two(m), two(s));
  return t.join(':');
}

exports.create = function (parent, markdown, results) {
  var items = [];
  if (results.time) {
    items.push({
      '.name': 'Time:',
      '.value': formatTime(results.time)
    });
  }
  if (typeof results.points === 'number') {
    items.push({
      '.name': 'Points:',
      '.value': String(results.points)
    });
  }
  var screen = hyperglue(html, {
    '.text': {
      _html: marked(markdown
        || '## Congratulations!\n\nYou reached the end of this story.')
    },
    '.result': items
  });
  parent.appendChild(screen);
  var text = screen.querySelector('.text');
  animate(text, 'zoomIn', {
    delay: '.5s',
    duration: '2s'
  }, function () {
    screen.querySelector('.close').onclick = function () {
      animate(screen, 'zoomOut', {
        duration: '2s'
      }, function () {
        location.reload();
      });
    };
  });
};

},{"./animate":2,"hyperglue":14,"marked":17}],8:[function(require,module,exports){
'use strict';


var hyperglue = require('hyperglue');
var marked = require('marked');
var animate = require('./animate');

var html = "<div class=\"screen\">\n  <div class=\"text\"></div>\n  <form action=\"#\">\n    <ul>\n      <li class=\"choice\">\n        <label>\n          <input type=\"radio\" name=\"choice\">\n          <span class=\"label\">&nbsp;</span>\n        </label>\n      </li>\n    </ul>\n  </form>\n  <div class=\"footer\">\n    <button class=\"next\">&#8594;</button>\n  </div>\n</div>\n";


exports.create = function (parent, markdown, choices, next) {
  var items = choices.map(function (item, index) {
    return {
      '.label': {
        _html: marked(item.text).trim().replace(/^<p>|<\/p>$/g, '')
      },
      'input': {
        'value': String(index)
      }
    };
  });
  var screen = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    },
    '.choice': items
  });
  var footer = screen.querySelector('.footer');
  footer.style.display = 'none';
  parent.appendChild(screen);
  var text = screen.querySelector('.text');
  animate(text, 'bounceInUp', {
    delay: '.5s'
  });
  var footerVisible = false;
  var form = screen.querySelector('form');
  Array.prototype.slice.call(form.querySelectorAll('input'))
    .forEach(function (input) {
      input.onchange = function () {
        if (!footerVisible) {
          footerVisible = true;
          footer.style.display = 'block';
          animate(footer, 'bounceInUp', {
            delay: '.1s'
          });
        }
      };
    });
  animate(form, 'bounceInUp', {
    delay: '.58s'
  }, function () {
    screen.querySelector('.next').onclick = function () {
      var checkedInput = form.querySelector('input[name=choice]:checked');
      if (!checkedInput) {
        return;
      }
      var choice = choices[checkedInput.value];
      animate(screen, 'slideOutLeft', function () {
        next(choice);
      });
    };
  });
};

},{"./animate":2,"hyperglue":14,"marked":17}],9:[function(require,module,exports){
/*global document*/
'use strict';


var hyperglue = require('hyperglue');
var locationTracker = require('./location-tracker');
var animate = require('./animate');
var color = require('./color');
var message = require('./message');

var html = "<div class=\"screen\">\n  <div class=\"message\"></div>\n  <div class=\"compass\">\n    <div class=\"arrow\">&#10143;</div>\n  </div>\n  <div class=\"distance\"></div>\n  <div class=\"accuracy\"></div>\n</div>\n";

var POSITION_ERRORS = {
  1: 'Position tracking not allowed',
  2: 'Position tracking unavailable',
  3: 'Position tracking timeout',
  DEFAULT: 'Position tracking error'
};


exports.create = function (parent, shape, opts, next) {
  var screen = hyperglue(html, {});
  if (opts.compass === false) {
    screen.querySelector('.compass').style.display = 'none';
  }
  parent.appendChild(screen);

  var sx = shape.center.latitude;
  var sy = shape.center.longitude;
  var mx, my, deg;
  var lastPos;
  var visible = false;
  var animating = false;
  var arrow = screen.querySelector('.arrow');

  function updateArrow() {
    // http://www.movable-type.co.uk/scripts/latlong.html
    mx = lastPos.latitude;
    my = lastPos.longitude;
    var wy = sy - my;
    var x = Math.cos(mx) * Math.sin(sx)
      - Math.sin(mx) * Math.cos(sx) * Math.cos(wy);
    var y = Math.sin(wy) * Math.cos(sx);
    var d = Math.atan2(x, y) * 180 / Math.PI;
    var transform = 'rotate(' + Math.round(d - deg + 180) + 'deg)';
    arrow.style.transform = transform;
    arrow.style.webkitTransform = transform;
    if (!visible) {
      visible = true;
      animating = true;
      arrow.style.visibility = 'visible';
      animate(arrow, 'zoomIn', function () {
        animating = false;
        updateArrow();
      });
    }
  }

  var tracker = locationTracker.create();
  var makeColor = opts.colorSteps ? color(opts.colorSteps) : null;
  var accuracyElement = screen.querySelector('.accuracy');
  var distanceElement = screen.querySelector('.distance');

  tracker.on('error', function (err) {
    visible = false;
    arrow.style.visibility = 'hidden';
    document.documentElement.style.backgroundColor = 'inherit';
    animating = true;
    var text = POSITION_ERRORS[err.code] || POSITION_ERRORS.DEFAULT;
    message.create(screen, text);
  });

  function updateAccuracy() {
    var acc = lastPos.accuracy;
    var pre = acc < 20 ? '' : 'Accuracy: ';
    accuracyElement.innerHTML = pre + Math.round(acc || 10000) + ' m';
  }

  tracker.on('position', function (pos) {
    lastPos = pos;
    if (animating) {
      return;
    }
    var distance = shape.distance(pos);
    if (opts.distance !== false) {
      distanceElement.innerHTML = distance + ' m';
      updateAccuracy();
    }
    if (deg !== undefined) {
      updateArrow();
    }
    var goodAccuracy = pos.accuracy && pos.accuracy < 20;
    if (goodAccuracy) {
      if (accuracyElement.classList.contains('bad')) {
        accuracyElement.classList.remove('bad');
        if (opts.distance === false) {
          accuracyElement.innerHTML = '';
        }
      }
    } else {
      accuracyElement.classList.add('bad');
      if (opts.distance === false) {
        updateAccuracy();
      }
    }
    if (makeColor) {
      document.documentElement.style.backgroundColor = goodAccuracy
        ? makeColor(distance)
        : 'inherit';
    }
    if (shape.within(pos)) {
      tracker.destroy();
      animate(screen, 'flash', { iterationCount: 3 }, function () {
        document.documentElement.style.backgroundColor = 'inherit';
        next();
      });
    }
  });

  if (opts.compass !== false) {
    tracker.on('heading', function (heading) {
      if (!heading) {
        return;
      }
      deg = heading;
      if (lastPos && !animating) {
        updateArrow();
      }
    });
  }
};

},{"./animate":2,"./color":3,"./location-tracker":5,"./message":6,"hyperglue":14}],10:[function(require,module,exports){
'use strict';


var hyperglue = require('hyperglue');
var marked = require('marked');
var animate = require('./animate');

var html = "<div class=\"screen\">\n  <div class=\"text\"></div>\n  <div class=\"footer\">\n    <button class=\"next\">&#8594;</button>\n  </div>\n</div>\n";


exports.create = function (parent, markdown, next) {
  var screen = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    }
  });
  parent.appendChild(screen);
  var text = screen.querySelector('.text');
  animate(text, 'bounceInUp', {
    delay: '.5s'
  }, function () {
    screen.querySelector('.next').onclick = function () {
      animate(screen, 'slideOutLeft', next);
    };
  });
};

},{"./animate":2,"hyperglue":14,"marked":17}],11:[function(require,module,exports){
'use strict';

var locationModel = require('./location-model');
var screenText = require('./screen-text');
var screenChoices = require('./screen-multiple-choice');
var screenNavigate = require('./screen-navigate');
var screenFinish = require('./screen-finish');


function throwScreenError(name, what) {
  throw new Error('Screen "' + name + '" ' + what);
}

function assertScreenProperty(name, json, property) {
  if (!json[property]) {
    throwScreenError(name, 'has no ' + property);
  }
}

function assertScreenExists(screens, name, next) {
  if (!screens[next]) {
    throwScreenError(name, 'has unknown next "' + next + '"');
  }
}

function checkScreens(screens, locations) {
  var hasFinish = false;
  Object.keys(screens).forEach(function (name) {
    var json = screens[name];
    assertScreenProperty(name, json, 'type');
    switch (json.type) {
    case 'text':
      assertScreenProperty(name, json, 'text');
      assertScreenProperty(name, json, 'next');
      assertScreenExists(screens, name, json.next);
      break;
    case 'choices':
      assertScreenProperty(name, json, 'text');
      assertScreenProperty(name, json, 'choices');
      if (json.next) {
        assertScreenExists(screens, name, json.next);
      }
      json.choices.forEach(function (choice) {
        if (!choice.text) {
          throwScreenError(name, 'has choice without text');
        }
        if (!json.next && !choice.next) {
          throwScreenError(name, 'has choice without next');
        }
        if (choice.next && !screens[choice.next]) {
          throwScreenError(name, 'has choice with unknown next "'
            + choice.next + '"');
        }
      });
      break;
    case 'navigate':
      assertScreenProperty(name, json, 'location');
      var location = locations[json.location];
      if (!location) {
        throwScreenError(name, 'has unknown location "' + json.location + '"');
      }
      assertScreenProperty(name, json, 'next');
      assertScreenExists(screens, name, json.next);
      break;
    case 'finish':
      hasFinish = true;
      break;
    default:
      throwScreenError(name, 'has unknown type "' + json.type + '"');
    }
  });
  if (!hasFinish) {
    throw new Error('Missing "finish" screen');
  }
}

function createScreen(screens, name, div, locations, context) {
  var json = screens[name];
  switch (json.type) {
  case 'text':
    screenText.create(div, json.text, function () {
      div.innerHTML = '';
      createScreen(screens, json.next, div, locations, context);
    });
    break;
  case 'choices':
    screenChoices.create(div, json.text, json.choices, function (choice) {
      div.innerHTML = '';
      if (choice.hasOwnProperty('points')) {
        context.points = (context.points || 0) + choice.points;
      }
      createScreen(screens, choice.next || json.next, div, locations, context);
    });
    break;
  case 'navigate':
    var location = locations[json.location];
    screenNavigate.create(div, location, json.options || {}, function () {
      div.innerHTML = '';
      createScreen(screens, json.next, div, locations, context);
    });
    break;
  case 'finish':
    var results = {
      time: Date.now() - context.startTime
    };
    if (context.hasOwnProperty('points')) {
      results.points = context.points;
    }
    screenFinish.create(div, json.text, results);
    break;
  }
}


exports.fromJson = function (json) {
  if (!json.locations) {
    throw new Error('No locations');
  }
  if (!json.screens) {
    throw new Error('No screens');
  }
  var locations = {};
  Object.keys(json.locations).forEach(function (locationId) {
    locations[locationId] = locationModel.fromJson(json.locations[locationId]);
  });
  if (!json.screens.start) {
    throw new Error('Missing "start" screen');
  }
  checkScreens(json.screens, locations);
  return function story(div) {
    createScreen(json.screens, 'start', div, locations, {
      startTime: Date.now()
    });
  };
};

},{"./location-model":4,"./screen-finish":7,"./screen-multiple-choice":8,"./screen-navigate":9,"./screen-text":10}],12:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],13:[function(require,module,exports){
/*! geolib 2.0.14 by Manuel Bieh
* Library to provide geo functions like distance calculation,
* conversion of decimal coordinates to sexagesimal and vice versa, etc.
* WGS 84 (World Geodetic System 1984)
* 
* @author Manuel Bieh
* @url http://www.manuelbieh.com/
* @version 2.0.14
* @license MIT 
**/;(function(global, undefined) {

	"use strict";

	function Geolib() {}

	// Setting readonly defaults
	var geolib = Object.create(Geolib.prototype, {
		version: {
			value: "2.0.14"
		},
		radius: {
			value: 6378137
		},
		minLat: {
			value: -90
		},
		maxLat: {
			value: 90
		},
		minLon: {
			value: -180
		},
		maxLon: {
			value: 180
		},
		sexagesimalPattern: {
			value: /^([0-9]{1,3})°\s*([0-9]{1,3}(?:\.(?:[0-9]{1,2}))?)'\s*(([0-9]{1,3}(\.([0-9]{1,2}))?)"\s*)?([NEOSW]?)$/
		},
		measures: {
			value: Object.create(Object.prototype, {
				"m" : {value: 1},
				"km": {value: 0.001},
				"cm": {value: 100},
				"mm": {value: 1000},
				"mi": {value: (1 / 1609.344)},
				"sm": {value: (1 / 1852.216)},
				"ft": {value: (100 / 30.48)},
				"in": {value: (100 / 2.54)},
				"yd": {value: (1 / 0.9144)}
			})
		},
		prototype: {
			value: Geolib.prototype
		},
		extend: {
			value: function(methods, overwrite) {
				for(var prop in methods) {
					if(typeof geolib.prototype[prop] === 'undefined' || overwrite === true) {
						geolib.prototype[prop] = methods[prop];
					}
				}
			}
		}
	});

	if (typeof(Number.prototype.toRad) === "undefined") {
		Number.prototype.toRad = function() {
			return this * Math.PI / 180;
		};
	}

	if (typeof(Number.prototype.toDeg) === "undefined") {
		Number.prototype.toDeg = function() {
			return this * 180 / Math.PI;
		};
	}

	// Here comes the magic
	geolib.extend({

		decimal: {},

		sexagesimal: {},

		distance: null,

		getKeys: function(point) {

			// GeoJSON Array [longitude, latitude(, elevation)]
			if(Object.prototype.toString.call(point) == '[object Array]') {

				return {
					longitude: point.length >= 1 ? 0 : undefined,
					latitude: point.length >= 2 ? 1 : undefined,
					elevation: point.length >= 3 ? 2 : undefined
				};

			}

			var getKey = function(possibleValues) {

				var key;

				possibleValues.every(function(val) {
					// TODO: check if point is an object
					if(typeof point != 'object') {
						return true;
					}
					return point.hasOwnProperty(val) ? (function() { key = val; return false; }()) : true;
				});

				return key;

			};

			var longitude = getKey(['lng', 'lon', 'longitude']);
			var latitude = getKey(['lat', 'latitude']);
			var elevation = getKey(['alt', 'altitude', 'elevation', 'elev']);

			// return undefined if not at least one valid property was found
			if(typeof latitude == 'undefined' && 
				typeof longitude == 'undefined' && 
				typeof elevation == 'undefined') {
				return undefined;
			}

			return {
				latitude: latitude,
				longitude: longitude,
				elevation: elevation
			};

		},

		// returns latitude of a given point, converted to decimal
		// set raw to true to avoid conversion
		getLat: function(point, raw) {
			return raw === true ? point[this.getKeys(point).latitude] : this.useDecimal(point[this.getKeys(point).latitude]);
		},

		// Alias for getLat
		latitude: function(point) {
			return this.getLat.call(this, point);
		},

		// returns longitude of a given point, converted to decimal
		// set raw to true to avoid conversion
		getLon: function(point, raw) {
			return raw === true ? point[this.getKeys(point).longitude] : this.useDecimal(point[this.getKeys(point).longitude]);
		},

		// Alias for getLon
		longitude: function(point) {
			return this.getLon.call(this, point);
		},

		getElev: function(point) {
			return point[this.getKeys(point).elevation];
		},

		// Alias for getElev
		elevation: function(point) {
			return this.getElev.call(this, point);
		},

		coords: function(point, raw) {

			var retval = {
				latitude: raw === true ? point[this.getKeys(point).latitude] : this.useDecimal(point[this.getKeys(point).latitude]),
				longitude: raw === true ? point[this.getKeys(point).longitude] : this.useDecimal(point[this.getKeys(point).longitude])
			};

			var elev = point[this.getKeys(point).elevation];

			if(typeof elev !== 'undefined') {
				retval['elevation'] = elev;
			}

			return retval;

		},

		// checks if a variable contains a valid latlong object
		validate: function(point) {

			var keys = this.getKeys(point);

			if(typeof keys === 'undefined' || typeof keys.latitude === 'undefined' || keys.longitude === 'undefined') {
				return false;
			}

			var lat = point[keys.latitude];
			var lng = point[keys.longitude];

			if(typeof lat === 'undefined' || !this.isDecimal(lat) && !this.isSexagesimal(lat)) {
				return false;
			}

			if(typeof lng === 'undefined' || !this.isDecimal(lng) && !this.isSexagesimal(lng)) {
				return false;
			}

			lat = this.useDecimal(lat);
			lng = this.useDecimal(lng);

			if(lat < this.minLat || lat > this.maxLat || lng < this.minLon || lng > this.maxLon) {
				return false;
			}

			return true;

		},

		/**
		* Calculates geodetic distance between two points specified by latitude/longitude using 
		* Vincenty inverse formula for ellipsoids
		* Vincenty Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2010
		* (Licensed under CC BY 3.0)
		*
		* @param    object    Start position {latitude: 123, longitude: 123}
		* @param    object    End position {latitude: 123, longitude: 123}
		* @param    integer   Accuracy (in meters)
		* @return   integer   Distance (in meters)
		*/
		getDistance: function(start, end, accuracy) {

			accuracy = Math.floor(accuracy) || 1;

			var s = this.coords(start);
			var e = this.coords(end);

			var a = 6378137, b = 6356752.314245,  f = 1/298.257223563;  // WGS-84 ellipsoid params
			var L = (e['longitude']-s['longitude']).toRad();

			var cosSigma, sigma, sinAlpha, cosSqAlpha, cos2SigmaM, sinSigma;

			var U1 = Math.atan((1-f) * Math.tan(parseFloat(s['latitude']).toRad()));
			var U2 = Math.atan((1-f) * Math.tan(parseFloat(e['latitude']).toRad()));
			var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
			var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

			var lambda = L, lambdaP, iterLimit = 100;
			do {
				var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
				sinSigma = (
					Math.sqrt(
						(
							cosU2 * sinLambda
						) * (
							cosU2 * sinLambda
						) + (
							cosU1 * sinU2 - sinU1 * cosU2 * cosLambda
						) * (
							cosU1 * sinU2 - sinU1 * cosU2 * cosLambda
						)
					)
				);
				if (sinSigma === 0) {
					return geolib.distance = 0;  // co-incident points
				}

				cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
				sigma = Math.atan2(sinSigma, cosSigma);
				sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
				cosSqAlpha = 1 - sinAlpha * sinAlpha;
				cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;

				if (isNaN(cos2SigmaM)) {
					cos2SigmaM = 0;  // equatorial line: cosSqAlpha=0 (§6)
				}
				var C = (
					f / 16 * cosSqAlpha * (
						4 + f * (
							4 - 3 * cosSqAlpha
						)
					)
				);
				lambdaP = lambda;
				lambda = (
					L + (
						1 - C
					) * f * sinAlpha * (
						sigma + C * sinSigma * (
							cos2SigmaM + C * cosSigma * (
								-1 + 2 * cos2SigmaM * cos2SigmaM
							)
						)
					)
				);

			} while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0);

			if (iterLimit === 0) {
				return NaN;  // formula failed to converge
			}

			var uSq = (
				cosSqAlpha * (
					a * a - b * b
				) / (
					b*b
				)
			);

			var A = (
				1 + uSq / 16384 * (
					4096 + uSq * (
						-768 + uSq * (
							320 - 175 * uSq
						)
					)
				)
			);

			var B = (
				uSq / 1024 * (
					256 + uSq * (
						-128 + uSq * (
							74-47 * uSq
						)
					)
				)
			);

			var deltaSigma = (
				B * sinSigma * (
					cos2SigmaM + B / 4 * (
						cosSigma * (
							-1 + 2 * cos2SigmaM * cos2SigmaM
						) -B / 6 * cos2SigmaM * (
							-3 + 4 * sinSigma * sinSigma
						) * (
							-3 + 4 * cos2SigmaM * cos2SigmaM
						)
					)
				)
			);

			var distance = b * A * (sigma - deltaSigma);

			distance = distance.toFixed(3); // round to 1mm precision

			//if (start.hasOwnProperty(elevation) && end.hasOwnProperty(elevation)) {
			if (typeof this.elevation(start) !== 'undefined' && typeof this.elevation(end) !== 'undefined') {
				var climb = Math.abs(this.elevation(start) - this.elevation(end));
				distance = Math.sqrt(distance * distance + climb * climb);
			}

			return this.distance = Math.floor(
				Math.round(distance / accuracy) * accuracy
			);

			/*
			// note: to return initial/final bearings in addition to distance, use something like:
			var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
			var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);

			return { distance: s, initialBearing: fwdAz.toDeg(), finalBearing: revAz.toDeg() };
			*/

		},


		/**
		* Calculates the distance between two spots. 
		* This method is more simple but also far more inaccurate
		*
		* @param    object    Start position {latitude: 123, longitude: 123}
		* @param    object    End position {latitude: 123, longitude: 123}
		* @param    integer   Accuracy (in meters)
		* @return   integer   Distance (in meters)
		*/
		getDistanceSimple: function(start, end, accuracy) {

			accuracy = Math.floor(accuracy) || 1;

			var distance = 
				Math.round(
					Math.acos(
						Math.sin(
							this.latitude(end).toRad()
						) * 
						Math.sin(
							this.latitude(start).toRad()
						) + 
						Math.cos(
							this.latitude(end).toRad()
						) * 
						Math.cos(
							this.latitude(start).toRad()
						) * 
						Math.cos(
							this.longitude(start).toRad() - this.longitude(end).toRad()
						) 
					) * this.radius
				);

			return geolib.distance = Math.floor(Math.round(distance/accuracy)*accuracy);

		},


		/**
		* Calculates the center of a collection of geo coordinates
		*
		* @param		array		Collection of coords [{latitude: 51.510, longitude: 7.1321}, {latitude: 49.1238, longitude: "8° 30' W"}, ...]
		* @return		object		{latitude: centerLat, longitude: centerLng, distance: diagonalDistance}
		*/
		getCenter: function(coords) {

			if (!coords.length) {
				return false;
			}

			var max = function( array ){
				return Math.max.apply( Math, array );
			};

			var min = function( array ){
				return Math.min.apply( Math, array );
			};

			var	latitude;
			var longitude;
			var splitCoords = {latitude: [], longitude: []};

			for(var coord in coords) {

				splitCoords.latitude.push(
					this.latitude(coords[coord])
				);

				splitCoords.longitude.push(
					this.longitude(coords[coord])
				);

			}

			var minLat = min(splitCoords.latitude);
			var minLon = min(splitCoords.longitude);
			var maxLat = max(splitCoords.latitude);
			var maxLon = max(splitCoords.longitude);

			latitude = ((minLat + maxLat)/2).toFixed(6);
			longitude = ((minLon + maxLon)/2).toFixed(6);

			// distance from the deepest left to the highest right point (diagonal distance)
			var distance = this.convertUnit('km', this.getDistance({latitude: minLat, longitude: minLon}, {latitude: maxLat, longitude: maxLon}));

			return {
				latitude: latitude, 
				longitude: longitude, 
				distance: distance
			};

		},



		/**
		* Gets the max and min, latitude, longitude, and elevation (if provided).
		* @param		array		array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return	object		{maxLat: maxLat,
		*                     minLat: minLat		
		*                     maxLng: maxLng,
		*                     minLng: minLng,
		*                     maxElev: maxElev,
		*                     minElev: minElev}
		*/
		getBounds: function(coords) {

			if (!coords.length) {
				return false;
			}

			var useElevation = this.elevation(coords[0]);

			var stats = {
				maxLat: -Infinity,
				minLat: Infinity,
				maxLng: -Infinity,
				minLng: Infinity
			};

			if (typeof useElevation != 'undefined') {
				stats.maxElev = 0;
				stats.minElev = Infinity;
			}

			for (var i = 0, l = coords.length; i < l; ++i) {

				stats.maxLat = Math.max(this.latitude(coords[i]), stats.maxLat);
				stats.minLat = Math.min(this.latitude(coords[i]), stats.minLat);
				stats.maxLng = Math.max(this.longitude(coords[i]), stats.maxLng);
				stats.minLng = Math.min(this.longitude(coords[i]), stats.minLng);

				if (useElevation) {
					stats.maxElev = Math.max(this.elevation(coords[i]), stats.maxElev);
					stats.minElev = Math.min(this.elevation(coords[i]), stats.minElev);
				}

			}

			return stats;

		},


		/**
		* Computes the bounding coordinates of all points on the surface
		* of the earth less than or equal to the specified great circle
		* distance.
		*
		* @param object Point position {latitude: 123, longitude: 123}
		* @param number Distance (in meters).
		* @return array Collection of two points defining the SW and NE corners.
		*/
		getBoundsOfDistance: function(point, distance) {

			var latitude = this.latitude(point);
			var longitude = this.longitude(point);

			var radLat = latitude.toRad();
			var radLon = longitude.toRad();

			var radDist = distance / this.radius;
			var minLat = radLat - radDist;
			var maxLat = radLat + radDist;

			var MAX_LAT_RAD = this.maxLat.toRad();
			var MIN_LAT_RAD = this.minLat.toRad();
			var MAX_LON_RAD = this.maxLon.toRad();
			var MIN_LON_RAD = this.minLon.toRad();

			var minLon;
			var maxLon;

			if (minLat > MIN_LAT_RAD && maxLat < MAX_LAT_RAD) {

				var deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
				minLon = radLon - deltaLon;

				if (minLon < MIN_LON_RAD) {
					minLon += 2 * Math.PI;
				}

				maxLon = radLon + deltaLon;

				if (maxLon > MAX_LON_RAD) {
					maxLon -= 2 * Math.PI;
				}

			} else {
				// A pole is within the distance.
				minLat = Math.max(minLat, MIN_LAT_RAD);
				maxLat = Math.min(maxLat, MAX_LAT_RAD);
				minLon = MIN_LON_RAD;
				maxLon = MAX_LON_RAD;
			}

			return [
				// Southwest
				{
					latitude: minLat.toDeg(), 
					longitude: minLon.toDeg()
				},
				// Northeast
				{
					latitude: maxLat.toDeg(), 
					longitude: maxLon.toDeg()
				}
			];

		},


		/**
		* Checks whether a point is inside of a polygon or not.
		* Note that the polygon coords must be in correct order!
		*
		* @param		object		coordinate to check e.g. {latitude: 51.5023, longitude: 7.3815}
		* @param		array		array with coords e.g. [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return		bool		true if the coordinate is inside the given polygon
		*/
		isPointInside: function(latlng, coords) {

			for(var c = false, i = -1, l = coords.length, j = l - 1; ++i < l; j = i) {

				if(
					(
						(this.longitude(coords[i]) <= this.longitude(latlng) && this.longitude(latlng) < this.longitude(coords[j])) ||
						(this.longitude(coords[j]) <= this.longitude(latlng) && this.longitude(latlng) < this.longitude(coords[i]))
					) && 
					(
						this.latitude(latlng) < (this.latitude(coords[j]) - this.latitude(coords[i])) * 
						(this.longitude(latlng) - this.longitude(coords[i])) / 
						(this.longitude(coords[j]) - this.longitude(coords[i])) + 
						this.latitude(coords[i])
					)
				) {
					c = !c;
				}

			}

			return c;

		},


		/**
		* Shortcut for geolib.isPointInside()
		*/
		isInside: function() {
			return this.isPointInside.apply(this, arguments);
		},


		/**
		* Checks whether a point is inside of a circle or not.
		*
		* @param		object		coordinate to check (e.g. {latitude: 51.5023, longitude: 7.3815})
		* @param		object		coordinate of the circle's center (e.g. {latitude: 51.4812, longitude: 7.4025})
		* @param		integer		maximum radius in meters 
		* @return		bool		true if the coordinate is within the given radius
		*/
		isPointInCircle: function(latlng, center, radius) {
			return this.getDistance(latlng, center) < radius;
		},


		/**
		* Shortcut for geolib.isPointInCircle()
		*/
		withinRadius: function() {
			return this.isPointInCircle.apply(this, arguments);
		},


		/**
		* Gets rhumb line bearing of two points. Find out about the difference between rhumb line and 
		* great circle bearing on Wikipedia. It's quite complicated. Rhumb line should be fine in most cases:
		*
		* http://en.wikipedia.org/wiki/Rhumb_line#General_and_mathematical_description
		* 
		* Function heavily based on Doug Vanderweide's great PHP version (licensed under GPL 3.0)
		* http://www.dougv.com/2009/07/13/calculating-the-bearing-and-compass-rose-direction-between-two-latitude-longitude-coordinates-in-php/
		*
		* @param		object		origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
		* @param		object		destination coordinate
		* @return		integer		calculated bearing
		*/
		getRhumbLineBearing: function(originLL, destLL) {

			// difference of longitude coords
			var diffLon = this.longitude(destLL).toRad() - this.longitude(originLL).toRad();

			// difference latitude coords phi
			var diffPhi = Math.log(
				Math.tan(
					this.latitude(destLL).toRad() / 2 + Math.PI / 4
				) / 
				Math.tan(
					this.latitude(originLL).toRad() / 2 + Math.PI / 4
				)
			);

			// recalculate diffLon if it is greater than pi
			if(Math.abs(diffLon) > Math.PI) {
				if(diffLon > 0) {
					diffLon = (2 * Math.PI - diffLon) * -1;
				}
				else {
					diffLon = 2 * Math.PI + diffLon;
				}
			}

			//return the angle, normalized
			return (Math.atan2(diffLon, diffPhi).toDeg() + 360) % 360;

		},


		/**
		* Gets great circle bearing of two points. See description of getRhumbLineBearing for more information
		*
		* @param		object		origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
		* @param		object		destination coordinate
		* @return		integer		calculated bearing
		*/
		getBearing: function(originLL, destLL) {

			destLL['latitude'] = this.latitude(destLL);
			destLL['longitude'] = this.longitude(destLL);
			originLL['latitude'] = this.latitude(originLL);
			originLL['longitude'] = this.longitude(originLL);

			var bearing = (
				(
					Math.atan2(
						Math.sin(
							destLL['longitude'].toRad() - 
							originLL['longitude'].toRad()
						) * 
						Math.cos(
							destLL['latitude'].toRad()
						), 
						Math.cos(
							originLL['latitude'].toRad()
						) * 
						Math.sin(
							destLL['latitude'].toRad()
						) - 
						Math.sin(
							originLL['latitude'].toRad()
						) * 
						Math.cos(
							destLL['latitude'].toRad()
						) * 
						Math.cos(
							destLL['longitude'].toRad() - originLL['longitude'].toRad()
						)
					)
				).toDeg() + 360
			) % 360;

			return bearing;

		},


		/**
		* Gets the compass direction from an origin coordinate to a destination coordinate.
		*
		* @param		object		origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
		* @param		object		destination coordinate
		* @param		string		Bearing mode. Can be either circle or rhumbline
		* @return		object		Returns an object with a rough (NESW) and an exact direction (NNE, NE, ENE, E, ESE, etc).
		*/
		getCompassDirection: function(originLL, destLL, bearingMode) {

			var direction;
			var bearing;

			if(bearingMode == 'circle') { 
				// use great circle bearing
				bearing = this.getBearing(originLL, destLL);
			} else { 
				// default is rhumb line bearing
				bearing = this.getRhumbLineBearing(originLL, destLL);
			}

			switch(Math.round(bearing/22.5)) {
				case 1:
					direction = {exact: "NNE", rough: "N"};
					break;
				case 2:
					direction = {exact: "NE", rough: "N"};
					break;
				case 3:
					direction = {exact: "ENE", rough: "E"};
					break;
				case 4:
					direction = {exact: "E", rough: "E"};
					break;
				case 5:
					direction = {exact: "ESE", rough: "E"};
					break;
				case 6:
					direction = {exact: "SE", rough: "E"};
					break;
				case 7:
					direction = {exact: "SSE", rough: "S"};
					break;
				case 8:
					direction = {exact: "S", rough: "S"};
					break;
				case 9:
					direction = {exact: "SSW", rough: "S"};
					break;
				case 10:
					direction = {exact: "SW", rough: "S"};
					break;
				case 11:
					direction = {exact: "WSW", rough: "W"};
					break;
				case 12:
					direction = {exact: "W", rough: "W"};
					break;
				case 13:
					direction = {exact: "WNW", rough: "W"};
					break;
				case 14:
					direction = {exact: "NW", rough: "W"};
					break;
				case 15:
					direction = {exact: "NNW", rough: "N"}; 
					break;
				default:
					direction = {exact: "N", rough: "N"};
			}

			direction['bearing'] = bearing;
			return direction;

		},


		/**
		* Shortcut for getCompassDirection
		*/
		getDirection: function(originLL, destLL, bearingMode) {
			return this.getCompassDirection.apply(this, arguments);
		},


		/**
		* Sorts an array of coords by distance from a reference coordinate
		*
		* @param		object		reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
		* @param		mixed		array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return		array		ordered array
		*/
		orderByDistance: function(latlng, coords) {

			var coordsArray = [];

			for(var coord in coords) {

				var d = this.getDistance(latlng, coords[coord]);

				coordsArray.push({
					key: coord, 
					latitude: this.latitude(coords[coord]), 
					longitude: this.longitude(coords[coord]), 
					distance: d
				});

			}

			return coordsArray.sort(function(a, b) { return a.distance - b.distance; });

		},


		/**
		* Finds the nearest coordinate to a reference coordinate
		*
		* @param		object		reference coordinate e.g. {latitude: 51.5023, longitude: 7.3815}
		* @param		mixed		array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return		array		ordered array
		*/
		findNearest: function(latlng, coords, offset, limit) {

			offset = offset || 0;
			limit = limit || 1;
			var ordered = this.orderByDistance(latlng, coords);

			if(limit === 1) {
				return ordered[offset];
			} else {
				return ordered.splice(offset, limit);
			}

		},


		/**
		* Calculates the length of a given path
		*
		* @param		mixed		array or object with coords [{latitude: 51.5143, longitude: 7.4138}, {latitude: 123, longitude: 123}, ...] 
		* @return		integer		length of the path (in meters)
		*/
		getPathLength: function(coords) {

			var dist = 0;
			var last;

			for (var i = 0, l = coords.length; i < l; ++i) {
				if(last) {
					//console.log(coords[i], last, this.getDistance(coords[i], last));
					dist += this.getDistance(this.coords(coords[i]), last);
				}
				last = this.coords(coords[i]);
			}

			return dist;

		},


		/**
		* Calculates the speed between to points within a given time span.
		*
		* @param		object		coords with javascript timestamp {latitude: 51.5143, longitude: 7.4138, time: 1360231200880}
		* @param		object		coords with javascript timestamp {latitude: 51.5502, longitude: 7.4323, time: 1360245600460}
		* @param		object		options (currently "unit" is the only option. Default: km(h));
		* @return		float		speed in unit per hour
		*/
		getSpeed: function(start, end, options) {

			var unit = options && options.unit || 'km';

			if(unit == 'mph') {
				unit = 'mi';
			} else if(unit == 'kmh') {
				unit = 'km';
			}

			var distance = geolib.getDistance(start, end);
			var time = ((end.time*1)/1000) - ((start.time*1)/1000);
			var mPerHr = (distance/time)*3600;
			var speed = Math.round(mPerHr * this.measures[unit] * 10000)/10000;
			return speed;

		},


		/**
		* Converts a distance from meters to km, mm, cm, mi, ft, in or yd
		*
		* @param		string		Format to be converted in
		* @param		float		Distance in meters
		* @param		float		Decimal places for rounding (default: 4)
		* @return		float		Converted distance
		*/
		convertUnit: function(unit, distance, round) {

			if(distance === 0 || typeof distance === 'undefined') {

				if(this.distance === 0) {
					// throw 'No distance given.';
					return 0;
				} else {
					distance = this.distance;
				}

			}

			unit = unit || 'm';
			round = (null == round ? 4 : round);

			if(typeof this.measures[unit] !== 'undefined') {
				return this.round(distance * this.measures[unit], round);
			} else {
				throw new Error('Unknown unit for conversion.');
			}

		},


		/**
		* Checks if a value is in decimal format or, if neccessary, converts to decimal
		*
		* @param		mixed		Value(s) to be checked/converted (array of latlng objects, latlng object, sexagesimal string, float)
		* @return		float		Input data in decimal format
		*/
		useDecimal: function(value) {

			if(Object.prototype.toString.call(value) === '[object Array]') {

				var geolib = this;

				value = value.map(function(val) {

					//if(!isNaN(parseFloat(val))) {
					if(geolib.isDecimal(val)) {

						return geolib.useDecimal(val);

					} else if(typeof val == 'object') {

						if(geolib.validate(val)) {

							return geolib.coords(val);

						} else {

							for(var prop in val) {
								val[prop] = geolib.useDecimal(val[prop]);
							}

							return val;

						}

					} else if(geolib.isSexagesimal(val)) {

						return geolib.sexagesimal2decimal(val);

					} else {

						return val;

					}

				});

				return value;

			} else if(typeof value === 'object' && this.validate(value)) {

				return this.coords(value);

			} else if(typeof value === 'object') {

				for(var prop in value) {
					value[prop] = this.useDecimal(value[prop]);
				}

				return value;

			}


			if (this.isDecimal(value)) {

				return parseFloat(value);

			} else if(this.isSexagesimal(value) === true) {

				return parseFloat(this.sexagesimal2decimal(value));

			}

			throw new Error('Unknown format.');

		},

		/**
		* Converts a decimal coordinate value to sexagesimal format
		*
		* @param		float		decimal
		* @return		string		Sexagesimal value (XX° YY' ZZ")
		*/
		decimal2sexagesimal: function(dec) {

			if (dec in this.sexagesimal) {
				return this.sexagesimal[dec];
			}

			var tmp = dec.toString().split('.');

			var deg = Math.abs(tmp[0]);
			var min = ('0.' + tmp[1])*60;
			var sec = min.toString().split('.');

			min = Math.floor(min);
			sec = (('0.' + sec[1]) * 60).toFixed(2);

			this.sexagesimal[dec] = (deg + '° ' + min + "' " + sec + '"');

			return this.sexagesimal[dec];

		},


		/**
		* Converts a sexagesimal coordinate to decimal format
		*
		* @param		float		Sexagesimal coordinate
		* @return		string		Decimal value (XX.XXXXXXXX)
		*/
		sexagesimal2decimal: function(sexagesimal) {

			if (sexagesimal in this.decimal) {
				return this.decimal[sexagesimal];
			}

			var	regEx = new RegExp(this.sexagesimalPattern);
			var	data = regEx.exec(sexagesimal);
			var min = 0, sec = 0;

			if(data) {
				min = parseFloat(data[2]/60);
				sec = parseFloat(data[4]/3600) || 0;
			}

			var	dec = ((parseFloat(data[1]) + min + sec)).toFixed(8);
			//var	dec = ((parseFloat(data[1]) + min + sec));

				// South and West are negative decimals
				dec = (data[7] == 'S' || data[7] == 'W') ? parseFloat(-dec) : parseFloat(dec);
				//dec = (data[7] == 'S' || data[7] == 'W') ? -dec : dec;

			this.decimal[sexagesimal] = dec;

			return dec;

		},


		/**
		* Checks if a value is in decimal format
		*
		* @param		string		Value to be checked
		* @return		bool		True if in sexagesimal format
		*/
		isDecimal: function(value) {

			value = value.toString().replace(/\s*/, '');

			// looks silly but works as expected
			// checks if value is in decimal format
			return (!isNaN(parseFloat(value)) && parseFloat(value) == value);

		},


		/**
		* Checks if a value is in sexagesimal format
		*
		* @param		string		Value to be checked
		* @return		bool		True if in sexagesimal format
		*/
		isSexagesimal: function(value) {

			value = value.toString().replace(/\s*/, '');

			return this.sexagesimalPattern.test(value);

		},

		round: function(value, n) {
			var decPlace = Math.pow(10, n);
			return Math.round(value * decPlace)/decPlace;
		}

	});

	// Node module
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {

		global.geolib = module.exports = geolib;

	// AMD module
	} else if (typeof define === "function" && define.amd) {

		define("geolib", [], function () {
			return geolib; 
		});

	// we're in a browser
	} else {

		global.geolib = geolib;

	}

}(this));
},{}],14:[function(require,module,exports){
var domify = require('domify');
module.exports = hyperglue;

var outer = null;

function hyperglue (src, updates) {
    if (!updates) updates = {};
    
    var dom = typeof src === 'object' ? [ src ] : domify(src);
    if (!outer) outer = document.createElement('div');
    
    forEach(objectKeys(updates), function (selector) {
        var value = updates[selector];
        forEach(dom, function (d) {
            var parentNode = d.parentNode;
            
            if (selector === ':first') {
                bind(d, value);
            }
            else if (/:first$/.test(selector)) {
                var k = selector.replace(/:first$/, '');
                if (parentNode) parentNode.removeChild(d);
                outer.appendChild(d);
                
                var elem = outer.querySelector(k);
                outer.removeChild(d);
                
                if (parentNode) parentNode.appendChild(d);
                if (elem) bind(elem, value);
            }
            else {
                if (parentNode) parentNode.removeChild(d);
                outer.appendChild(d);
                
                var nodes = d.parentNode.querySelectorAll(selector);
                outer.removeChild(d);
                
                if (parentNode) parentNode.appendChild(d);
                
                if (nodes.length === 0) return;
                for (var i = 0; i < nodes.length; i++) {
                    bind(nodes[i], value);
                }
            }
        });
    });
    return dom.length === 1 ? dom[0] : dom;
}

function bind (node, value) {
    if (isElement(value)) {
        node.innerHTML = '';
        node.appendChild(value);
    }
    else if (isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            var e = hyperglue(node.cloneNode(true), value[i]);
            node.parentNode.insertBefore(e, node);
        }
        node.parentNode.removeChild(node);
    }
    else if (value && typeof value === 'object') {
        forEach(objectKeys(value), function (key) {
            if (key === '_text') {
                setText(node, value[key]);
            }
            else if (key === '_html' && isElement(value[key])) {
                node.innerHTML = '';
                node.appendChild(value[key]);
            }
            else if (key === '_html') {
                node.innerHTML = value[key];
            }
            else if (value[key] && typeof value[key] === 'object') {
                var vk = value[key];
                if (vk.append) {
                    node.setAttribute(key, node.getAttribute(key) + vk.append);
                }
                else if (vk.prepend) {
                    node.setAttribute(key, vk.prepend + node.getAttribute(key));
                }
            }
            else node.setAttribute(key, value[key]);
        });
    }
    else setText(node, value);
}

function forEach(xs, f) {
    if (xs.forEach) return xs.forEach(f);
    for (var i = 0; i < xs.length; i++) f(xs[i], i)
}

var objectKeys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

function isElement (e) {
    return e && typeof e === 'object' && e.childNodes
        && (typeof e.appendChild === 'function'
        || typeof e.appendChild === 'object')
    ;
}

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

function setText (e, s) {
    e.innerHTML = '';
    var txt = document.createTextNode(String(s));
    e.appendChild(txt);
}

},{"domify":15}],15:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];
  
  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return [el.removeChild(el.lastChild)];
  }
  
  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  return orphan(el.children);
}

/**
 * Orphan `els` and return an array.
 *
 * @param {NodeList} els
 * @return {Array}
 * @api private
 */

function orphan(els) {
  var ret = [];

  while (els.length) {
    ret.push(els[0].parentNode.removeChild(els[0]));
  }

  return ret;
}

},{}],16:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],17:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(this.smartypants(cap[0]));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/--/g, '\u2014')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
