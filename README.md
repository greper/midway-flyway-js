# midway-flyway-js
`midway-flyway-js`是基于typeorm的flyway的js实现。
本项目被构建为midway组件，可与midway无缝集成。

# flyway
flyway是一款java版本的数据库升级迁移解决方案。
它能在server启动时自动检查脚本目录，执行sql升级脚本，记录执行历史。

本项目根据类似flyway的思路实现数据库升级迁移方案

# 快速开始

## 1. 准备
* nodejs环境
* midway项目

## 2. 安装
```
npm install midway-flyway-js
# or
yarn add midway-flyway-js
```
## 3. 集成
```js
import * as flyway from 'midway-flyway-js';
@Configuration({
  imports: [
    orm, // 加载 orm 组件
    flyway, //加载flyway组件
  ],
})
export class ContainerConfiguration {}
@Configuration({
  conflictCheck: true,
  imports: [
    orm, // 加载 orm 组件
    cache,
  ],
  importConfigs: [
    join(__dirname, './config'), // 加载配置文件（eggjs 下不需要）
  ],
})
export class ContainerLifeCycle {
  @App()
  app: Application;

  async onReady() {
  }
}

```

# 参考项目
* [flyway](https://github.com/flyway/flyway)
* [flyway-js](https://github.com/wanglihui/flyway-js)

感谢以上项目提供的基础


