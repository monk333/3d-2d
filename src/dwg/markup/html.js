export let html = {
    preventDefault: function (e) {
        if ($Defaults.KEEP_DEFAULT_FUNCTION(e)) {
            return;
        }
        if (e.preventDefault) {
            e.preventDefault();
        } else if (e.preventManipulation) {
            e.preventManipulation();
        } else {
            e.returnValue = false;
        }
    },
    insertAfter: function (e, ref) {
        if (ref) {
            ref.parentNode.insertBefore(e, ref.nextSibling);
        } else {
            e.parentNode.insertBefore(e, e.parentNode.firstChild);
        }
        return e;
    },
    forEach: function (parent, func, scope) {
        if (!$html.isVisible(parent)) {
            return;
        }
        var count = parent.childNodes.length;
        for (var i = 0; i < count; i++) {
            $html.forEach(parent.childNodes[i], func, scope);
        }
        if (scope) {
            func.call(scope, parent);
        } else {
            func(parent);
        }
    },
    setVisible: function (e, visible) {
        e.style.display = visible ? 'block' : 'none';
    },
    isVisible: function (e) {
        return 'style' in e && e.style.display !== 'none';
    },
    release: function (parent) {
        var count = parent.childNodes.length;
        for (var i = 0; i < count; i++) {
            $html.release(parent.childNodes[i]);
        }
        if (count > 0) {
            $html.clear(parent);
        }
        if (parent._pool) {
            parent._pool.release(parent);
        }
    },
    clear: function (e) {
        while (e.firstChild) {
            e.removeChild(e.firstChild);
        }
    },
    setZoom: function (e, zoom) {
        var s = e.style;
        if (s.setProperty) {
            if ($ua.isFirefox) {
                s.setProperty("-moz-transform", "scale(" + zoom + ")", null);
                s.setProperty("-moz-transform-origin", "0 0", null);
            } else if ($ua.isOpera) {
                s.setProperty("-o-transform", "scale(" + zoom + ")", null);
                s.setProperty("-o-transform-origin", "0 0", null);
            } else if ($ua.isChrome || $ua.isSafari) {
                s.setProperty("-webkit-transform", "scale(" + zoom + ")", null);
                s.setProperty("-webkit-transform-origin", "0 0", null);

                var webkitInvaildateDiv = null;
                if (e._webkitInvaildateDiv) {
                    webkitInvaildateDiv = e._webkitInvaildateDiv;
                } else {
                    webkitInvaildateDiv = document.createElement("div");
                    e._webkitInvaildateDiv = webkitInvaildateDiv;
                }
                if (!webkitInvaildateDiv.parentNode || webkitInvaildateDiv.parentNode != e) {
                    e.appendChild(webkitInvaildateDiv);
                } else {
                    e.removeChild(webkitInvaildateDiv);
                }
            } else if ($ua.isIE) {
                s.setProperty("-ms-transform", "scale(" + zoom + ")", null);
                s.setProperty("-ms-transform-origin", "0 0", null);
            } else {
                s.setProperty("transform", "scale(" + zoom + ")", null);
                s.setProperty("transform-origin", "0 0", null);
            }
        }
    },
    setRotate: function (e, zoom) {
        var s = e.style;
        if (s.setProperty) {
            if ($ua.isFirefox) {
                s.setProperty("-moz-transform", "scale(" + zoom + ")", null);
                s.setProperty("-moz-transform-origin", "0 0", null);
            } else if ($ua.isOpera) {
                s.setProperty("-o-transform", "scale(" + zoom + ")", null);
                s.setProperty("-o-transform-origin", "0 0", null);
            } else if ($ua.isChrome || $ua.isSafari) {
                s.setProperty("-webkit-transform", "scale(" + zoom + ")", null);
                s.setProperty("-webkit-transform-origin", "0 0", null);

                var webkitInvaildateDiv = null;
                if (e._webkitInvaildateDiv) {
                    webkitInvaildateDiv = e._webkitInvaildateDiv;
                } else {
                    webkitInvaildateDiv = document.createElement("div");
                    e._webkitInvaildateDiv = webkitInvaildateDiv;
                }
                if (!webkitInvaildateDiv.parentNode || webkitInvaildateDiv.parentNode != e) {
                    e.appendChild(webkitInvaildateDiv);
                } else {
                    e.removeChild(webkitInvaildateDiv);
                }
            } else if ($ua.isIE) {
                s.setProperty("-ms-transform", "scale(" + zoom + ")", null);
                s.setProperty("-ms-transform-origin", "0 0", null);
            } else {
                s.setProperty("transform", "scale(" + zoom + ")", null);
                s.setProperty("transform-origin", "0 0", null);
            }
        }
    },
    setCSSStyle: function (domObject, styleName, styleValue) {
        domObject.style.setProperty(styleName, styleValue, null);
    },
    removeCSSStyle: function (domObject, styleName) {
        domObject.style.removeProperty(styleName);
    },
    getCSSStyle: function (domObject, styleName) {
        return domObject.style.getPropertyValue(styleName);
    },
    setBorderRaidus: function (e, radius) {
        if ($ua.isFirefox) {
            e.style.MozBorderRadius = radius;
        } else {
            e.style.borderRadius = radius;
        }
    },
    // {map:{1:'male', 2:'female'}, values:[1, 2]}  or  ['male', 'female']
    createSelect: function (info, currentValue) {
        var select = document.createElement('select'), i, value, option;
        if (Array.isArray(info)) {
            for (i = 0; i < info.length; i++) {
                value = info[i];
                option = document.createElement('option');
                option.innerHTML = value;
                option.setAttribute('value', value);
                if (value === currentValue) {
                    option.setAttribute('selected', 'true');
                }
                select.appendChild(option);
            }
        } else {
            for (i = 0; i < info.values.length; i++) {
                value = info.values[i];
                option = document.createElement('option');
                option.innerHTML = info.map[value];
                option.setAttribute('value', value);
                if (value === currentValue) {
                    option.setAttribute('selected', 'true');
                }
                select.appendChild(option);
            }
        }
        return select;
    },
    createImg: function (src) {
        var e = document.createElement('img');
        e.style.position = 'absolute';
        if (typeof src === 'string') {
            e.setAttribute('src', src);
        }
        return e;
    },
    createView: function (overflow, keepDefault) {
        var e = document.createElement('div');
        e.style.position = $Defaults.VIEW_POSITION;
        e.style.fontSize = $Defaults.VIEW_FONT_SIZE;
        e.style.fontFamily = $Defaults.VIEW_FONT_FAMILY;
        e.style.cursor = 'default';
        e.style.outline = 'none';
        e.style.textAlign = "left";
        e.style.msTouchAction = "none";
        e.style.touchAction = "none";
        e.tabIndex = 0;

        if (keepDefault) {
            // do nothing
        } else {
            e.onmousedown = $html.preventDefault;
        }
        if (e.style.setProperty) {
            e.style.setProperty("-khtml-user-select", "none", null);
            e.style.setProperty("-webkit-user-select", "none", null);
            e.style.setProperty("-moz-user-select", "none", null);
            e.style.setProperty("-webkit-tap-highlight-color", "rgba(0, 0, 0, 0)", null);
        }
        if (overflow) {
            e.style.overflow = overflow;
        }
        return e;
    },
    createDiv: function () {
        var e = document.createElement('div');
        e.style.position = 'absolute';
        e.style.msTouchAction = "none";
        e.style.touchAction = "none";
        return e;
    },
    createCanvas: function (width, height) {
        width = width || 0;
        height = height || 0;
        if (isNodejs) {
            return new Canvas(width, height);
        } else {
            var e = document.createElement('canvas');
            e.style.position = 'absolute';
            e.style.msTouchAction = "none";
            e.style.touchAction = "none";
            e.width = width;
            e.height = height;
            return e;
        }
    },
    setCanvas: function (c, x, y, w, h) {
        if (arguments.length === 2) {
            y = x.y;
            w = x.width;
            h = x.height;
            x = x.x;
        }
        c.style.left = x + 'px';
        c.style.top = y + 'px';
        c.setAttribute('width', w);
        c.setAttribute('height', h);
        c._viewRect = { x: x, y: y, width: w, height: h };
        var g = c.getContext('2d');
        if (g.shadowBlur !== 0) {
            g.shadowOffsetX = 0;
            g.shadowOffsetY = 0;
            g.shadowBlur = 0;
            g.shadowColor = 'rgba(0,0,0,0.0)';
        }
        g.clearRect(0, 0, w, h);
        g.translate(-x, -y);
        return g;
    },
    setImg: function (img, src, bounds) {
        img.setAttribute('src', src);
        img.style.left = bounds.x + 'px';
        img.style.top = bounds.y + 'px';
        img.style.width = bounds.width + 'px';
        img.style.height = bounds.height + 'px';
        img._viewRect = _twaver.clone(bounds);
    },
    setDiv: function (div, bounds, fillColor, width, outlineColor) {
        width = _twaver.num(width) ? width : 0;
        div.style.left = (bounds.x - width) + 'px';
        div.style.top = (bounds.y - width) + 'px';
        div.style.width = bounds.width + 'px';
        div.style.height = bounds.height + 'px';
        div._viewRect = _twaver.clone(bounds);
        if (fillColor) {
            div.style.backgroundColor = fillColor;
        } else {
            div.style.backgroundColor = '';
        }
        if (width > 0) {
            div.style.border = width + "px " + outlineColor + ' solid';
        } else {
            div.style.border = '';
        }
    },
    changeTypeForMS: function (type) {
        var newType = type;
        if (type.indexOf("MSPointer") === 0 || type.indexOf("pointer") === 0) {
            var mainName;
            if (type.indexOf("MSPointer") === 0) {
                mainName = type.substring(9, 10).toLowerCase();
                mainName = mainName + type.substring(10);
            } else {
                mainName = type.substring(7, 8);
            }
            if (window.MSPointerEvent) {
                newType = "MSPointer" + mainName.substring(0, 1).toUpperCase() + mainName.substring(1);
            } else if (window.PointerEvent) {
                newType = "pointer" + mainName;
            }
        }
        return newType;
    },
    addEventListener: function (type, handler, view, scope) {
        type = this.changeTypeForMS(type);
        var name = '_' + type + '_';
        if (scope[name]) {
            return;
        }
        var func = function (e) {
            func.instance[func.method](e);
        };
        func.method = handler;
        func.instance = scope;
        scope[name] = func;
        view.addEventListener(type, func, false);
    },
    removeEventListener: function (type, view, scope) {
        type = this.changeTypeForMS(type);
        var name = '_' + type + '_';
        var func = scope[name];
        if (func) {
            view.removeEventListener(type, func, false);
            delete scope[name];
        }
    },
    isValidEvent: function (view, e) {
        if (!e) {
            return false;
        }
        if (e.target === view) {
            if ($ua.isFirefox) {
                if (view.clientHeight < view.scrollHeight && e.layerX < 25) {
                    return false;
                }
                if (view.clientWidth < view.scrollWidth && e.layerY < 25) {
                    return false;
                }
            } else {
                if (e.offsetX > view.clientWidth || e.offsetY > view.clientHeight) {
                    return false;
                }
            }
        }
        return true;
    },
    getLogicalPoint: function (view, e, zoom, rootDiv) {
        zoom = zoom ? zoom : 1;
        var point;
        var bound = view.getBoundingClientRect();
        if ($ua.isTouchable && e.changedTouches && e.changedTouches.length > 0) {
            //touch
            var touch = e.changedTouches[0];
            var scrollLeft = $ua.isAndroid ? 0 : $touch.scrollLeft();
            var scrollTop = $ua.isAndroid ? 0 : $touch.scrollTop();
            point = {
                x: (touch.clientX + view.scrollLeft - bound.left - scrollLeft) / zoom,
                y: (touch.clientY + view.scrollTop - bound.top - scrollTop) / zoom
            };
        } else {
            //pc
            if (!$html.isValidEvent(view, e)) {
                return null;
            }
            point = { x: (e.clientX - bound.left + view.scrollLeft) / zoom, y: (e.clientY - bound.top + view.scrollTop) / zoom };
        }
        return point;
    },
    handle_mousedown: function (target, e) {
        if ($html.target) {
            $html.handle_mouseup(e);
        }
        window.addEventListener('mousemove', $html.handle_mousemove, false);
        window.addEventListener('mouseup', $html.handle_mouseup, false);
        $html.target = target;
    },
    handle_mousemove: function (e) {
        if ($html.target.handle_mousemove) {
            $html.target.handle_mousemove(e);
        }
        if ($html.target.handleMouseMove) {
            $html.target.handleMouseMove(e);
        }
    },
    handle_mouseup: function (e) {
        if ($html.target.handle_mouseup) {
            $html.target.handle_mouseup(e);
        }
        if ($html.target.handleMouseUp) {
            $html.target.handleMouseUp(e);
        }
        window.removeEventListener('mousemove', $html.handle_mousemove, false);
        window.removeEventListener('mouseup', $html.handle_mouseup, false);
        delete $html.target;
    },
    getClientPoint: function (e) {
        return {
            x: e.clientX,
            y: e.clientY
        };
    },
    windowWidth: function () {
        if (typeof (window.innerWidth) === 'number') {
            return window.innerWidth;
        }
        if (document.documentElement && document.documentElement.clientWidth) {
            return document.documentElement.clientWidth;
        }
        if (document.body && document.body.clientWidth) {
            return document.body.clientWidth;
        }
        return 0;
    },
    windowHeight: function () {
        if (typeof (window.innerHeight) === 'number') {
            return window.innerHeight;
        }
        if (document.documentElement && document.documentElement.clientHeight) {
            return document.documentElement.clientHeight;
        }
        if (document.body && document.body.clientHeight) {
            return document.body.clientHeight;
        }
        return 0;
    }
};
