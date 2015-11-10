# Lixian 115 (115 离线下载命令行工具)
![screenshot](https://raw.githubusercontent.com/coolzilj/lixian-115/master/screenshot.png)

- [x] add multi torrents (批量添加种子文件)
- [x] add multi magnet links (批量添加磁力链)

## Install

```
$ npm install -g lixian-115
```

## Usage

### Login (登录)
由于 115 的登录策略改变，登录功能已废。
请在浏览器登录后，推荐使用 [EditThisCookie](http://www.editthiscookie.com/) 插件导出 cookies 到 `{HOMEPATH}/.115.cookies` 即可正常使用。

### Add torrents (批量添加种子文件)
```js
lx115 -t path/of/torrents/folder（存放 .torrent 文件的文件夹路径）
```

## License

MIT © [Liu Jin](http://liujin.me)
