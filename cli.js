#!/usr/bin/env node

var Lixian115    = require('./index');
var pjson        = require('./package.json');
var fs           = require('fs');
var recursive    = require('recursive-readdir');
var parseTorrent = require('parse-torrent');
var _            = require('lodash');
var optimist     = require('optimist');

var lx115 = new Lixian115();

var argv = optimist.usage('115 离线下载命令行工具')
    .options('t', {
      alias: 'torrents',
      describe: '批量添加种子文件'
    })
    .options('v', {
      alias: 'version',
      describe: '版本号'
    })
    .argv

if (argv.v || argv.version) {
  console.log(pjson.version);
} else if (argv.t || argv.torrents) {
  recursive(argv.torrents, function (err, files) {
    if (err) {
      return console.log('Something wrong');
    }

    files = _.filter(files, function (file) {
      return file.match(/.\.torrent$/);
    });

    // Fix: 超出『离线下载』最大任务运行数量(15个)
    var chunks = _.chunk(files, 15);
    _.each(chunks, function (chunk, index) {
      var urls = '';
      _.each(chunk, function (file) {
        var torrent = parseTorrent(fs.readFileSync(file));
        var uri = parseTorrent.toMagnetURI(torrent);
        urls += uri + '\n';
      });

      setTimeout(function () {
        if (chunk.length === 14) {
          console.log("++ Added " + ((index + 1) * 15) + " link tasks");
        } else {
          console.log("++ Added " + (index * 15 + chunk.length) + " link tasks");
        }
        lx115.addLinkTasks(urls);
      }, index * 20000);
    });
  });
} else {
  optimist.showHelp();
}
