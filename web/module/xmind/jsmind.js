/**
* @license BSD-3-Clause
* @copyright 2014-2023 hizzgdev@163.com
*
* Project Home:
*   https://github.com/hizzgdev/jsmind/
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.jsMind = factory());
})(this, (function () { 'use strict';

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */

    const __version__ = '0.7.1';
    const __author__ = 'hizzgdev@163.com';

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (p) {
            return this.slice(0, p.length) === p;
        };
    }

    const Direction = {
        left: -1,
        center: 0,
        right: 1,
        of: function (dir) {
            if (!dir || dir === -1 || dir === 0 || dir === 1) {
                return dir;
            }
            if (dir === '-1' || dir === '0' || dir === '1') {
                return parseInt(dir);
            }
            if (dir.toLowerCase() === 'left') {
                return this.left;
            }
            if (dir.toLowerCase() === 'right') {
                return this.right;
            }
            if (dir.toLowerCase() === 'center') {
                return this.center;
            }
        },
    };
    const EventType = { show: 1, resize: 2, edit: 3, select: 4 };
    const LogLevel = { debug: 1, info: 2, warn: 3, error: 4, disable: 9 };

    // an noop function define
    var _noop = function () {};
    let logger =
        typeof console === 'undefined'
            ? {
                  level: _noop,
                  log: _noop,
                  debug: _noop,
                  info: _noop,
                  warn: _noop,
                  error: _noop,
              }
            : {
                  level: setup_logger_level,
                  log: console.log,
                  debug: console.debug,
                  info: console.info,
                  warn: console.warn,
                  error: console.error,
              };

    function setup_logger_level(log_level) {
        if (log_level > LogLevel.debug) {
            logger.debug = _noop;
        } else {
            logger.debug = console.debug;
        }
        if (log_level > LogLevel.info) {
            logger.info = _noop;
        } else {
            logger.info = console.info;
        }
        if (log_level > LogLevel.warn) {
            logger.warn = _noop;
        } else {
            logger.warn = console.warn;
        }
        if (log_level > LogLevel.error) {
            logger.error = _noop;
        } else {
            logger.error = console.error;
        }
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */

    class Dom {
        constructor(w) {
            this.w = w;
            this.d = w.document;
            this.g = function (id) {
                return this.d.getElementById(id);
            };
            this.c = function (tag) {
                return this.d.createElement(tag);
            };
            this.t = function (n, t) {
                if (n.hasChildNodes()) {
                    n.firstChild.nodeValue = t;
                } else {
                    n.appendChild(this.d.createTextNode(t));
                }
            };

            this.h = function (n, t) {
                if (t instanceof HTMLElement) {
                    n.innerHTML = '';
                    n.appendChild(t);
                } else {
                    n.innerHTML = t;
                }
            };
            // detect isElement
            this.i = function (el) {
                return (
                    !!el &&
                    typeof el === 'object' &&
                    el.nodeType === 1 &&
                    typeof el.style === 'object' &&
                    typeof el.ownerDocument === 'object'
                );
            };

            //target,eventType,handler
            this.on = function (t, e, h) {
                if (!!t.addEventListener) {
                    t.addEventListener(e, h, false);
                } else {
                    t.attachEvent('on' + e, h);
                }
            };
        }
    }

    const $ = new Dom(window);

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    const util = {
        ajax: {
            request: function (url, param, method, callback, fail_callback) {
                var p = Object.keys(param)
                    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(param[k]))
                    .join('&');
                var xhr = new XMLHttpRequest();
                if (!xhr) {
                    return;
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200 || xhr.status == 0) {
                            if (typeof callback === 'function') {
                                var data = util.json.string2json(xhr.responseText);
                                if (data != null) {
                                    callback(data);
                                } else {
                                    callback(xhr.responseText);
                                }
                            }
                        } else {
                            if (typeof fail_callback === 'function') {
                                fail_callback(xhr);
                            } else {
                                logger.error('xhr request failed.', xhr);
                            }
                        }
                    }
                };
                method = method || 'GET';
                xhr.open(method, url, true);
                xhr.setRequestHeader('If-Modified-Since', '0');
                if (method == 'POST') {
                    xhr.setRequestHeader(
                        'Content-Type',
                        'application/x-www-form-urlencoded;charset=utf-8'
                    );
                    xhr.send(p);
                } else {
                    xhr.send();
                }
            },
            get: function (url, callback) {
                return util.ajax.request(url, {}, 'GET', callback);
            },
            post: function (url, param, callback) {
                return util.ajax.request(url, param, 'POST', callback);
            },
        },

        file: {
            read: function (file_data, fn_callback) {
                var reader = new FileReader();
                reader.onload = function () {
                    if (typeof fn_callback === 'function') {
                        fn_callback(this.result, file_data.name);
                    }
                };
                reader.readAsText(file_data);
            },

            save: function (file_data, type, name) {
                var blob;
                if (typeof $.w.Blob === 'function') {
                    blob = new Blob([file_data], { type: type });
                } else {
                    var BlobBuilder =
                        $.w.BlobBuilder ||
                        $.w.MozBlobBuilder ||
                        $.w.WebKitBlobBuilder ||
                        $.w.MSBlobBuilder;
                    var bb = new BlobBuilder();
                    bb.append(file_data);
                    blob = bb.getBlob(type);
                }
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, name);
                } else {
                    var URL = $.w.URL || $.w.webkitURL;
                    var blob_url = URL.createObjectURL(blob);
                    var anchor = $.c('a');
                    if ('download' in anchor) {
                        anchor.style.visibility = 'hidden';
                        anchor.href = blob_url;
                        anchor.download = name;
                        $.d.body.appendChild(anchor);
                        var evt = $.d.createEvent('MouseEvents');
                        evt.initEvent('click', true, true);
                        anchor.dispatchEvent(evt);
                        $.d.body.removeChild(anchor);
                    } else {
                        location.href = blob_url;
                    }
                }
            },
        },

        json: {
            json2string: function (json) {
                return JSON.stringify(json);
            },
            string2json: function (json_str) {
                return JSON.parse(json_str);
            },
            merge: function (b, a) {
                for (var o in a) {
                    if (o in b) {
                        if (
                            typeof b[o] === 'object' &&
                            Object.prototype.toString.call(b[o]).toLowerCase() == '[object object]' &&
                            !b[o].length
                        ) {
                            util.json.merge(b[o], a[o]);
                        } else {
                            b[o] = a[o];
                        }
                    } else {
                        b[o] = a[o];
                    }
                }
                return b;
            },
        },

        uuid: {
            newid: function () {
                return (
                    new Date().getTime().toString(16) + Math.random().toString(16).substring(2)
                ).substring(2, 18);
            },
        },

        text: {
            is_empty: function (s) {
                if (!s) {
                    return true;
                }
                return s.replace(/\s*/, '').length == 0;
            },
        },
    };

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    const default_options = {
        container: '', // id of the container
        editable: true, // you can change it in your options
        theme: null,
        mode: 'full', // full or side
        support_html: true,
        log_level: 'info',

        view: {
            engine: 'canvas',
            hmargin: 100,
            vmargin: 50,
            line_width: 2,
            line_color: '#555',
            line_style: 'curved', // straight or curved
            draggable: true, // drag the mind map with your mouse, when it's larger that the container
            hide_scrollbars_when_draggable: false, // hide container scrollbars, when mind map is larger than container and draggable option is true.
            node_overflow: 'wrap', // hidden or wrap
            zoom: {
                min: 0.1,
                max: 10,
                step: 0.1,
            },
        },
        layout: {
            hspace: 30,
            vspace: 20,
            pspace: 13,
            cousin_space: 0,
        },
        default_event_handle: {
            enable_mousedown_handle: true,
            enable_click_handle: true,
            enable_dblclick_handle: true,
            enable_mousewheel_handle: true,
        },
        shortcut: {
            enable: true,
            handles: {},
            mapping: {
                addchild: [45, 9], // Insert, Tab
                addbrother: 13, // Enter
                editnode: 113, // F2
                delnode: 46, // Delete
                toggle: 32, // Space
                left: 37, // Left
                up: 38, // Up
                right: 39, // Right
                down: 40, // Down
            },
        },
        plugin: {},
    };

    function merge_option(options) {
        var opts = {};
        util.json.merge(opts, default_options);
        util.json.merge(opts, options);

        if (!opts.container) {
            throw new Error('the options.container should not be null or empty.');
        }
        return opts;
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */

    class Node {
        constructor(sId, iIndex, sTopic, oData, bIsRoot, oParent, eDirection, bExpanded) {
            if (!sId) {
                logger.error('invalid node id');
                return;
            }
            if (typeof iIndex != 'number') {
                logger.error('invalid node index');
                return;
            }
            if (typeof bExpanded === 'undefined') {
                bExpanded = true;
            }
            this.id = sId;
            this.index = iIndex;
            this.topic = sTopic;
            this.data = oData || {};
            this.isroot = bIsRoot;
            this.parent = oParent;
            this.direction = eDirection;
            this.expanded = !!bExpanded;
            this.children = [];
            this._data = {};
        }

        get_location() {
            var vd = this._data.view;
            return {
                x: vd.abs_x,
                y: vd.abs_y,
            };
        }
        get_size() {
            var vd = this._data.view;
            return {
                w: vd.width,
                h: vd.height,
            };
        }

        static compare(node1, node2) {
            // '-1' is always the latest
            var r = 0;
            var i1 = node1.index;
            var i2 = node2.index;
            if (i1 >= 0 && i2 >= 0) {
                r = i1 - i2;
            } else if (i1 == -1 && i2 == -1) {
                r = 0;
            } else if (i1 == -1) {
                r = 1;
            } else if (i2 == -1) {
                r = -1;
            } else {
                r = 0;
            }
            return r;
        }
        static inherited(parent_node, node) {
            if (!!parent_node && !!node) {
                if (parent_node.id === node.id) {
                    return true;
                }
                if (parent_node.isroot) {
                    return true;
                }
                var pid = parent_node.id;
                var p = node;
                while (!p.isroot) {
                    p = p.parent;
                    if (p.id === pid) {
                        return true;
                    }
                }
            }
            return false;
        }
        static is_node(n) {
            return !!n && n instanceof Node;
        }
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    class Mind {
        constructor() {
            this.name = null;
            this.author = null;
            this.version = null;
            this.root = null;
            this.selected = null;
            this.nodes = {};
        }
        get_node(node_id) {
            if (node_id in this.nodes) {
                return this.nodes[node_id];
            } else {
                logger.warn('the node[id=' + node_id + '] can not be found');
                return null;
            }
        }
        set_root(node_id, topic, data) {
            if (this.root == null) {
                this.root = new Node(node_id, 0, topic, data, true);
                this._put_node(this.root);
                return this.root;
            } else {
                logger.error('root node is already exist');
                return null;
            }
        }
        add_node(parent_node, node_id, topic, data, direction, expanded, idx) {
            if (!Node.is_node(parent_node)) {
                logger.error('the parent_node ' + parent_node + ' is not a node.');
                return null;
            }
            var node_index = idx || -1;
            var node = new Node(
                node_id,
                node_index,
                topic,
                data,
                false,
                parent_node,
                parent_node.direction,
                expanded
            );
            if (parent_node.isroot) {
                node.direction = direction || Direction.right;
            }
            if (this._put_node(node)) {
                parent_node.children.push(node);
                this._update_index(parent_node);
            } else {
                logger.error("fail, the node id '" + node.id + "' has been already exist.");
                node = null;
            }
            return node;
        }
        insert_node_before(node_before, node_id, topic, data, direction) {
            if (!Node.is_node(node_before)) {
                logger.error('the node_before ' + node_before + ' is not a node.');
                return null;
            }
            var node_index = node_before.index - 0.5;
            return this.add_node(node_before.parent, node_id, topic, data, direction, true, node_index);
        }
        get_node_before(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return null;
                } else {
                    return this.get_node_before(the_node);
                }
            }
            if (node.isroot) {
                return null;
            }
            var idx = node.index - 2;
            if (idx >= 0) {
                return node.parent.children[idx];
            } else {
                return null;
            }
        }
        insert_node_after(node_after, node_id, topic, data, direction) {
            if (!Node.is_node(node_after)) {
                logger.error('the node_after ' + node_after + ' is not a node.');
                return null;
            }
            var node_index = node_after.index + 0.5;
            return this.add_node(node_after.parent, node_id, topic, data, direction, true, node_index);
        }
        get_node_after(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return null;
                } else {
                    return this.get_node_after(the_node);
                }
            }
            if (node.isroot) {
                return null;
            }
            var idx = node.index;
            var brothers = node.parent.children;
            if (brothers.length > idx) {
                return node.parent.children[idx];
            } else {
                return null;
            }
        }
        move_node(node, before_id, parent_id, direction) {
            if (!Node.is_node(node)) {
                logger.error('the parameter node ' + node + ' is not a node.');
                return null;
            }
            if (!parent_id) {
                parent_id = node.parent.id;
            }
            return this._move_node(node, before_id, parent_id, direction);
        }
        _flow_node_direction(node, direction) {
            if (typeof direction === 'undefined') {
                direction = node.direction;
            } else {
                node.direction = direction;
            }
            var len = node.children.length;
            while (len--) {
                this._flow_node_direction(node.children[len], direction);
            }
        }
        _move_node_internal(node, before_id) {
            if (!!node && !!before_id) {
                if (before_id == '_last_') {
                    node.index = -1;
                    this._update_index(node.parent);
                } else if (before_id == '_first_') {
                    node.index = 0;
                    this._update_index(node.parent);
                } else {
                    var node_before = !!before_id ? this.get_node(before_id) : null;
                    if (
                        node_before != null &&
                        node_before.parent != null &&
                        node_before.parent.id == node.parent.id
                    ) {
                        node.index = node_before.index - 0.5;
                        this._update_index(node.parent);
                    }
                }
            }
            return node;
        }
        _move_node(node, before_id, parent_id, direction) {
            if (!!node && !!parent_id) {
                var parent_node = this.get_node(parent_id);
                if (Node.inherited(node, parent_node)) {
                    logger.error('can not move a node to its children');
                    return null;
                }
                if (node.parent.id != parent_id) {
                    // remove from parent's children
                    var sibling = node.parent.children;
                    var si = sibling.length;
                    while (si--) {
                        if (sibling[si].id == node.id) {
                            sibling.splice(si, 1);
                            break;
                        }
                    }
                    node.parent = parent_node;
                    parent_node.children.push(node);
                }

                if (node.parent.isroot) {
                    if (direction == Direction.left) {
                        node.direction = direction;
                    } else {
                        node.direction = Direction.right;
                    }
                } else {
                    node.direction = node.parent.direction;
                }
                this._move_node_internal(node, before_id);
                this._flow_node_direction(node);
            }
            return node;
        }
        remove_node(node) {
            if (!Node.is_node(node)) {
                logger.error('the parameter node ' + node + ' is not a node.');
                return false;
            }
            if (node.isroot) {
                logger.error('fail, can not remove root node');
                return false;
            }
            if (this.selected != null && this.selected.id == node.id) {
                this.selected = null;
            }
            // clean all subordinate nodes
            var children = node.children;
            var ci = children.length;
            while (ci--) {
                this.remove_node(children[ci]);
            }
            // clean all children
            children.length = 0;
            // remove from parent's children
            var sibling = node.parent.children;
            var si = sibling.length;
            while (si--) {
                if (sibling[si].id == node.id) {
                    sibling.splice(si, 1);
                    break;
                }
            }
            // remove from global nodes
            delete this.nodes[node.id];
            // clean all properties
            for (var k in node) {
                delete node[k];
            }
            // remove it's self
            node = null;
            //delete node;
            return true;
        }
        _put_node(node) {
            if (node.id in this.nodes) {
                logger.warn("the node_id '" + node.id + "' has been already exist.");
                return false;
            } else {
                this.nodes[node.id] = node;
                return true;
            }
        }
        _update_index(node) {
            if (node instanceof Node) {
                node.children.sort(Node.compare);
                for (var i = 0; i < node.children.length; i++) {
                    node.children[i].index = i + 1;
                }
            }
        }
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    const format = {
        node_tree: {
            example: {
                meta: {
                    name: 'jsMind node_tree simple',
                    author: __author__,
                    version: __version__,
                },
                format: 'node_tree',
                data: { id: 'root', topic: 'jsMind Example' },
            },
            get_mind: function (source) {
                var df = format.node_tree;
                var mind = new Mind();
                mind.name = source.meta.name;
                mind.author = source.meta.author;
                mind.version = source.meta.version;
                df._parse(mind, source.data);
                return mind;
            },
            get_data: function (mind) {
                var df = format.node_tree;
                var json = {};
                json.meta = {
                    name: mind.name,
                    author: mind.author,
                    version: mind.version,
                };
                json.format = 'node_tree';
                json.data = df._build_node(mind.root);
                return json;
            },

            _parse: function (mind, node_root) {
                var df = format.node_tree;
                var data = df._extract_data(node_root);
                mind.set_root(node_root.id, node_root.topic, data);
                if ('children' in node_root) {
                    var children = node_root.children;
                    for (var i = 0; i < children.length; i++) {
                        df._extract_subnode(mind, mind.root, children[i]);
                    }
                }
            },

            _extract_data: function (node_json) {
                var data = {};
                for (var k in node_json) {
                    if (
                        k == 'id' ||
                        k == 'topic' ||
                        k == 'children' ||
                        k == 'direction' ||
                        k == 'expanded'
                    ) {
                        continue;
                    }
                    data[k] = node_json[k];
                }
                return data;
            },

            _extract_subnode: function (mind, node_parent, node_json) {
                var df = format.node_tree;
                var data = df._extract_data(node_json);
                var d = null;
                if (node_parent.isroot) {
                    d = node_json.direction == 'left' ? Direction.left : Direction.right;
                }
                var node = mind.add_node(
                    node_parent,
                    node_json.id,
                    node_json.topic,
                    data,
                    d,
                    node_json.expanded
                );
                if (!!node_json['children']) {
                    var children = node_json.children;
                    for (var i = 0; i < children.length; i++) {
                        df._extract_subnode(mind, node, children[i]);
                    }
                }
            },

            _build_node: function (node) {
                var df = format.node_tree;
                if (!(node instanceof Node)) {
                    return;
                }
                var o = {
                    id: node.id,
                    topic: node.topic,
                    expanded: node.expanded,
                };
                if (!!node.parent && node.parent.isroot) {
                    o.direction = node.direction == Direction.left ? 'left' : 'right';
                }
                if (node.data != null) {
                    var node_data = node.data;
                    for (var k in node_data) {
                        o[k] = node_data[k];
                    }
                }
                var children = node.children;
                if (children.length > 0) {
                    o.children = [];
                    for (var i = 0; i < children.length; i++) {
                        o.children.push(df._build_node(children[i]));
                    }
                }
                return o;
            },
        },

        node_array: {
            example: {
                meta: {
                    name: 'jsMind node_array simple',
                    author: __author__,
                    version: __version__,
                },
                format: 'node_array',
                data: [{ id: 'root', topic: 'jsMind Example', isroot: true }],
            },

            get_mind: function (source) {
                var df = format.node_array;
                var mind = new Mind();
                mind.name = source.meta.name;
                mind.author = source.meta.author;
                mind.version = source.meta.version;
                df._parse(mind, source.data);
                return mind;
            },

            get_data: function (mind) {
                var df = format.node_array;
                var json = {};
                json.meta = {
                    name: mind.name,
                    author: mind.author,
                    version: mind.version,
                };
                json.format = 'node_array';
                json.data = [];
                df._array(mind, json.data);
                return json;
            },

            _parse: function (mind, node_array) {
                var df = format.node_array;
                var nodes = node_array.slice(0);
                // reverse array for improving looping performance
                nodes.reverse();
                var root_node = df._extract_root(mind, nodes);
                if (!!root_node) {
                    df._extract_subnode(mind, root_node, nodes);
                } else {
                    logger.error('root node can not be found');
                }
            },

            _extract_root: function (mind, node_array) {
                var df = format.node_array;
                var i = node_array.length;
                while (i--) {
                    if ('isroot' in node_array[i] && node_array[i].isroot) {
                        var root_json = node_array[i];
                        var data = df._extract_data(root_json);
                        var node = mind.set_root(root_json.id, root_json.topic, data);
                        node_array.splice(i, 1);
                        return node;
                    }
                }
                return null;
            },

            _extract_subnode: function (mind, parent_node, node_array) {
                var df = format.node_array;
                var i = node_array.length;
                var node_json = null;
                var data = null;
                var extract_count = 0;
                while (i--) {
                    node_json = node_array[i];
                    if (node_json.parentid == parent_node.id) {
                        data = df._extract_data(node_json);
                        var d = null;
                        var node_direction = node_json.direction;
                        if (!!node_direction) {
                            d = node_direction == 'left' ? Direction.left : Direction.right;
                        }
                        var node = mind.add_node(
                            parent_node,
                            node_json.id,
                            node_json.topic,
                            data,
                            d,
                            node_json.expanded
                        );
                        node_array.splice(i, 1);
                        extract_count++;
                        var sub_extract_count = df._extract_subnode(mind, node, node_array);
                        if (sub_extract_count > 0) {
                            // reset loop index after extract subordinate node
                            i = node_array.length;
                            extract_count += sub_extract_count;
                        }
                    }
                }
                return extract_count;
            },

            _extract_data: function (node_json) {
                var data = {};
                for (var k in node_json) {
                    if (
                        k == 'id' ||
                        k == 'topic' ||
                        k == 'parentid' ||
                        k == 'isroot' ||
                        k == 'direction' ||
                        k == 'expanded'
                    ) {
                        continue;
                    }
                    data[k] = node_json[k];
                }
                return data;
            },

            _array: function (mind, node_array) {
                var df = format.node_array;
                df._array_node(mind.root, node_array);
            },

            _array_node: function (node, node_array) {
                var df = format.node_array;
                if (!(node instanceof Node)) {
                    return;
                }
                var o = {
                    id: node.id,
                    topic: node.topic,
                    expanded: node.expanded,
                };
                if (!!node.parent) {
                    o.parentid = node.parent.id;
                }
                if (node.isroot) {
                    o.isroot = true;
                }
                if (!!node.parent && node.parent.isroot) {
                    o.direction = node.direction == Direction.left ? 'left' : 'right';
                }
                if (node.data != null) {
                    var node_data = node.data;
                    for (var k in node_data) {
                        o[k] = node_data[k];
                    }
                }
                node_array.push(o);
                var ci = node.children.length;
                for (var i = 0; i < ci; i++) {
                    df._array_node(node.children[i], node_array);
                }
            },
        },

        freemind: {
            example: {
                meta: {
                    name: 'jsMind freemind example',
                    author: __author__,
                    version: __version__,
                },
                format: 'freemind',
                data: '<map version="1.0.1"><node ID="root" TEXT="freemind Example"/></map>',
            },
            get_mind: function (source) {
                var df = format.freemind;
                var mind = new Mind();
                mind.name = source.meta.name;
                mind.author = source.meta.author;
                mind.version = source.meta.version;
                var xml = source.data;
                var xml_doc = df._parse_xml(xml);
                var xml_root = df._find_root(xml_doc);
                df._load_node(mind, null, xml_root);
                return mind;
            },

            get_data: function (mind) {
                var df = format.freemind;
                var json = {};
                json.meta = {
                    name: mind.name,
                    author: mind.author,
                    version: mind.version,
                };
                json.format = 'freemind';
                var xml_lines = [];
                xml_lines.push('<map version="1.0.1">');
                df._build_map(mind.root, xml_lines);
                xml_lines.push('</map>');
                json.data = xml_lines.join(' ');
                return json;
            },

            _parse_xml: function (xml) {
                var xml_doc = null;
                if (window.DOMParser) {
                    var parser = new DOMParser();
                    xml_doc = parser.parseFromString(xml, 'text/xml');
                } else {
                    // Internet Explorer
                    xml_doc = new ActiveXObject('Microsoft.XMLDOM');
                    xml_doc.async = false;
                    xml_doc.loadXML(xml);
                }
                return xml_doc;
            },

            _find_root: function (xml_doc) {
                var nodes = xml_doc.childNodes;
                var node = null;
                var n = null;
                for (var i = 0; i < nodes.length; i++) {
                    n = nodes[i];
                    if (n.nodeType == 1 && n.tagName == 'map') {
                        node = n;
                        break;
                    }
                }
                if (!!node) {
                    var ns = node.childNodes;
                    node = null;
                    for (var i = 0; i < ns.length; i++) {
                        n = ns[i];
                        if (n.nodeType == 1 && n.tagName == 'node') {
                            node = n;
                            break;
                        }
                    }
                }
                return node;
            },

            _load_node: function (mind, parent_node, xml_node) {
                var df = format.freemind;
                var node_id = xml_node.getAttribute('ID');
                var node_topic = xml_node.getAttribute('TEXT');
                // look for richcontent
                if (node_topic == null) {
                    var topic_children = xml_node.childNodes;
                    var topic_child = null;
                    for (var i = 0; i < topic_children.length; i++) {
                        topic_child = topic_children[i];
                        if (topic_child.nodeType == 1 && topic_child.tagName === 'richcontent') {
                            node_topic = topic_child.textContent;
                            break;
                        }
                    }
                }
                var node_data = df._load_attributes(xml_node);
                var node_expanded = 'expanded' in node_data ? node_data.expanded == 'true' : true;
                delete node_data.expanded;

                var node_position = xml_node.getAttribute('POSITION');
                var node_direction = null;
                if (!!node_position) {
                    node_direction = node_position == 'left' ? Direction.left : Direction.right;
                }
                var node = null;
                if (!!parent_node) {
                    node = mind.add_node(
                        parent_node,
                        node_id,
                        node_topic,
                        node_data,
                        node_direction,
                        node_expanded
                    );
                } else {
                    node = mind.set_root(node_id, node_topic, node_data);
                }
                var children = xml_node.childNodes;
                var child = null;
                for (var i = 0; i < children.length; i++) {
                    child = children[i];
                    if (child.nodeType == 1 && child.tagName == 'node') {
                        df._load_node(mind, node, child);
                    }
                }
            },

            _load_attributes: function (xml_node) {
                var children = xml_node.childNodes;
                var attr = null;
                var attr_data = {};
                for (var i = 0; i < children.length; i++) {
                    attr = children[i];
                    if (attr.nodeType == 1 && attr.tagName === 'attribute') {
                        attr_data[attr.getAttribute('NAME')] = attr.getAttribute('VALUE');
                    }
                }
                return attr_data;
            },

            _build_map: function (node, xml_lines) {
                var df = format.freemind;
                var pos = null;
                if (!!node.parent && node.parent.isroot) {
                    pos = node.direction === Direction.left ? 'left' : 'right';
                }
                xml_lines.push('<node');
                xml_lines.push('ID="' + node.id + '"');
                if (!!pos) {
                    xml_lines.push('POSITION="' + pos + '"');
                }
                xml_lines.push('TEXT="' + node.topic + '">');

                // store expanded status as an attribute
                xml_lines.push('<attribute NAME="expanded" VALUE="' + node.expanded + '"/>');

                // for attributes
                var node_data = node.data;
                if (node_data != null) {
                    for (var k in node_data) {
                        xml_lines.push('<attribute NAME="' + k + '" VALUE="' + node_data[k] + '"/>');
                    }
                }

                // for children
                var children = node.children;
                for (var i = 0; i < children.length; i++) {
                    df._build_map(children[i], xml_lines);
                }

                xml_lines.push('</node>');
            },
        },
        text: {
            example: {
                meta: {
                    name: 'jsMind text example',
                    author: __author__,
                    version: __version__,
                },
                format: 'text',
                data: 'Text Example\n node1\n  node1-sub\n  node1-sub\n node2',
            },
            _line_regex: /\s*/,
            get_mind: function (source) {
                var df = format.text;
                var mind = new Mind();
                mind.name = source.meta.name;
                mind.author = source.meta.author;
                mind.version = source.meta.version;
                var lines = source.data.split(/\n|\r/);
                df._fill_nodes(mind, lines, 0, 0);
                return mind;
            },

            _fill_nodes: function (mind, lines) {
                let node_path = [];
                let i = 0;
                while (i < lines.length) {
                    let line = lines[i];
                    let level = line.match(/\s*/)[0].length;
                    let topic = line.substr(level);

                    if (level == 0 && node_path.length > 0) {
                        log.error('more than 1 root node was found: ' + topic);
                        return;
                    }
                    if (level > node_path.length) {
                        log.error('a suspended node was found: ' + topic);
                        return;
                    }
                    let diff = node_path.length - level;
                    while (diff--) {
                        node_path.pop();
                    }

                    if (level == 0 && node_path.length == 0) {
                        let node = mind.set_root(util.uuid.newid(), topic);
                        node_path.push(node);
                    } else {
                        let node = mind.add_node(
                            node_path[level - 1],
                            util.uuid.newid(),
                            topic,
                            {},
                            null
                        );
                        node_path.push(node);
                    }
                    i++;
                }
                node_path.length = 0;
            },

            get_data: function (mind) {
                var df = format.text;
                var json = {};
                json.meta = {
                    name: mind.name,
                    author: mind.author,
                    version: mind.version,
                };
                json.format = 'text';
                let lines = [];
                df._build_lines(lines, [mind.root], 0);
                json.data = lines.join('\n');
                return json;
            },

            _build_lines: function (lines, nodes, level) {
                let prefix = new Array(level + 1).join(' ');
                for (let node of nodes) {
                    lines.push(prefix + node.topic);
                    if (!!node.children) {
                        format.text._build_lines(lines, node.children, level + 1);
                    }
                }
            },
        },
    };

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    class DataProvider {
        constructor(jm) {
            this.jm = jm;
        }

        init() {
            logger.debug('data.init');
        }
        reset() {
            logger.debug('data.reset');
        }
        load(mind_data) {
            var df = null;
            var mind = null;
            if (typeof mind_data === 'object') {
                if (!!mind_data.format) {
                    df = mind_data.format;
                } else {
                    df = 'node_tree';
                }
            } else {
                df = 'freemind';
            }

            if (df == 'node_array') {
                mind = format.node_array.get_mind(mind_data);
            } else if (df == 'node_tree') {
                mind = format.node_tree.get_mind(mind_data);
            } else if (df == 'freemind') {
                mind = format.freemind.get_mind(mind_data);
            } else if (df == 'text') {
                mind = format.text.get_mind(mind_data);
            } else {
                logger.warn('unsupported format');
            }
            return mind;
        }
        get_data(data_format) {
            var data = null;
            if (data_format == 'node_array') {
                data = format.node_array.get_data(this.jm.mind);
            } else if (data_format == 'node_tree') {
                data = format.node_tree.get_data(this.jm.mind);
            } else if (data_format == 'freemind') {
                data = format.freemind.get_data(this.jm.mind);
            } else if (data_format == 'text') {
                data = format.text.get_data(this.jm.mind);
            } else {
                logger.error('unsupported ' + data_format + ' format');
            }
            return data;
        }
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */

    class LayoutProvider {
        constructor(jm, options) {
            this.opts = options;
            this.jm = jm;
            this.isside = this.opts.mode == 'side';
            this.bounds = null;

            this.cache_valid = false;
        }
        init() {
            logger.debug('layout.init');
        }
        reset() {
            logger.debug('layout.reset');
            this.bounds = { n: 0, s: 0, w: 0, e: 0 };
        }
        calculate_next_child_direction(node) {
            if (this.isside) {
                return Direction.right;
            }
            var children = node.children || [];
            var children_len = children.length;
            var r = 0;
            for (var i = 0; i < children_len; i++) {
                if (children[i].direction === Direction.left) {
                    r--;
                } else {
                    r++;
                }
            }
            return children_len > 1 && r > 0 ? Direction.left : Direction.right;
        }
        layout() {
            logger.debug('layout.layout');
            this.layout_direction();
            this.layout_offset();
        }
        layout_direction() {
            this._layout_direction_root();
        }
        _layout_direction_root() {
            var node = this.jm.mind.root;
            var layout_data = null;
            if ('layout' in node._data) {
                layout_data = node._data.layout;
            } else {
                layout_data = {};
                node._data.layout = layout_data;
            }
            var children = node.children;
            var children_count = children.length;
            layout_data.direction = Direction.center;
            layout_data.side_index = 0;
            if (this.isside) {
                var i = children_count;
                while (i--) {
                    this._layout_direction_side(children[i], Direction.right, i);
                }
            } else {
                var i = children_count;
                var subnode = null;
                while (i--) {
                    subnode = children[i];
                    if (subnode.direction == Direction.left) {
                        this._layout_direction_side(subnode, Direction.left, i);
                    } else {
                        this._layout_direction_side(subnode, Direction.right, i);
                    }
                }
            }
        }
        _layout_direction_side(node, direction, side_index) {
            var layout_data = null;
            if ('layout' in node._data) {
                layout_data = node._data.layout;
            } else {
                layout_data = {};
                node._data.layout = layout_data;
            }
            var children = node.children;
            var children_count = children.length;

            layout_data.direction = direction;
            layout_data.side_index = side_index;
            var i = children_count;
            while (i--) {
                this._layout_direction_side(children[i], direction, i);
            }
        }
        layout_offset() {
            var node = this.jm.mind.root;
            var layout_data = node._data.layout;
            layout_data.offset_x = 0;
            layout_data.offset_y = 0;
            layout_data.outer_height = 0;
            var children = node.children;
            var i = children.length;
            var left_nodes = [];
            var right_nodes = [];
            var subnode = null;
            while (i--) {
                subnode = children[i];
                if (subnode._data.layout.direction == Direction.right) {
                    right_nodes.unshift(subnode);
                } else {
                    left_nodes.unshift(subnode);
                }
            }
            layout_data.left_nodes = left_nodes;
            layout_data.right_nodes = right_nodes;
            layout_data.outer_height_left = this._layout_offset_subnodes(left_nodes);
            layout_data.outer_height_right = this._layout_offset_subnodes(right_nodes);
            this.bounds.e = node._data.view.width / 2;
            this.bounds.w = 0 - this.bounds.e;
            this.bounds.n = 0;
            this.bounds.s = Math.max(layout_data.outer_height_left, layout_data.outer_height_right);
        }
        // layout both the x and y axis
        _layout_offset_subnodes(nodes) {
            var total_height = 0;
            var nodes_count = nodes.length;
            var i = nodes_count;
            var node = null;
            var node_outer_height = 0;
            var layout_data = null;
            var base_y = 0;
            var pd = null; // parent._data
            while (i--) {
                node = nodes[i];
                layout_data = node._data.layout;
                if (pd == null) {
                    pd = node.parent._data;
                }

                node_outer_height = this._layout_offset_subnodes(node.children);
                if (!node.expanded) {
                    node_outer_height = 0;
                    this.set_visible(node.children, false);
                }
                node_outer_height = Math.max(node._data.view.height, node_outer_height);
                if (node.children.length > 1) {
                    node_outer_height += this.opts.cousin_space;
                }

                layout_data.outer_height = node_outer_height;
                layout_data.offset_y = base_y - node_outer_height / 2;
                layout_data.offset_x =
                    this.opts.hspace * layout_data.direction +
                    (pd.view.width * (pd.layout.direction + layout_data.direction)) / 2;
                if (!node.parent.isroot) {
                    layout_data.offset_x += this.opts.pspace * layout_data.direction;
                }

                base_y = base_y - node_outer_height - this.opts.vspace;
                total_height += node_outer_height;
            }
            if (nodes_count > 1) {
                total_height += this.opts.vspace * (nodes_count - 1);
            }
            i = nodes_count;
            var middle_height = total_height / 2;
            while (i--) {
                node = nodes[i];
                node._data.layout.offset_y += middle_height;
            }
            return total_height;
        }
        // layout the y axis only, for collapse/expand a node
        _layout_offset_subnodes_height(nodes) {
            var total_height = 0;
            var nodes_count = nodes.length;
            var i = nodes_count;
            var node = null;
            var node_outer_height = 0;
            var layout_data = null;
            var base_y = 0;
            var pd = null; // parent._data
            while (i--) {
                node = nodes[i];
                layout_data = node._data.layout;
                if (pd == null) {
                    pd = node.parent._data;
                }

                node_outer_height = this._layout_offset_subnodes_height(node.children);
                if (!node.expanded) {
                    node_outer_height = 0;
                }
                node_outer_height = Math.max(node._data.view.height, node_outer_height);
                if (node.children.length > 1) {
                    node_outer_height += this.opts.cousin_space;
                }

                layout_data.outer_height = node_outer_height;
                layout_data.offset_y = base_y - node_outer_height / 2;
                base_y = base_y - node_outer_height - this.opts.vspace;
                total_height += node_outer_height;
            }
            if (nodes_count > 1) {
                total_height += this.opts.vspace * (nodes_count - 1);
            }
            i = nodes_count;
            var middle_height = total_height / 2;
            while (i--) {
                node = nodes[i];
                node._data.layout.offset_y += middle_height;
            }
            return total_height;
        }
        get_node_offset(node) {
            var layout_data = node._data.layout;
            var offset_cache = null;
            if ('_offset_' in layout_data && this.cache_valid) {
                offset_cache = layout_data._offset_;
            } else {
                offset_cache = { x: -1, y: -1 };
                layout_data._offset_ = offset_cache;
            }
            if (offset_cache.x == -1 || offset_cache.y == -1) {
                var x = layout_data.offset_x;
                var y = layout_data.offset_y;
                if (!node.isroot) {
                    var offset_p = this.get_node_offset(node.parent);
                    x += offset_p.x;
                    y += offset_p.y;
                }
                offset_cache.x = x;
                offset_cache.y = y;
            }
            return offset_cache;
        }
        get_node_point(node) {
            var view_data = node._data.view;
            var offset_p = this.get_node_offset(node);
            var p = {};
            p.x = offset_p.x + (view_data.width * (node._data.layout.direction - 1)) / 2;
            p.y = offset_p.y - view_data.height / 2;
            return p;
        }
        get_node_point_in(node) {
            var p = this.get_node_offset(node);
            return p;
        }
        get_node_point_out(node) {
            var layout_data = node._data.layout;
            var pout_cache = null;
            if ('_pout_' in layout_data && this.cache_valid) {
                pout_cache = layout_data._pout_;
            } else {
                pout_cache = { x: -1, y: -1 };
                layout_data._pout_ = pout_cache;
            }
            if (pout_cache.x == -1 || pout_cache.y == -1) {
                if (node.isroot) {
                    pout_cache.x = 0;
                    pout_cache.y = 0;
                } else {
                    var view_data = node._data.view;
                    var offset_p = this.get_node_offset(node);
                    pout_cache.x =
                        offset_p.x + (view_data.width + this.opts.pspace) * node._data.layout.direction;
                    pout_cache.y = offset_p.y;
                }
            }
            return pout_cache;
        }
        get_expander_point(node) {
            var p = this.get_node_point_out(node);
            var ex_p = {};
            if (node._data.layout.direction == Direction.right) {
                ex_p.x = p.x - this.opts.pspace;
            } else {
                ex_p.x = p.x;
            }
            ex_p.y = p.y - Math.ceil(this.opts.pspace / 2);
            return ex_p;
        }
        get_min_size() {
            var nodes = this.jm.mind.nodes;
            var node = null;
            var pout = null;
            for (var node_id in nodes) {
                node = nodes[node_id];
                pout = this.get_node_point_out(node);
                if (pout.x > this.bounds.e) {
                    this.bounds.e = pout.x;
                }
                if (pout.x < this.bounds.w) {
                    this.bounds.w = pout.x;
                }
            }
            return {
                w: this.bounds.e - this.bounds.w,
                h: this.bounds.s - this.bounds.n,
            };
        }
        toggle_node(node) {
            if (node.isroot) {
                return;
            }
            if (node.expanded) {
                this.collapse_node(node);
            } else {
                this.expand_node(node);
            }
        }
        expand_node(node) {
            node.expanded = true;
            this.part_layout(node);
            this.set_visible(node.children, true);
            this.jm.invoke_event_handle(EventType.show, {
                evt: 'expand_node',
                data: [],
                node: node.id,
            });
        }
        collapse_node(node) {
            node.expanded = false;
            this.part_layout(node);
            this.set_visible(node.children, false);
            this.jm.invoke_event_handle(EventType.show, {
                evt: 'collapse_node',
                data: [],
                node: node.id,
            });
        }
        expand_all() {
            var nodes = this.jm.mind.nodes;
            var c = 0;
            var node;
            for (var node_id in nodes) {
                node = nodes[node_id];
                if (!node.expanded) {
                    node.expanded = true;
                    c++;
                }
            }
            if (c > 0) {
                var root = this.jm.mind.root;
                this.part_layout(root);
                this.set_visible(root.children, true);
            }
        }
        collapse_all() {
            var nodes = this.jm.mind.nodes;
            var c = 0;
            var node;
            for (var node_id in nodes) {
                node = nodes[node_id];
                if (node.expanded && !node.isroot) {
                    node.expanded = false;
                    c++;
                }
            }
            if (c > 0) {
                var root = this.jm.mind.root;
                this.part_layout(root);
                this.set_visible(root.children, true);
            }
        }
        expand_to_depth(target_depth, curr_nodes, curr_depth) {
            if (target_depth < 1) {
                return;
            }
            var nodes = curr_nodes || this.jm.mind.root.children;
            var depth = curr_depth || 1;
            var i = nodes.length;
            var node = null;
            while (i--) {
                node = nodes[i];
                if (depth < target_depth) {
                    if (!node.expanded) {
                        this.expand_node(node);
                    }
                    this.expand_to_depth(target_depth, node.children, depth + 1);
                }
                if (depth == target_depth) {
                    if (node.expanded) {
                        this.collapse_node(node);
                    }
                }
            }
        }
        part_layout(node) {
            var root = this.jm.mind.root;
            if (!!root) {
                var root_layout_data = root._data.layout;
                if (node.isroot) {
                    root_layout_data.outer_height_right = this._layout_offset_subnodes_height(
                        root_layout_data.right_nodes
                    );
                    root_layout_data.outer_height_left = this._layout_offset_subnodes_height(
                        root_layout_data.left_nodes
                    );
                } else {
                    if (node._data.layout.direction == Direction.right) {
                        root_layout_data.outer_height_right = this._layout_offset_subnodes_height(
                            root_layout_data.right_nodes
                        );
                    } else {
                        root_layout_data.outer_height_left = this._layout_offset_subnodes_height(
                            root_layout_data.left_nodes
                        );
                    }
                }
                this.bounds.s = Math.max(
                    root_layout_data.outer_height_left,
                    root_layout_data.outer_height_right
                );
                this.cache_valid = false;
            } else {
                logger.warn('can not found root node');
            }
        }
        set_visible(nodes, visible) {
            var i = nodes.length;
            var node = null;
            while (i--) {
                node = nodes[i];
                node._data.layout;
                if (node.expanded) {
                    this.set_visible(node.children, visible);
                } else {
                    this.set_visible(node.children, false);
                }
                if (!node.isroot) {
                    node._data.layout.visible = visible;
                }
            }
        }
        is_expand(node) {
            return node.expanded;
        }
        is_visible(node) {
            var layout_data = node._data.layout;
            if ('visible' in layout_data && !layout_data.visible) {
                return false;
            } else {
                return true;
            }
        }
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    class SvgGraph {
        constructor(view) {
            this.view = view;
            this.opts = view.opts;
            this.e_svg = SvgGraph.c('svg');
            this.e_svg.setAttribute('class', 'jsmind');
            this.size = { w: 0, h: 0 };
            this.lines = [];
            this.line_drawing = {
                straight: this._line_to,
                curved: this._bezier_to,
            };
            this.drawing = this.line_drawing[this.opts.line_style] || this.line_drawing.curved;
        }
        static c(tag) {
            return $.d.createElementNS('http://www.w3.org/2000/svg', tag);
        }
        element() {
            return this.e_svg;
        }
        set_size(w, h) {
            this.size.w = w;
            this.size.h = h;
            this.e_svg.setAttribute('width', w);
            this.e_svg.setAttribute('height', h);
        }
        clear() {
            var len = this.lines.length;
            while (len--) {
                this.e_svg.removeChild(this.lines[len]);
            }
            this.lines.length = 0;
        }
        draw_line(pout, pin, offset, color) {
            var line = SvgGraph.c('path');
            line.setAttribute('stroke', color || this.opts.line_color);
            line.setAttribute('stroke-width', this.opts.line_width);
            line.setAttribute('fill', 'transparent');
            this.lines.push(line);
            this.e_svg.appendChild(line);
            this.drawing(
                line,
                pin.x + offset.x,
                pin.y + offset.y,
                pout.x + offset.x,
                pout.y + offset.y
            );
        }

        copy_to(dest_canvas_ctx, callback) {
            var img = new Image();
            img.onload = function () {
                dest_canvas_ctx.drawImage(img, 0, 0);
                !!callback && callback();
            };
            img.src =
                'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(this.e_svg));
        }
        _bezier_to(path, x1, y1, x2, y2) {
            path.setAttribute(
                'd',
                'M ' +
                    x1 +
                    ' ' +
                    y1 +
                    ' C ' +
                    (x1 + ((x2 - x1) * 2) / 3) +
                    ' ' +
                    y1 +
                    ', ' +
                    x1 +
                    ' ' +
                    y2 +
                    ', ' +
                    x2 +
                    ' ' +
                    y2
            );
        }
        _line_to(path, x1, y1, x2, y2) {
            path.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2);
        }
    }

    class CanvasGraph {
        constructor(view) {
            this.opts = view.opts;
            this.e_canvas = $.c('canvas');
            this.e_canvas.className = 'jsmind';
            this.canvas_ctx = this.e_canvas.getContext('2d');
            this.size = { w: 0, h: 0 };
            this.line_drawing = {
                straight: this._line_to,
                curved: this._bezier_to,
            };
            this.drawing = this.line_drawing[this.opts.line_style] || this.line_drawing.curved;
        }
        element() {
            return this.e_canvas;
        }
        set_size(w, h) {
            this.size.w = w;
            this.size.h = h;
            this.e_canvas.width = w;
            this.e_canvas.height = h;
        }
        clear() {
            this.canvas_ctx.clearRect(0, 0, this.size.w, this.size.h);
        }
        draw_line(pout, pin, offset, color) {
            var ctx = this.canvas_ctx;
            ctx.strokeStyle = color || this.opts.line_color;
            ctx.lineWidth = this.opts.line_width;
            ctx.lineCap = 'round';
            this.drawing(ctx, pin.x + offset.x, pin.y + offset.y, pout.x + offset.x, pout.y + offset.y);
        }
        copy_to(dest_canvas_ctx, callback) {
            dest_canvas_ctx.drawImage(this.e_canvas, 0, 0);
            !!callback && callback();
        }
        _bezier_to(ctx, x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.bezierCurveTo(x1 + ((x2 - x1) * 2) / 3, y1, x1, y2, x2, y2);
            ctx.stroke();
        }
        _line_to(ctx, x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    function init_graph(view, engine) {
        return engine.toLowerCase() === 'svg' ? new SvgGraph(view) : new CanvasGraph(view);
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */

    class ViewProvider {
        constructor(jm, options) {
            this.opts = options;
            this.jm = jm;
            this.layout = jm.layout;

            this.container = null;
            this.e_panel = null;
            this.e_nodes = null;

            this.size = { w: 0, h: 0 };

            this.selected_node = null;
            this.editing_node = null;

            this.graph = null;
            this._initialized = false;
        }
        init() {
            logger.debug(this.opts);
            logger.debug('view.init');

            this.container = $.i(this.opts.container) ? this.opts.container : $.g(this.opts.container);
            if (!this.container) {
                logger.error('the options.view.container was not be found in dom');
                return;
            }
            this.graph = init_graph(this, this.opts.engine);

            this.e_panel = $.c('div');
            this.e_nodes = $.c('jmnodes');
            this.e_editor = $.c('input');
            this.e_panel.className = 'jsmind-inner jmnode-overflow-' + this.opts.node_overflow;
            this.e_panel.tabIndex = 1;
            this.e_panel.appendChild(this.graph.element());
            this.e_panel.appendChild(this.e_nodes);

            this.e_editor.className = 'jsmind-editor';
            this.e_editor.type = 'text';

            this.zoom_current = 1;

            var v = this;
            $.on(this.e_editor, 'keydown', function (e) {
                var evt = e || event;
                if (evt.keyCode == 13) {
                    v.edit_node_end();
                    evt.stopPropagation();
                }
            });
            $.on(this.e_editor, 'blur', function (e) {
                v.edit_node_end();
            });

            this.container.appendChild(this.e_panel);
        }
        add_event(obj, event_name, event_handle, capture_by_panel) {
            let target = !!capture_by_panel ? this.e_panel : this.e_nodes;
            $.on(target, event_name, function (e) {
                var evt = e || event;
                event_handle.call(obj, evt);
            });
        }
        get_binded_nodeid(element) {
            if (element == null) {
                return null;
            }
            var tagName = element.tagName.toLowerCase();
            if (tagName == 'jmnode' || tagName == 'jmexpander') {
                return element.getAttribute('nodeid');
            } else if (tagName == 'jmnodes' || tagName == 'body' || tagName == 'html') {
                return null;
            } else {
                return this.get_binded_nodeid(element.parentElement);
            }
        }
        is_node(element) {
            if (element == null) {
                return false;
            }
            var tagName = element.tagName.toLowerCase();
            if (tagName == 'jmnode') {
                return true;
            } else if (tagName == 'jmnodes' || tagName == 'body' || tagName == 'html') {
                return false;
            } else {
                return this.is_node(element.parentElement);
            }
        }
        is_expander(element) {
            return element.tagName.toLowerCase() == 'jmexpander';
        }
        reset() {
            logger.debug('view.reset');
            this.selected_node = null;
            this.clear_lines();
            this.clear_nodes();
            this.reset_theme();
        }
        reset_theme() {
            var theme_name = this.jm.options.theme;
            if (!!theme_name) {
                this.e_nodes.className = 'theme-' + theme_name;
            } else {
                this.e_nodes.className = '';
            }
        }
        reset_custom_style() {
            var nodes = this.jm.mind.nodes;
            for (var nodeid in nodes) {
                this.reset_node_custom_style(nodes[nodeid]);
            }
        }
        load() {
            logger.debug('view.load');
            this.setup_canvas_draggable(this.opts.draggable);
            this.init_nodes();
            this._initialized = true;
        }
        expand_size() {
            var min_size = this.layout.get_min_size();
            var min_width = min_size.w + this.opts.hmargin * 2;
            var min_height = min_size.h + this.opts.vmargin * 2;
            var client_w = this.e_panel.clientWidth;
            var client_h = this.e_panel.clientHeight;
            if (client_w < min_width) {
                client_w = min_width;
            }
            if (client_h < min_height) {
                client_h = min_height;
            }
            this.size.w = client_w;
            this.size.h = client_h;
        }
        init_nodes_size(node) {
            var view_data = node._data.view;
            view_data.width = view_data.element.clientWidth;
            view_data.height = view_data.element.clientHeight;
        }
        init_nodes() {
            var nodes = this.jm.mind.nodes;
            var doc_frag = $.d.createDocumentFragment();
            for (var nodeid in nodes) {
                this.create_node_element(nodes[nodeid], doc_frag);
            }
            this.e_nodes.appendChild(doc_frag);
            for (var nodeid in nodes) {
                this.init_nodes_size(nodes[nodeid]);
            }
        }
        add_node(node) {
            this.create_node_element(node, this.e_nodes);
            this.init_nodes_size(node);
        }
        create_node_element(node, parent_node) {
            var view_data = null;
            if ('view' in node._data) {
                view_data = node._data.view;
            } else {
                view_data = {};
                node._data.view = view_data;
            }

            var d = $.c('jmnode');
            if (node.isroot) {
                d.className = 'root';
            } else {
                var d_e = $.c('jmexpander');
                $.t(d_e, '-');
                d_e.setAttribute('nodeid', node.id);
                d_e.style.visibility = 'hidden';
                parent_node.appendChild(d_e);
                view_data.expander = d_e;
            }
            if (!!node.topic) {
                if (this.opts.support_html) {
                    $.h(d, node.topic);
                } else {
                    $.t(d, node.topic);
                }
            }
            d.setAttribute('nodeid', node.id);
            d.style.visibility = 'hidden';
            this._reset_node_custom_style(d, node.data);

            parent_node.appendChild(d);
            view_data.element = d;
        }
        remove_node(node) {
            if (this.selected_node != null && this.selected_node.id == node.id) {
                this.selected_node = null;
            }
            if (this.editing_node != null && this.editing_node.id == node.id) {
                node._data.view.element.removeChild(this.e_editor);
                this.editing_node = null;
            }
            var children = node.children;
            var i = children.length;
            while (i--) {
                this.remove_node(children[i]);
            }
            if (node._data.view) {
                var element = node._data.view.element;
                var expander = node._data.view.expander;
                this.e_nodes.removeChild(element);
                this.e_nodes.removeChild(expander);
                node._data.view.element = null;
                node._data.view.expander = null;
            }
        }
        update_node(node) {
            var view_data = node._data.view;
            var element = view_data.element;
            if (!!node.topic) {
                if (this.opts.support_html) {
                    $.h(element, node.topic);
                } else {
                    $.t(element, node.topic);
                }
            }
            if (this.layout.is_visible(node)) {
                view_data.width = element.clientWidth;
                view_data.height = element.clientHeight;
            } else {
                let origin_style = element.getAttribute('style');
                element.style = 'visibility: visible; left:0; top:0;';
                view_data.width = element.clientWidth;
                view_data.height = element.clientHeight;
                element.style = origin_style;
            }
        }
        select_node(node) {
            if (!!this.selected_node) {
                var element = this.selected_node._data.view.element;
                element.className = element.className.replace(/\s*selected\b/i, '');
                this.restore_selected_node_custom_style(this.selected_node);
            }
            if (!!node) {
                this.selected_node = node;
                node._data.view.element.className += ' selected';
                this.clear_selected_node_custom_style(node);
            }
        }
        select_clear() {
            this.select_node(null);
        }
        get_editing_node() {
            return this.editing_node;
        }
        is_editing() {
            return !!this.editing_node;
        }
        edit_node_begin(node) {
            if (!node.topic) {
                logger.warn("don't edit image nodes");
                return;
            }
            if (this.editing_node != null) {
                this.edit_node_end();
            }
            this.editing_node = node;
            var view_data = node._data.view;
            var element = view_data.element;
            var topic = node.topic;
            var ncs = getComputedStyle(element);
            this.e_editor.value = topic;
            this.e_editor.style.width =
                element.clientWidth -
                parseInt(ncs.getPropertyValue('padding-left')) -
                parseInt(ncs.getPropertyValue('padding-right')) +
                'px';
            element.innerHTML = '';
            element.appendChild(this.e_editor);
            element.style.zIndex = 5;
            this.e_editor.focus();
            this.e_editor.select();
        }
        edit_node_end() {
            if (this.editing_node != null) {
                var node = this.editing_node;
                this.editing_node = null;
                var view_data = node._data.view;
                var element = view_data.element;
                var topic = this.e_editor.value;
                element.style.zIndex = 'auto';
                element.removeChild(this.e_editor);
                if (util.text.is_empty(topic) || node.topic === topic) {
                    if (this.opts.support_html) {
                        $.h(element, node.topic);
                    } else {
                        $.t(element, node.topic);
                    }
                } else {
                    this.jm.update_node(node.id, topic);
                }
            }
            this.e_panel.focus();
        }
        get_view_offset() {
            var bounds = this.layout.bounds;
            var _x = (this.size.w - bounds.e - bounds.w) / 2;
            var _y = this.size.h / 2;
            return { x: _x, y: _y };
        }
        resize() {
            this.graph.set_size(1, 1);
            this.e_nodes.style.width = '1px';
            this.e_nodes.style.height = '1px';

            this.expand_size();
            this._show();
        }
        _show() {
            this.graph.set_size(this.size.w, this.size.h);
            this.e_nodes.style.width = this.size.w + 'px';
            this.e_nodes.style.height = this.size.h + 'px';
            this.show_nodes();
            this.show_lines();
            //this.layout.cache_valid = true;
            this.jm.invoke_event_handle(EventType.resize, { data: [] });
        }
        zoom_in(e) {
            return this.set_zoom(this.zoom_current + this.opts.zoom.step, e);
        }
        zoom_out(e) {
            return this.set_zoom(this.zoom_current - this.opts.zoom.step, e);
        }
        set_zoom(zoom, e) {
            if (zoom < this.opts.zoom.min || zoom > this.opts.zoom.max) {
                return false;
            }
            let e_panel_rect = this.e_panel.getBoundingClientRect();
            if (
                zoom < 1 &&
                this.size.w * zoom < e_panel_rect.width &&
                this.size.h * zoom < e_panel_rect.height
            ) {
                return false;
            }
            let zoom_center = !!e
                ? { x: e.x - e_panel_rect.x, y: e.y - e_panel_rect.y }
                : { x: e_panel_rect.width / 2, y: e_panel_rect.height / 2 };
            let panel_scroll_x =
                ((this.e_panel.scrollLeft + zoom_center.x) * zoom) / this.zoom_current - zoom_center.x;
            let panel_scroll_y =
                ((this.e_panel.scrollTop + zoom_center.y) * zoom) / this.zoom_current - zoom_center.y;

            this.zoom_current = zoom;
            for (var i = 0; i < this.e_panel.children.length; i++) {
                this.e_panel.children[i].style.zoom = zoom;
            }
            this._show();
            this.e_panel.scrollLeft = panel_scroll_x;
            this.e_panel.scrollTop = panel_scroll_y;
            return true;
        }
        show(keep_center) {
            logger.debug('view.show');
            this.expand_size();
            this._show();
            if (!!keep_center) {
                this.center_node(this.jm.mind.root);
            }
        }
        relayout() {
            this.expand_size();
            this._show();
        }
        save_location(node) {
            var vd = node._data.view;
            vd._saved_location = {
                x: parseInt(vd.element.style.left) - this.e_panel.scrollLeft,
                y: parseInt(vd.element.style.top) - this.e_panel.scrollTop,
            };
        }
        restore_location(node) {
            var vd = node._data.view;
            this.e_panel.scrollLeft = parseInt(vd.element.style.left) - vd._saved_location.x;
            this.e_panel.scrollTop = parseInt(vd.element.style.top) - vd._saved_location.y;
        }
        clear_nodes() {
            var mind = this.jm.mind;
            if (mind == null) {
                return;
            }
            var nodes = mind.nodes;
            var node = null;
            for (var nodeid in nodes) {
                node = nodes[nodeid];
                node._data.view.element = null;
                node._data.view.expander = null;
            }
            this.e_nodes.innerHTML = '';
        }
        show_nodes() {
            var nodes = this.jm.mind.nodes;
            var node = null;
            var node_element = null;
            var expander = null;
            var p = null;
            var p_expander = null;
            var expander_text = '-';
            var view_data = null;
            var _offset = this.get_view_offset();
            for (var nodeid in nodes) {
                node = nodes[nodeid];
                view_data = node._data.view;
                node_element = view_data.element;
                expander = view_data.expander;
                if (!this.layout.is_visible(node)) {
                    node_element.style.display = 'none';
                    expander.style.display = 'none';
                    continue;
                }
                this.reset_node_custom_style(node);
                p = this.layout.get_node_point(node);
                view_data.abs_x = _offset.x + p.x;
                view_data.abs_y = _offset.y + p.y;
                node_element.style.left = _offset.x + p.x + 'px';
                node_element.style.top = _offset.y + p.y + 'px';
                node_element.style.display = '';
                node_element.style.visibility = 'visible';
                if (!node.isroot && node.children.length > 0) {
                    expander_text = node.expanded ? '-' : '+';
                    p_expander = this.layout.get_expander_point(node);
                    expander.style.left = _offset.x + p_expander.x + 'px';
                    expander.style.top = _offset.y + p_expander.y + 'px';
                    expander.style.display = '';
                    expander.style.visibility = 'visible';
                    $.t(expander, expander_text);
                }
                // hide expander while all children have been removed
                if (!node.isroot && node.children.length == 0) {
                    expander.style.display = 'none';
                    expander.style.visibility = 'hidden';
                }
            }
        }
        reset_node_custom_style(node) {
            this._reset_node_custom_style(node._data.view.element, node.data);
        }
        _reset_node_custom_style(node_element, node_data) {
            if ('background-color' in node_data) {
                node_element.style.backgroundColor = node_data['background-color'];
            }
            if ('foreground-color' in node_data) {
                node_element.style.color = node_data['foreground-color'];
            }
            if ('width' in node_data) {
                node_element.style.width = node_data['width'] + 'px';
            }
            if ('height' in node_data) {
                node_element.style.height = node_data['height'] + 'px';
            }
            if ('font-size' in node_data) {
                node_element.style.fontSize = node_data['font-size'] + 'px';
            }
            if ('font-weight' in node_data) {
                node_element.style.fontWeight = node_data['font-weight'];
            }
            if ('font-style' in node_data) {
                node_element.style.fontStyle = node_data['font-style'];
            }
            if ('background-image' in node_data) {
                var backgroundImage = node_data['background-image'];
                if (backgroundImage.startsWith('data') && node_data['width'] && node_data['height']) {
                    var img = new Image();

                    img.onload = function () {
                        var c = $.c('canvas');
                        c.width = node_element.clientWidth;
                        c.height = node_element.clientHeight;
                        var img = this;
                        if (c.getContext) {
                            var ctx = c.getContext('2d');
                            ctx.drawImage(
                                img,
                                2,
                                2,
                                node_element.clientWidth,
                                node_element.clientHeight
                            );
                            var scaledImageData = c.toDataURL();
                            node_element.style.backgroundImage = 'url(' + scaledImageData + ')';
                        }
                    };
                    img.src = backgroundImage;
                } else {
                    node_element.style.backgroundImage = 'url(' + backgroundImage + ')';
                }
                node_element.style.backgroundSize = '99%';

                if ('background-rotation' in node_data) {
                    node_element.style.transform =
                        'rotate(' + node_data['background-rotation'] + 'deg)';
                }
            }
        }
        restore_selected_node_custom_style(node) {
            var node_element = node._data.view.element;
            var node_data = node.data;
            if ('background-color' in node_data) {
                node_element.style.backgroundColor = node_data['background-color'];
            }
            if ('foreground-color' in node_data) {
                node_element.style.color = node_data['foreground-color'];
            }
        }
        clear_selected_node_custom_style(node) {
            var node_element = node._data.view.element;
            node_element.style.backgroundColor = '';
            node_element.style.color = '';
        }
        clear_lines() {
            this.graph.clear();
        }
        show_lines() {
            this.clear_lines();
            var nodes = this.jm.mind.nodes;
            var node = null;
            var pin = null;
            var pout = null;
            var color = null;
            var _offset = this.get_view_offset();
            for (var nodeid in nodes) {
                node = nodes[nodeid];
                if (!!node.isroot) {
                    continue;
                }
                if (!this.layout.is_visible(node)) {
                    continue;
                }
                pin = this.layout.get_node_point_in(node);
                pout = this.layout.get_node_point_out(node.parent);
                color = node.data['leading-line-color'];
                this.graph.draw_line(pout, pin, _offset, color);
            }
        }
        // Drag the whole mind map with your mouse, when it's larger that the container
        setup_canvas_draggable(enabled) {
            this.opts.draggable = enabled;
            if (!this._initialized) {
                let dragging = false;
                let x, y;
                if (this.opts.hide_scrollbars_when_draggable) {
                    // Avoid scrollbars when mind map is larger than the container (e_panel = id jsmind-inner)
                    this.e_panel.style = 'overflow: hidden';
                }
                // Move the whole mind map with mouse moves, while button is down.
                $.on(this.container, 'mousedown', eventDown => {
                    if (this.opts.draggable) {
                        dragging = true;
                        // Record current mouse position.
                        x = eventDown.clientX;
                        y = eventDown.clientY;
                    }
                });
                // Stop moving mind map once mouse button is released.
                $.on(this.container, 'mouseup', () => {
                    dragging = false;
                });
                // Follow current mouse position and move mind map accordingly.
                $.on(this.container, 'mousemove', eventMove => {
                    if (this.opts.draggable) {
                        if (dragging) {
                            this.e_panel.scrollBy(x - eventMove.clientX, y - eventMove.clientY);
                            // Record new current position.
                            x = eventMove.clientX;
                            y = eventMove.clientY;
                        }
                    }
                });
            }
        }
        center_node(node) {
            if (!this.layout.is_visible(node)) {
                logger.warn('can not scroll to the node, because it is invisible');
                return false;
            }
            let view_data = node._data.view;
            let e_panel_rect = this.e_panel.getBoundingClientRect();
            let node_center_point = {
                x: view_data.abs_x + view_data.width / 2,
                y: view_data.abs_y + view_data.height / 2,
            };
            this.e_panel.scrollTo(
                node_center_point.x * this.zoom_current - e_panel_rect.width / 2,
                node_center_point.y * this.zoom_current - e_panel_rect.height / 2
            );
            return true;
        }

        zoomIn(e) {
            logger.warn('please use zoom_in instead');
            return this.zoom_in(e);
        }
        zoomOut(e) {
            logger.warn('please use zoom_out instead');
            return this.zoom_out(e);
        }
        setZoom(zoom, e) {
            logger.warn('please use set_zoom instead');
            return this.set_zoom(zoom, e);
        }
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    class ShortcutProvider {
        constructor(jm, options) {
            this.jm = jm;
            this.opts = options;
            this.mapping = options.mapping;
            this.handles = options.handles;
            this._newid = null;
            this._mapping = {};
        }
        init() {
            $.on(this.jm.view.e_panel, 'keydown', this.handler.bind(this));

            this.handles['addchild'] = this.handle_addchild;
            this.handles['addbrother'] = this.handle_addbrother;
            this.handles['editnode'] = this.handle_editnode;
            this.handles['delnode'] = this.handle_delnode;
            this.handles['toggle'] = this.handle_toggle;
            this.handles['up'] = this.handle_up;
            this.handles['down'] = this.handle_down;
            this.handles['left'] = this.handle_left;
            this.handles['right'] = this.handle_right;

            for (var handle in this.mapping) {
                if (!!this.mapping[handle] && handle in this.handles) {
                    let keys = this.mapping[handle];
                    if (!Array.isArray(keys)) {
                        keys = [keys];
                    }
                    for (let key of keys) {
                        this._mapping[key] = this.handles[handle];
                    }
                }
            }

            if (typeof this.opts.id_generator === 'function') {
                this._newid = this.opts.id_generator;
            } else {
                this._newid = util.uuid.newid;
            }
        }
        enable_shortcut() {
            this.opts.enable = true;
        }
        disable_shortcut() {
            this.opts.enable = false;
        }
        handler(e) {
            if (e.which == 9) {
                e.preventDefault();
            } //prevent tab to change focus in browser
            if (this.jm.view.is_editing()) {
                return;
            }
            var evt = e || event;
            if (!this.opts.enable) {
                return true;
            }
            var kc =
                evt.keyCode +
                (evt.metaKey << 13) +
                (evt.ctrlKey << 12) +
                (evt.altKey << 11) +
                (evt.shiftKey << 10);
            if (kc in this._mapping) {
                this._mapping[kc].call(this, this.jm, e);
            }
        }
        handle_addchild(_jm, e) {
            var selected_node = _jm.get_selected_node();
            if (!!selected_node) {
                var node_id = this._newid();
                var node = _jm.add_node(selected_node, node_id, 'New Node');
                if (!!node) {
                    _jm.select_node(node_id);
                    _jm.begin_edit(node_id);
                }
            }
        }
        handle_addbrother(_jm, e) {
            var selected_node = _jm.get_selected_node();
            if (!!selected_node && !selected_node.isroot) {
                var node_id = this._newid();
                var node = _jm.insert_node_after(selected_node, node_id, 'New Node');
                if (!!node) {
                    _jm.select_node(node_id);
                    _jm.begin_edit(node_id);
                }
            }
        }
        handle_editnode(_jm, e) {
            var selected_node = _jm.get_selected_node();
            if (!!selected_node) {
                _jm.begin_edit(selected_node);
            }
        }
        handle_delnode(_jm, e) {
            var selected_node = _jm.get_selected_node();
            if (!!selected_node && !selected_node.isroot) {
                _jm.select_node(selected_node.parent);
                _jm.remove_node(selected_node);
            }
        }
        handle_toggle(_jm, e) {
            var evt = e || event;
            var selected_node = _jm.get_selected_node();
            if (!!selected_node) {
                _jm.toggle_node(selected_node.id);
                evt.stopPropagation();
                evt.preventDefault();
            }
        }
        handle_up(_jm, e) {
            var evt = e || event;
            var selected_node = _jm.get_selected_node();
            if (!!selected_node) {
                var up_node = _jm.find_node_before(selected_node);
                if (!up_node) {
                    var np = _jm.find_node_before(selected_node.parent);
                    if (!!np && np.children.length > 0) {
                        up_node = np.children[np.children.length - 1];
                    }
                }
                if (!!up_node) {
                    _jm.select_node(up_node);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        }
        handle_down(_jm, e) {
            var evt = e || event;
            var selected_node = _jm.get_selected_node();
            if (!!selected_node) {
                var down_node = _jm.find_node_after(selected_node);
                if (!down_node) {
                    var np = _jm.find_node_after(selected_node.parent);
                    if (!!np && np.children.length > 0) {
                        down_node = np.children[0];
                    }
                }
                if (!!down_node) {
                    _jm.select_node(down_node);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        }
        handle_left(_jm, e) {
            this._handle_direction(_jm, e, Direction.left);
        }
        handle_right(_jm, e) {
            this._handle_direction(_jm, e, Direction.right);
        }
        _handle_direction(_jm, e, d) {
            var evt = e || event;
            var selected_node = _jm.get_selected_node();
            var node = null;
            if (!!selected_node) {
                if (selected_node.isroot) {
                    var c = selected_node.children;
                    var children = [];
                    for (var i = 0; i < c.length; i++) {
                        if (c[i].direction === d) {
                            children.push(i);
                        }
                    }
                    node = c[children[Math.floor((children.length - 1) / 2)]];
                } else if (selected_node.direction === d) {
                    var children = selected_node.children;
                    var children_count = children.length;
                    if (children_count > 0) {
                        node = children[Math.floor((children_count - 1) / 2)];
                    }
                } else {
                    node = selected_node.parent;
                }
                if (!!node) {
                    _jm.select_node(node);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        }
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    const plugin_data = {
        plugins: [],
    };

    function register(plugin) {
        if (!(plugin instanceof Plugin)) {
            throw new Error('can not register plugin, it is not an instance of Plugin');
        }
        if (plugin_data.plugins.map(p => p.name).includes(plugin.name)) {
            throw new Error('can not register plugin ' + plugin.name + ': plugin name already exist');
        }
        plugin_data.plugins.push(plugin);
    }

    function apply(jm, options) {
        $.w.setTimeout(function () {
            _apply(jm, options);
        }, 0);
    }

    function _apply(jm, options) {
        plugin_data.plugins.forEach(p => p.fn_init(jm, options[p.name]));
    }

    class Plugin {
        // function fn_init(jm, options){ }
        constructor(name, fn_init) {
            if (!name) {
                throw new Error('plugin must has a name');
            }
            if (!fn_init || typeof fn_init !== 'function') {
                throw new Error('plugin must has an init function');
            }
            this.name = name;
            this.fn_init = fn_init;
        }
    }

    /**
     * @license BSD
     * @copyright 2014-2023 hizzgdev@163.com
     *
     * Project Home:
     *   https://github.com/hizzgdev/jsmind/
     */


    class jsMind {
        static mind = Mind;
        static node = Node;
        static direction = Direction;
        static event_type = EventType;
        static $ = $;
        static plugin = Plugin;
        static register_plugin = register;
        static util = util;

        constructor(options) {
            jsMind.current = this;
            this.options = merge_option(options);
            logger.level(LogLevel[this.options.log_level]);
            this.version = __version__;
            this.initialized = false;
            this.mind = null;
            this.event_handles = [];
            this.init();
        }

        init() {
            if (!!this.initialized) {
                return;
            }
            this.initialized = true;
            var opts_layout = {
                mode: this.options.mode,
                hspace: this.options.layout.hspace,
                vspace: this.options.layout.vspace,
                pspace: this.options.layout.pspace,
                cousin_space: this.options.layout.cousin_space,
            };
            var opts_view = {
                container: this.options.container,
                support_html: this.options.support_html,
                engine: this.options.view.engine,
                hmargin: this.options.view.hmargin,
                vmargin: this.options.view.vmargin,
                line_width: this.options.view.line_width,
                line_color: this.options.view.line_color,
                line_style: this.options.view.line_style,
                draggable: this.options.view.draggable,
                hide_scrollbars_when_draggable: this.options.view.hide_scrollbars_when_draggable,
                node_overflow: this.options.view.node_overflow,
                zoom: this.options.view.zoom,
            };
            // create instance of function provider
            this.data = new DataProvider(this);
            this.layout = new LayoutProvider(this, opts_layout);
            this.view = new ViewProvider(this, opts_view);
            this.shortcut = new ShortcutProvider(this, this.options.shortcut);

            this.data.init();
            this.layout.init();
            this.view.init();
            this.shortcut.init();

            this._event_bind();

            apply(this, this.options.plugin);
        }
        get_editable() {
            return this.options.editable;
        }
        enable_edit() {
            this.options.editable = true;
        }
        disable_edit() {
            this.options.editable = false;
        }
        get_view_draggable() {
            return this.options.view.draggable;
        }
        enable_view_draggable() {
            this.options.view.draggable = true;
            this.view.setup_canvas_draggable(true);
        }
        disable_view_draggable() {
            this.options.view.draggable = false;
            this.view.setup_canvas_draggable(false);
        }
        // options are 'mousedown', 'click', 'dblclick', 'mousewheel'
        enable_event_handle(event_handle) {
            this.options.default_event_handle['enable_' + event_handle + '_handle'] = true;
        }
        // options are 'mousedown', 'click', 'dblclick', 'mousewheel'
        disable_event_handle(event_handle) {
            this.options.default_event_handle['enable_' + event_handle + '_handle'] = false;
        }
        set_theme(theme) {
            var theme_old = this.options.theme;
            this.options.theme = !!theme ? theme : null;
            if (theme_old != this.options.theme) {
                this.view.reset_theme();
                this.view.reset_custom_style();
            }
        }
        _event_bind() {
            this.view.add_event(this, 'mousedown', this.mousedown_handle);
            this.view.add_event(this, 'click', this.click_handle);
            this.view.add_event(this, 'dblclick', this.dblclick_handle);
            this.view.add_event(this, 'mousewheel', this.mousewheel_handle, true);
        }
        mousedown_handle(e) {
            if (!this.options.default_event_handle['enable_mousedown_handle']) {
                return;
            }
            var element = e.target || event.srcElement;
            var node_id = this.view.get_binded_nodeid(element);
            if (!!node_id) {
                if (this.view.is_node(element)) {
                    this.select_node(node_id);
                }
            } else {
                this.select_clear();
            }
        }
        click_handle(e) {
            if (!this.options.default_event_handle['enable_click_handle']) {
                return;
            }
            var element = e.target || event.srcElement;
            var is_expander = this.view.is_expander(element);
            if (is_expander) {
                var node_id = this.view.get_binded_nodeid(element);
                if (!!node_id) {
                    this.toggle_node(node_id);
                }
            }
        }
        dblclick_handle(e) {
            if (!this.options.default_event_handle['enable_dblclick_handle']) {
                return;
            }
            if (this.get_editable()) {
                var element = e.target || event.srcElement;
                var is_node = this.view.is_node(element);
                if (is_node) {
                    var node_id = this.view.get_binded_nodeid(element);
                    if (!!node_id) {
                        this.begin_edit(node_id);
                    }
                }
            }
        }
        // Use [Ctrl] + Mousewheel, to zoom in/out.
        mousewheel_handle(e) {
            // Test if mousewheel option is enabled and Ctrl key is pressed.
            if (!this.options.default_event_handle['enable_mousewheel_handle'] || !e.ctrlKey) {
                return;
            }
            var evt = e || event;
            // Avoid default page scrolling behavior.
            evt.preventDefault();

            if (evt.deltaY < 0) {
                this.view.zoom_in(evt); // wheel down
            } else {
                this.view.zoom_out(evt);
            }
        }
        begin_edit(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return false;
                } else {
                    return this.begin_edit(the_node);
                }
            }
            if (this.get_editable()) {
                this.view.edit_node_begin(node);
            } else {
                logger.error('fail, this mind map is not editable.');
                return;
            }
        }
        end_edit() {
            this.view.edit_node_end();
        }
        toggle_node(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return;
                } else {
                    return this.toggle_node(the_node);
                }
            }
            if (node.isroot) {
                return;
            }
            this.view.save_location(node);
            this.layout.toggle_node(node);
            this.view.relayout();
            this.view.restore_location(node);
        }
        expand_node(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return;
                } else {
                    return this.expand_node(the_node);
                }
            }
            if (node.isroot) {
                return;
            }
            this.view.save_location(node);
            this.layout.expand_node(node);
            this.view.relayout();
            this.view.restore_location(node);
        }
        collapse_node(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return;
                } else {
                    return this.collapse_node(the_node);
                }
            }
            if (node.isroot) {
                return;
            }
            this.view.save_location(node);
            this.layout.collapse_node(node);
            this.view.relayout();
            this.view.restore_location(node);
        }
        expand_all() {
            this.layout.expand_all();
            this.view.relayout();
        }
        collapse_all() {
            this.layout.collapse_all();
            this.view.relayout();
        }
        expand_to_depth(depth) {
            this.layout.expand_to_depth(depth);
            this.view.relayout();
        }
        _reset() {
            this.view.reset();
            this.layout.reset();
            this.data.reset();
        }
        _show(mind) {
            var m = mind || format.node_array.example;

            this.mind = this.data.load(m);
            if (!this.mind) {
                logger.error('data.load error');
                return;
            } else {
                logger.debug('data.load ok');
            }

            this.view.load();
            logger.debug('view.load ok');

            this.layout.layout();
            logger.debug('layout.layout ok');

            this.view.show(true);
            logger.debug('view.show ok');

            this.invoke_event_handle(EventType.show, { data: [mind] });
        }
        show(mind) {
            this._reset();
            this._show(mind);
        }
        get_meta() {
            return {
                name: this.mind.name,
                author: this.mind.author,
                version: this.mind.version,
            };
        }
        get_data(data_format) {
            var df = data_format || 'node_tree';
            return this.data.get_data(df);
        }
        get_root() {
            return this.mind.root;
        }
        get_node(node) {
            if (Node.is_node(node)) {
                return node;
            }
            return this.mind.get_node(node);
        }
        add_node(parent_node, node_id, topic, data, direction) {
            if (this.get_editable()) {
                var the_parent_node = this.get_node(parent_node);
                var dir = Direction.of(direction);
                if (dir === undefined) {
                    dir = this.layout.calculate_next_child_direction(the_parent_node);
                }
                var node = this.mind.add_node(the_parent_node, node_id, topic, data, dir);
                if (!!node) {
                    this.view.add_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.view.reset_node_custom_style(node);
                    this.expand_node(the_parent_node);
                    this.invoke_event_handle(EventType.edit, {
                        evt: 'add_node',
                        data: [the_parent_node.id, node_id, topic, data, dir],
                        node: node_id,
                    });
                }
                return node;
            } else {
                logger.error('fail, this mind map is not editable');
                return null;
            }
        }
        insert_node_before(node_before, node_id, topic, data, direction) {
            if (this.get_editable()) {
                var the_node_before = this.get_node(node_before);
                var dir = Direction.of(direction);
                if (dir === undefined) {
                    dir = this.layout.calculate_next_child_direction(the_node_before.parent);
                }
                var node = this.mind.insert_node_before(the_node_before, node_id, topic, data, dir);
                if (!!node) {
                    this.view.add_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(EventType.edit, {
                        evt: 'insert_node_before',
                        data: [the_node_before.id, node_id, topic, data, dir],
                        node: node_id,
                    });
                }
                return node;
            } else {
                logger.error('fail, this mind map is not editable');
                return null;
            }
        }
        insert_node_after(node_after, node_id, topic, data, direction) {
            if (this.get_editable()) {
                var the_node_after = this.get_node(node_after);
                var dir = Direction.of(direction);
                if (dir === undefined) {
                    dir = this.layout.calculate_next_child_direction(the_node_after.parent);
                }
                var node = this.mind.insert_node_after(the_node_after, node_id, topic, data, dir);
                if (!!node) {
                    this.view.add_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(EventType.edit, {
                        evt: 'insert_node_after',
                        data: [the_node_after.id, node_id, topic, data, dir],
                        node: node_id,
                    });
                }
                return node;
            } else {
                logger.error('fail, this mind map is not editable');
                return null;
            }
        }
        remove_node(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return false;
                } else {
                    return this.remove_node(the_node);
                }
            }
            if (this.get_editable()) {
                if (node.isroot) {
                    logger.error('fail, can not remove root node');
                    return false;
                }
                var node_id = node.id;
                var parent_id = node.parent.id;
                var parent_node = this.get_node(parent_id);
                this.view.save_location(parent_node);
                this.view.remove_node(node);
                this.mind.remove_node(node);
                this.layout.layout();
                this.view.show(false);
                this.view.restore_location(parent_node);
                this.invoke_event_handle(EventType.edit, {
                    evt: 'remove_node',
                    data: [node_id],
                    node: parent_id,
                });
                return true;
            } else {
                logger.error('fail, this mind map is not editable');
                return false;
            }
        }
        update_node(node_id, topic) {
            if (this.get_editable()) {
                if (util.text.is_empty(topic)) {
                    logger.warn('fail, topic can not be empty');
                    return;
                }
                var node = this.get_node(node_id);
                if (!!node) {
                    if (node.topic === topic) {
                        logger.info('nothing changed');
                        this.view.update_node(node);
                        return;
                    }
                    node.topic = topic;
                    this.view.update_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(EventType.edit, {
                        evt: 'update_node',
                        data: [node_id, topic],
                        node: node_id,
                    });
                }
            } else {
                logger.error('fail, this mind map is not editable');
                return;
            }
        }
        move_node(node_id, before_id, parent_id, direction) {
            if (this.get_editable()) {
                var node = this.get_node(node_id);
                var updated_node = this.mind.move_node(node, before_id, parent_id, direction);
                if (!!updated_node) {
                    this.view.update_node(updated_node);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(EventType.edit, {
                        evt: 'move_node',
                        data: [node_id, before_id, parent_id, direction],
                        node: node_id,
                    });
                }
            } else {
                logger.error('fail, this mind map is not editable');
                return;
            }
        }
        select_node(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return;
                } else {
                    return this.select_node(the_node);
                }
            }
            if (!this.layout.is_visible(node)) {
                return;
            }
            this.mind.selected = node;
            this.view.select_node(node);
            this.invoke_event_handle(EventType.select, { evt: 'select_node', data: [], node: node.id });
        }
        get_selected_node() {
            if (!!this.mind) {
                return this.mind.selected;
            } else {
                return null;
            }
        }
        select_clear() {
            if (!!this.mind) {
                this.mind.selected = null;
                this.view.select_clear();
            }
        }
        is_node_visible(node) {
            return this.layout.is_visible(node);
        }
        scroll_node_to_center(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                } else {
                    this.scroll_node_to_center(the_node);
                }
                return;
            }
            this.view.center_node(node);
        }
        find_node_before(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return;
                } else {
                    return this.find_node_before(the_node);
                }
            }
            if (node.isroot) {
                return null;
            }
            var n = null;
            if (node.parent.isroot) {
                var c = node.parent.children;
                var prev = null;
                var ni = null;
                for (var i = 0; i < c.length; i++) {
                    ni = c[i];
                    if (node.direction === ni.direction) {
                        if (node.id === ni.id) {
                            n = prev;
                        }
                        prev = ni;
                    }
                }
            } else {
                n = this.mind.get_node_before(node);
            }
            return n;
        }
        find_node_after(node) {
            if (!Node.is_node(node)) {
                var the_node = this.get_node(node);
                if (!the_node) {
                    logger.error('the node[id=' + node + '] can not be found.');
                    return;
                } else {
                    return this.find_node_after(the_node);
                }
            }
            if (node.isroot) {
                return null;
            }
            var n = null;
            if (node.parent.isroot) {
                var c = node.parent.children;
                var found = false;
                var ni = null;
                for (var i = 0; i < c.length; i++) {
                    ni = c[i];
                    if (node.direction === ni.direction) {
                        if (found) {
                            n = ni;
                            break;
                        }
                        if (node.id === ni.id) {
                            found = true;
                        }
                    }
                }
            } else {
                n = this.mind.get_node_after(node);
            }
            return n;
        }
        set_node_color(node_id, bg_color, fg_color) {
            if (this.get_editable()) {
                var node = this.mind.get_node(node_id);
                if (!!node) {
                    if (!!bg_color) {
                        node.data['background-color'] = bg_color;
                    }
                    if (!!fg_color) {
                        node.data['foreground-color'] = fg_color;
                    }
                    this.view.reset_node_custom_style(node);
                }
            } else {
                logger.error('fail, this mind map is not editable');
                return null;
            }
        }
        set_node_font_style(node_id, size, weight, style) {
            if (this.get_editable()) {
                var node = this.mind.get_node(node_id);
                if (!!node) {
                    if (!!size) {
                        node.data['font-size'] = size;
                    }
                    if (!!weight) {
                        node.data['font-weight'] = weight;
                    }
                    if (!!style) {
                        node.data['font-style'] = style;
                    }
                    this.view.reset_node_custom_style(node);
                    this.view.update_node(node);
                    this.layout.layout();
                    this.view.show(false);
                }
            } else {
                logger.error('fail, this mind map is not editable');
                return null;
            }
        }
        set_node_background_image(node_id, image, width, height, rotation) {
            if (this.get_editable()) {
                var node = this.mind.get_node(node_id);
                if (!!node) {
                    if (!!image) {
                        node.data['background-image'] = image;
                    }
                    if (!!width) {
                        node.data['width'] = width;
                    }
                    if (!!height) {
                        node.data['height'] = height;
                    }
                    if (!!rotation) {
                        node.data['background-rotation'] = rotation;
                    }
                    this.view.reset_node_custom_style(node);
                    this.view.update_node(node);
                    this.layout.layout();
                    this.view.show(false);
                }
            } else {
                logger.error('fail, this mind map is not editable');
                return null;
            }
        }
        set_node_background_rotation(node_id, rotation) {
            if (this.get_editable()) {
                var node = this.mind.get_node(node_id);
                if (!!node) {
                    if (!node.data['background-image']) {
                        logger.error(
                            'fail, only can change rotation angle of node with background image'
                        );
                        return null;
                    }
                    node.data['background-rotation'] = rotation;
                    this.view.reset_node_custom_style(node);
                    this.view.update_node(node);
                    this.layout.layout();
                    this.view.show(false);
                }
            } else {
                logger.error('fail, this mind map is not editable');
                return null;
            }
        }
        resize() {
            this.view.resize();
        }
        // callback(type ,data)
        add_event_listener(callback) {
            if (typeof callback === 'function') {
                this.event_handles.push(callback);
            }
        }
        clear_event_listener() {
            this.event_handles = [];
        }
        invoke_event_handle(type, data) {
            var j = this;
            $.w.setTimeout(function () {
                j._invoke_event_handle(type, data);
            }, 0);
        }
        _invoke_event_handle(type, data) {
            var l = this.event_handles.length;
            for (var i = 0; i < l; i++) {
                this.event_handles[i](type, data);
            }
        }

        static show(options, mind) {
            logger.warn(
                '`jsMind.show(options, mind)` is deprecated, please use `jm = new jsMind(options); jm.show(mind);` instead'
            );
            var _jm = new jsMind(options);
            _jm.show(mind);
            return _jm;
        }
    }

    return jsMind;

}));
//# sourceMappingURL=jsmind.js.map
