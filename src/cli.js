#!/usr/bin/env node

import Lixian115 from './lixian-115'
import fs from 'fs'
import recursive from 'recursive-readdir'
import parseTorrent from 'parse-torrent'
import _ from 'lodash'
import optimist from 'optimist'
import prompt from 'prompt'

var lx115 = new Lixian115()

var argv = optimist.usage('115 离线下载命令行工具')
    .options('l', {
      alias: 'login',
      describe: '登录'
    })
    .options('t', {
      alias: 'torrents',
      describe: '批量添加种子文件'
    })
    .argv

if (argv.l || argv.login) {
  // var isCookiesFileExisted = fs.existsSync(lx115.cookiesPath())
  // if (isCookiesFileExisted) {
  //   console.log(`你已登录.`)
  //   process.exit(0)
  // }
  prompt.message = ''
  prompt.delimiter = '>'.green
  prompt.start()
  prompt.get([{
    name: 'username',
    description: '用户名',
    required: true
  }, {
    name: 'password',
    description: '密码',
    required: true,
    hidden: true
  }], (err, result) => {
    if (err) { throw err }
    lx115.login(result.username, result.password, (res) => {
      if (res.err_msg) {
        console.log(res.err_msg)
      } else {
        console.log(`你已登录.`)
      }

    })
  })
} else if (argv.t || argv.torrents) {
  recursive(argv.torrents, (err, files) => {
    if (err) { return console.log('Something wrong')}

    files = _.filter(files, (file) => {
      return file.match(/.\.torrent$/)
    })

    // Fix: 超出『离线下载』最大任务运行数量(15个)
    var chunks = _.chunk(files, 15)
    _.each(chunks, (chunk, index) => {
      var urls = ''
      _.each(chunk, (file) => {
        var torrent = parseTorrent(fs.readFileSync(file))
        var uri = parseTorrent.toMagnetURI(torrent)
        urls += uri + '\n'
      })

      setTimeout(() => {
        if (chunk.length === 14) {
          console.log(`++ Added ${(index + 1) * 15} link tasks`)
        } else {
          console.log(`++ Added ${index * 15 + chunk.length} link tasks`)
        }
        lx115.addLinkTasks(urls)
      }, index * 20000)
    })
  })
} else {
  optimist.showHelp()
}
