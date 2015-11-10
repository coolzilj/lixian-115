'use strict'

var path         = require('path');
var fs           = require('fs');
var request      = require('request');
var objectAssign = require('object-assign');

function Lixian115 () {
  if (!(this instanceof Lixian115)) {
    return new Lixian115();
  }
  this.jar = request.jar();
  this.isLogin = false;
};

Lixian115.prototype.addLinkTasks = function (urls) {
  var self = this;
  self.checkLogin(function () {
    self.getUid(function (uid) {
      self.getSignTime(function (signTime) {
        urls = urls.split('\n');
        var obj = {};
        for (var i = 0; i < urls.length; i++) {
          obj['url[' + i + ']'] = urls[i];
        };
        var data = {
          'uid': uid,
          'sign': signTime.sign,
          'time': signTime.time
        };
        objectAssign(data, obj);
        self.setCookie('http://115.com/lixian/?ct=lixian&ac=add_task_urls');

        request.post({
          url: 'http://115.com/lixian/?ct=lixian&ac=add_task_urls',
          form: data,
          jar: self.jar
        }, function (err, res, body) {
          if (!err && res.statusCode === 200) {
            body = JSON.parse(body);
            if (body.state) {
              for (var i = 0; i < body.result.length; i++) {
                var result = body.result[i];
                if (result.info_hash) {
                  console.log("++ Add link task " + (i + 1) + " successed.");
                } else {
                  console.log("++ Add link task " + (i + 1) + " failed: " + result.error_msg);
                }
              }
            } else {
              console.error("Error: " + body.error_msg);
            }
          } else {
            console.error('Error at add link task.');
          }
        })
      })
    })
  })
};

Lixian115.prototype.getUid = function (cb) {
  if (!this.isLogin) {
    console.log('Please login first!');
    process.exit(0);
  }
  var url = 'http://my.115.com/?ct=ajax&ac=get_user_aq';
  this.setCookie(url);

  request.get({url: url, jar: this.jar}, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      cb(JSON.parse(body).data.uid);
    }
  })
};

Lixian115.prototype.getSignTime = function (cb) {
  if (!this.isLogin) {
    console.log('Please login first!');
    process.exit(0);
  }
  var url = 'http://115.com/?ct=offline&ac=space';
  this.setCookie(url);
  request.get({url: url, jar: this.jar}, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      var data = {
        sign: JSON.parse(body).sign,
        time: JSON.parse(body).time
      };
      cb(data);
    }
  })
};

Lixian115.prototype.checkLogin = function (cb) {
  var cookieString = this.getCookie();
  if (cookieString) {
    this.isLogin = true;
    cb();
  }
};

Lixian115.prototype.cookiesPath = function () {
  var homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  return path.join(homePath, '.115.cookies');
};

Lixian115.prototype.getCookie = function () {
  return fs.readFileSync(this.cookiesPath()).toString('utf8');
};

Lixian115.prototype.setCookie = function (url) {
  var cookieString = this.getCookie();
  cookieString.split(';').map((c) => {
    this.jar.setCookie(request.cookie(c), url);
  });
};

module.exports = Lixian115;
