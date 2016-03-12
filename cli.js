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
    .options('d', {
      alias: 'directory',
      describe: '本地种子目录'
    })
    .options('t', {
      alias: 'torrent',
      describe: '本地种子文件(单个)'
    })
    .options('m', {
      alias: 'magnet',
      describe: '磁力链（链接后加 \\n 最多添加15个）'
    })
    .options('v', {
      alias: 'version',
      describe: '版本号'
    })
    .argv

if (argv.v || argv.version) {
  console.log(pjson.version);

} else if (argv.d || argv.directory) {
  recursive(argv.directory, function (err, files) {
    if (err) {
      console.error(err.message);
    }

    // 过滤种子文件
    files = _.filter(files, function (file) {
      return file.match(/.\.torrent$/);
    });

    // Fix: 超出『离线下载』最大任务运行数量(15个)
    var chunks = _.chunk(files, 15);
    _.each(chunks, function (chunk, index) {
      var urls = '';
      _.each(chunk, function (file) {
        // console.log(file);
        var torrent = parseTorrent(fs.readFileSync(file));
        var uri = parseTorrent.toMagnetURI(torrent);
        urls += uri + '\n';
      });

      setTimeout(function () {
        if (chunk.length === 14) {
          console.log("++ Added " + ((index + 1) * 15) + " tasks");
        } else {
          console.log("++ Added " + (index * 15 + chunk.length) + " tasks");
        }
        lx115.addTasks(urls);
      }, index * 20000);
    });
  });

} else if (argv.t || argv.torrent) {
  var torrent = parseTorrent(fs.readFileSync(argv.torrent));
  var url = parseTorrent.toMagnetURI(torrent);
  lx115.addTasks(url);

} else if (argv.m || argv.magnet) {
  lx115.addTasks(argv.magnet);

} else {
  optimist.showHelp();
}
