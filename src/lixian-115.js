'use strict'

import path from 'path'
import fs from 'fs'
import sha1 from 'sha1'
import request from 'request'
import objectAssign from 'object-assign'
import FileCookieStore from 'tough-cookie-filestore'

export default class Lixian115 {
  constructor () {
    this.isLogin = false
    var isCookiesFileExisted = fs.existsSync(this.cookiesPath())
    if (isCookiesFileExisted) {
      try {
        this.jar = request.jar(new FileCookieStore(this.cookiesPath()))
      } catch (e) {
        console.log('================================================')
        console.log('cookies file is invalid, please login first!')
        console.log('================================================')
        fs.unlinkSync(this.cookiesPath())
        process.exit(0)
      }
    } else {
      console.log('================================================')
      console.log('cookies file is missing, please login first!')
      console.log('================================================')
      fs.writeFileSync(this.cookiesPath(), '')
      this.jar = request.jar()
    }
  }

  login (account, password, cb) {

    function get_ssopw (ssoext) {
      var p = sha1(password)
      var a = sha1(account)
      var t = sha1(p + a)
      var ssopw = sha1(t + ssoext.toUpperCase())
      return ssopw
    }

    var ssoext = Date.now().toString()
    var ssopw = get_ssopw(ssoext)

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
    }

    var headers = {
      'Accept': 'Accept: application/json, text/javascript, */*; q=0.01',
      'Accept-Encoding': 'text/html',
      'Accept-Language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4,zh-TW;q=0.2',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Referer': 'http://m.115.com/',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
    }
    headers['Referer'] = `http://passport.115.com/static/reg_login_130418/bridge.html?ajax_cb_key=bridge_${Date.now()}`

    var params = {
      'ct': 'login',
      'ac': 'ajax',
      'is_ssl': 1
    }

    var url = 'http://passport.115.com'

    request({
      method: 'POST',
      url: url,
      qs: params,
      headers: headers,
      form: data,
      jar: this.jar
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        body = JSON.parse(body)
        if (body.state) { this.isLogin = true }
        cb(body)
      } else {
        cb(err)
      }
    })
  }

  addLinkTask (url) {
    this.checkLogin(() => {
      this.getUid((uid) => {
        this.getSignTime((signTime) => {
          var data = {
            'url': url,
            'uid': uid,
            'sign': signTime.sign,
            'time': signTime.time
          }

          request.post({
            url: 'http://115.com/lixian/?ct=lixian&ac=add_task_url',
            form: data,
            jar: this.jar
          }, (err, res, body) => {
            if (!err && res.statusCode === 200) {
              body = JSON.parse(body)
              if (body.info_hash) {
                console.log('++ Add link task successed.')
              } else {
                console.error(`Error: ${body.error_msg}.`)
              }
              var data = {
                'page': 1,
                'uid': uid,
                'sign': signTime.sign,
                'time': signTime.time
              }
              this.getTaskLists(data)
            } else {
              console.error('Error at add link task.')
            }
          })
        })
      })
    })
  }

  addLinkTasks (urls) {
    this.checkLogin(() => {
      this.getUid((uid) => {
        this.getSignTime((signTime) => {
          urls = urls.split('\n')
          var obj = {}
          for (var i = 0; i < urls.length; i++) {
            obj['url[' + i + ']'] = urls[i]
          }
          var data = {
            'uid': uid,
            'sign': signTime.sign,
            'time': signTime.time
          }
          objectAssign(data, obj)
          request.post({
            url: 'http://115.com/lixian/?ct=lixian&ac=add_task_urls',
            form: data,
            jar: this.jar
          }, (err, res, body) => {
            if (!err && res.statusCode === 200) {

              body = JSON.parse(body)
              if (body.state) {
                for (var i = 0; i < body.result.length; i++) {
                  var result = body.result[i]
                  if (result.info_hash) {
                    console.log(`++ Add link task ${i + 1} successed.`)
                  } else {
                    console.log(`++ Add link task ${i + 1} failed: ${result.error_msg}.`)
                  }
                }
              } else {
                console.error(`Error: ${body.error_msg}`)
              }

              // var data = {
              //   'page': 1,
              //   'uid': uid,
              //   'sign': signTime.sign,
              //   'time': signTime.time
              // }
              // this.getTaskLists(data)

            } else {
              console.error('Error at add link task.')
            }
          })
        })
      })
    })
  }

  getUid (cb) {
    if (!this.isLogin) {
      console.log('Please login first!')
      process.exit(0)
    }
    var url = 'http://my.115.com/?ct=ajax&ac=get_user_aq'
    request.get({url: url, jar: this.jar}, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        cb(JSON.parse(body).data.uid)
      }
    })
  }

  getSignTime (cb) {
    if (!this.isLogin) {
      console.log('Please login first!')
      process.exit(0)
    }
    var url = 'http://115.com/?ct=offline&ac=space'
    request.get({url: url, jar: this.jar}, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        var data = {
          sign: JSON.parse(body).sign,
          time: JSON.parse(body).time
        }
        cb(data)
      }
    })
  }

  getTaskLists (data) {
    request.post({
      url: 'http://115.com/lixian/?ct=lixian&ac=task_lists',
      form: data,
      jar: this.jar
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        body = JSON.parse(body)
        console.log('================================================')
        console.log('================== Task Lists ==================')
        console.log('================================================')
        for (var i = 0; i < body.tasks.length; i++) {
          var percentDone = body.tasks[i].percentDone
          console.log(`++ ${body.tasks[i].name}`)
          console.log(`${percentDone}% Done`)
        };
      }
    })
  }

  checkLogin (cb) {
    var url = 'http://msg.115.com/?ac=unread'
    request.get({url: url, jar: this.jar}, (err, res, body) => {
      if (err) { throw err }
      if (body.indexOf('"code"') === -1) {
        this.isLogin = true
        cb()
      } else {
        console.log('================================================')
        console.log('cookies file is invalid, please login first!')
        console.log('================================================')
        this.isLogin = false
      }
    })
  }

  cookiesPath () {
    var homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
    return path.join(homePath, '.115.cookies.json')
  }

}
