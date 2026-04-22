# blog

`blog` 是 `sunkz.top` 的 Hugo 静态站仓库，当前同时承载了博客正文、关于页，以及几个直接放在 `static/pages/` 下的独立产品页面。

站点配置在 [`hugo.toml`](hugo.toml)，主题使用 `paper`，构建产物输出到仓库内的 [`docs/`](docs) 目录，适合直接作为静态托管目录发布。

## 当前内容

- 博客文章：[`content/posts/`](content/posts)
- 关于页：[`content/about.md`](content/about.md)
- 独立页面：[`static/pages/`](static/pages)
- 自定义域名：[`static/CNAME`](static/CNAME)

目前导航里已经接入的独立页面有：

- `CCBot`：[`static/pages/cc-bot.html`](static/pages/cc-bot.html)
- `CCSpace`：[`static/pages/cc-space.html`](static/pages/cc-space.html)

## 目录说明

```text
.
|-- content/             Hugo 内容目录
|   |-- about.md         关于页
|   `-- posts/           博客文章
|-- static/              原始静态资源
|   |-- CNAME            自定义域名
|   `-- pages/           直出的独立 HTML 页面及资源
|-- docs/                Hugo 生成后的站点产物
|-- themes/paper/        站点主题
|-- hugo.toml            站点配置
|-- start.sh             本地预览脚本
`-- deploy.sh            构建并提交发布脚本
```

## 本地开发

先确保本地已安装 `hugo`，然后在仓库根目录执行：

```bash
hugo server -D
```

访问本地预览地址后，即可查看草稿和正式内容。

仓库里还提供了一个现成脚本：

```bash
./start.sh
```

这个脚本的真实行为是：

1. 清空 [`docs/`](docs)
2. 执行 `hugo server -D`

也就是说，它更像“清理后启动本地预览”，不是单纯的无副作用开发命令。

## 构建与发布

生成正式站点产物：

```bash
hugo
```

执行后会把最终内容写入 [`docs/`](docs)，包括从 [`static/CNAME`](static/CNAME) 复制出来的 [`docs/CNAME`](docs/CNAME)。

仓库现有的一键发布脚本是：

```bash
./deploy.sh
```

它会依次执行：

1. 清空 [`docs/`](docs)
2. 执行 `hugo`
3. 执行 `git add .`
4. 以当前时间戳作为提交信息执行 `git commit`
5. 执行 `git push`

这意味着 `deploy.sh` 会把仓库里的所有当前改动一起提交并推送。若只想发布部分变更，建议手动执行 `hugo` 并自行检查 `git diff`、`git status` 后再提交。

## 维护约定

- 写博客时，优先修改 [`content/posts/`](content/posts) 下的 Markdown。
- 调整独立产品页时，直接修改 [`static/pages/`](static/pages) 下的 HTML、CSS、图片和脚本资源。
- [`docs/`](docs) 是构建产物，通常不应手改；应以源文件变更后重新执行 `hugo` 为准。
- 顶部导航来自 [`hugo.toml`](hugo.toml) 和各独立页面内嵌的 header，新增页面时这两处通常都要同步调整。
