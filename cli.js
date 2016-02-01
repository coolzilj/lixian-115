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
      describe: '种子目录'
    })
    .options('b', {
      alias: 'best',
      describe: '同一资源只添加清晰度最高的种子'
    })
    .options('v', {
      alias: 'version',
      describe: '版本号'
    })
    .argv

function bestQualityTorrent (files) {
  // 从左到右清晰度越来越低
  var qualities = ['HD2160P', 'HD1080P', 'HD720P', 'BD1080P', 'BD720P', 'HD640P', 'BD480P', 'DVD', 'DVDScr', 'DVDscr', 'TS720P']

  // 先按 qualities 排序
  files = _.sortBy(files, function(cur) {
    var cur = cur.match(/(\S+\.)X264/)[0].split('.');
    var curQuality = cur[cur.length - 2];
    var iCurQuality = qualities.indexOf(curQuality);
    return iCurQuality;
  });

  // 去重
  files = _.uniqWith(files, function(cur, oth) {
    var cur = cur.match(/(\S+\.)X264/)[0].split('.');
    var oth = oth.match(/(\S+\.)X264/)[0].split('.');
    var curQuality = cur[cur.length - 2];
    var othQuality = oth[oth.length - 2];
    var curTitle = cur[0];
    var othTitle = oth[0];
    var iCurQuality = qualities.indexOf(curQuality);
    var iOthQuality = qualities.indexOf(othQuality);
    if(curTitle === othTitle) {
      if(iCurQuality > -1 && iOthQuality > -1) {
        return iCurQuality > iOthQuality
      }
    }
  })
  return files;
  // console.log(files);
}

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

    // 过滤清晰度最高的种子
    if (argv.b || argv.best) {
      files = bestQualityTorrent(files)
    }

    // Fix: 超出『离线下载』最大任务运行数量(15个)
    var chunks = _.chunk(files, 15);
    _.each(chunks, function (chunk, index) {
      var urls = '';
      _.each(chunk, function (file) {
        console.log(file);
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
} else {
  optimist.showHelp();
}

