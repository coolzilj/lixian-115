#!/usr/bin/env node
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lixian115 = require('./lixian-115');

var _lixian1152 = _interopRequireDefault(_lixian115);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _recursiveReaddir = require('recursive-readdir');

var _recursiveReaddir2 = _interopRequireDefault(_recursiveReaddir);

var _parseTorrent = require('parse-torrent');

var _parseTorrent2 = _interopRequireDefault(_parseTorrent);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _optimist = require('optimist');

var _optimist2 = _interopRequireDefault(_optimist);

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var lx115 = new _lixian1152['default']();

var argv = _optimist2['default'].usage('115 离线下载命令行工具').options('l', {
  alias: 'login',
  describe: '登录'
}).options('t', {
  alias: 'torrents',
  describe: '批量添加种子文件'
}).argv;

if (argv.l || argv.login) {
  // var isCookiesFileExisted = fs.existsSync(lx115.cookiesPath())
  // if (isCookiesFileExisted) {
  //   console.log(`你已登录.`)
  //   process.exit(0)
  // }
  _prompt2['default'].message = '';
  _prompt2['default'].delimiter = '>'.green;
  _prompt2['default'].start();
  _prompt2['default'].get([{
    name: 'username',
    description: '用户名',
    required: true
  }, {
    name: 'password',
    description: '密码',
    required: true,
    hidden: true
  }], function (err, result) {
    if (err) {
      throw err;
    }
    lx115.login(result.username, result.password, function (res) {
      if (res.err_msg) {
        console.log(res.err_msg);
      } else {
        console.log('你已登录.');
      }
    });
  });
} else if (argv.t || argv.torrents) {
  (0, _recursiveReaddir2['default'])(argv.torrents, function (err, files) {
    if (err) {
      return console.log('Something wrong');
    }

    files = _lodash2['default'].filter(files, function (file) {
      return file.match(/.\.torrent$/);
    });

    // Fix: 超出『离线下载』最大任务运行数量(15个)
    var chunks = _lodash2['default'].chunk(files, 15);
    _lodash2['default'].each(chunks, function (chunk, index) {
      var urls = '';
      _lodash2['default'].each(chunk, function (file) {
        var torrent = (0, _parseTorrent2['default'])(_fs2['default'].readFileSync(file));
        var uri = _parseTorrent2['default'].toMagnetURI(torrent);
        urls += uri + '\n';
      });

      setTimeout(function () {
        if (chunk.length === 14) {
          console.log('++ Added ' + (index + 1) * 15 + ' link tasks');
        } else {
          console.log('++ Added ' + (index * 15 + chunk.length) + ' link tasks');
        }
        lx115.addLinkTasks(urls);
      }, index * 20000);
    });
  });
} else {
  _optimist2['default'].showHelp();
}