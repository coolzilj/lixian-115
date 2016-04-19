# Lixian 115 (115 离线下载命令行工具)

```
115 离线下载命令行工具

Options:
  -d, --directory  本地种子目录
  -t, --torrent    本地种子文件(单个)
  -m, --magnet     磁力链（链接后加 \n 最多添加15个）
  -v, --version    版本号
```

## Install

```
$ npm install -g lixian-115
```

## Usage

### Login (登录)
由于 115 的登录策略改变，登录功能已废。
请在浏览器登录后，推荐使用 [EditThisCookie](http://www.editthiscookie.com/) 插件导出 cookies 到 `{HOMEPATH}/.115.cookies` 即可正常使用。cookies 只支持分号分隔的格式，`a=1;b=2;c=3` [#3](https://github.com/coolzilj/lixian-115/issues/3)

### Add multiple torrents (本地种子目录)
```js
lx115 -d path/of/torrents/folder（存放 .torrent 文件的文件夹路径）
```

### Add torrent (单个本地种子文件)
```js
lx115 -t ~/Desktop/完美假妻168.Lock.Me.Up.Tie.Him.Down.2014.HD720P.X264.AAC.chinese.CHS.Mp4Ba.torrent
```

### Add magnet (磁力链，链接后加 \n 最多添加15个)
```js
lx115 -m "magnet:?xt=urn:btih:...\nmagnet:?xt=urn:btih:...\nmagnet:?xt=urn:btih:...\nmagnet:?xt=urn:btih:..."
```

## License

MIT © [Liu Jin](http://liujin.me)
