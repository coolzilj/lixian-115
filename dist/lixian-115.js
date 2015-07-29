'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _sha1 = require('sha1');

var _sha12 = _interopRequireDefault(_sha1);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _toughCookieFilestore = require('tough-cookie-filestore');

var _toughCookieFilestore2 = _interopRequireDefault(_toughCookieFilestore);

var Lixian115 = (function () {
  function Lixian115() {
    _classCallCheck(this, Lixian115);

    this.isLogin = false;
    var isCookiesFileExisted = _fs2['default'].existsSync(this.cookiesPath());
    if (isCookiesFileExisted) {
      try {
        this.jar = _request2['default'].jar(new _toughCookieFilestore2['default'](this.cookiesPath()));
      } catch (e) {
        console.log('================================================');
        console.log('cookies file is invalid, please login first!');
        console.log('================================================');
        _fs2['default'].unlinkSync(this.cookiesPath());
        process.exit(0);
      }
    } else {
      console.log('================================================');
      console.log('cookies file is missing, please login first!');
      console.log('================================================');
      _fs2['default'].writeFileSync(this.cookiesPath(), '');
      this.jar = _request2['default'].jar();
    }
  }

  _createClass(Lixian115, [{
    key: 'login',
    value: function login(account, password, cb) {
      var _this = this;

      function get_ssopw(ssoext) {
        var p = (0, _sha12['default'])(password);
        var a = (0, _sha12['default'])(account);
        var t = (0, _sha12['default'])(p + a);
        var ssopw = (0, _sha12['default'])(t + ssoext.toUpperCase());
        return ssopw;
      }

      var ssoext = Date.now().toString();
      var ssopw = get_ssopw(ssoext);

      var data = {
        login: {
          'ssoent': 'B1',
          'version': '2.0',
          'ssoext': ssoext,
          'ssoln': account,
          'ssopw': ssopw,
          'ssovcode': ssoext,
          'safe': 1,
          'time': 1,
          'safe_login': 1
        },
        goto: 'http://m.115.com/?ac=home'
      };

      var headers = {
        'Accept': 'Accept: application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'text/html',
        'Accept-Language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4,zh-TW;q=0.2',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': 'http://m.115.com/',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
      };
      headers['Referer'] = 'http://passport.115.com/static/reg_login_130418/bridge.html?ajax_cb_key=bridge_' + Date.now();

      var params = {
        'ct': 'login',
        'ac': 'ajax',
        'is_ssl': 1
      };

      var url = 'http://passport.115.com';

      (0, _request2['default'])({
        method: 'POST',
        url: url,
        qs: params,
        headers: headers,
        form: data,
        jar: this.jar
      }, function (err, res, body) {
        if (!err && res.statusCode === 200) {
          body = JSON.parse(body);
          if (body.state) {
            _this.isLogin = true;
          }
          cb(body);
        } else {
          cb(err);
        }
      });
    }
  }, {
    key: 'addLinkTask',
    value: function addLinkTask(url) {
      var _this2 = this;

      this.checkLogin(function () {
        _this2.getUid(function (uid) {
          _this2.getSignTime(function (signTime) {
            var data = {
              'url': url,
              'uid': uid,
              'sign': signTime.sign,
              'time': signTime.time
            };

            _request2['default'].post({
              url: 'http://115.com/lixian/?ct=lixian&ac=add_task_url',
              form: data,
              jar: _this2.jar
            }, function (err, res, body) {
              if (!err && res.statusCode === 200) {
                body = JSON.parse(body);
                if (body.info_hash) {
                  console.log('++ Add link task successed.');
                } else {
                  console.error('Error: ' + body.error_msg + '.');
                }
                var data = {
                  'page': 1,
                  'uid': uid,
                  'sign': signTime.sign,
                  'time': signTime.time
                };
                _this2.getTaskLists(data);
              } else {
                console.error('Error at add link task.');
              }
            });
          });
        });
      });
    }
  }, {
    key: 'addLinkTasks',
    value: function addLinkTasks(urls) {
      var _this3 = this;

      this.checkLogin(function () {
        _this3.getUid(function (uid) {
          _this3.getSignTime(function (signTime) {
            urls = urls.split('\n');
            var obj = {};
            for (var i = 0; i < urls.length; i++) {
              obj['url[' + i + ']'] = urls[i];
            }
            var data = {
              'uid': uid,
              'sign': signTime.sign,
              'time': signTime.time
            };
            (0, _objectAssign2['default'])(data, obj);
            _request2['default'].post({
              url: 'http://115.com/lixian/?ct=lixian&ac=add_task_urls',
              form: data,
              jar: _this3.jar
            }, function (err, res, body) {
              if (!err && res.statusCode === 200) {

                body = JSON.parse(body);
                if (body.state) {
                  for (var i = 0; i < body.result.length; i++) {
                    var result = body.result[i];
                    if (result.info_hash) {
                      console.log('++ Add link task ' + (i + 1) + ' successed.');
                    } else {
                      console.log('++ Add link task ' + (i + 1) + ' failed: ' + result.error_msg + '.');
                    }
                  }
                } else {
                  console.error('Error: ' + body.error_msg);
                }

                // var data = {
                //   'page': 1,
                //   'uid': uid,
                //   'sign': signTime.sign,
                //   'time': signTime.time
                // }
                // this.getTaskLists(data)
              } else {
                console.error('Error at add link task.');
              }
            });
          });
        });
      });
    }
  }, {
    key: 'getUid',
    value: function getUid(cb) {
      if (!this.isLogin) {
        console.log('Please login first!');
        process.exit(0);
      }
      var url = 'http://my.115.com/?ct=ajax&ac=get_user_aq';
      _request2['default'].get({ url: url, jar: this.jar }, function (err, res, body) {
        if (!err && res.statusCode === 200) {
          cb(JSON.parse(body).data.uid);
        }
      });
    }
  }, {
    key: 'getSignTime',
    value: function getSignTime(cb) {
      if (!this.isLogin) {
        console.log('Please login first!');
        process.exit(0);
      }
      var url = 'http://115.com/?ct=offline&ac=space';
      _request2['default'].get({ url: url, jar: this.jar }, function (err, res, body) {
        if (!err && res.statusCode === 200) {
          var data = {
            sign: JSON.parse(body).sign,
            time: JSON.parse(body).time
          };
          cb(data);
        }
      });
    }
  }, {
    key: 'getTaskLists',
    value: function getTaskLists(data) {
      _request2['default'].post({
        url: 'http://115.com/lixian/?ct=lixian&ac=task_lists',
        form: data,
        jar: this.jar
      }, function (err, res, body) {
        if (!err && res.statusCode === 200) {
          body = JSON.parse(body);
          console.log('================================================');
          console.log('================== Task Lists ==================');
          console.log('================================================');
          for (var i = 0; i < body.tasks.length; i++) {
            var percentDone = body.tasks[i].percentDone;
            console.log('++ ' + body.tasks[i].name);
            console.log(percentDone + '% Done');
          };
        }
      });
    }
  }, {
    key: 'checkLogin',
    value: function checkLogin(cb) {
      var _this4 = this;

      var url = 'http://msg.115.com/?ac=unread';
      _request2['default'].get({ url: url, jar: this.jar }, function (err, res, body) {
        if (err) {
          throw err;
        }
        if (body.indexOf('"code"') === -1) {
          _this4.isLogin = true;
          cb();
        } else {
          console.log('================================================');
          console.log('cookies file is invalid, please login first!');
          console.log('================================================');
          _this4.isLogin = false;
        }
      });
    }
  }, {
    key: 'cookiesPath',
    value: function cookiesPath() {
      var homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      return _path2['default'].join(homePath, '.115.cookies.json');
    }
  }]);

  return Lixian115;
})();

exports['default'] = Lixian115;
module.exports = exports['default'];