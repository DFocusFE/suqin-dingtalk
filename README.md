# suqin-dingtalk

> [suqin](https://github.com/DFocusFE/suqin)的一款插件, 使其支持钉钉(Dingtalk)账号体系的通讯录操作.

## 主要功能

- 对`department`的增删改查操作, 该资源在API中使用`group`进行描述
- 对`user`的增删改查操作, 该资源在API中使用`member`进行描述

## API列表

### read API

- 查询成员列表`readMembers`
- 查询成员详情`readMember`
- 查询群组列表`readGroups`
- 查询群组详情`readGroup`

### write API

- 创建成员`createMember`
- 删除成员`deleteMember`
- 修改成员`updateMember`
- 创建群组`createGroup`
- 删除群组`deleteGroup`
- 修改群组`updateGroup`

## 使用方法

```js
const Suqin = require('suqin');
const Dingtalk = require('suqin-dingtalk');

const directories = new Suqin();

const opts = {
  // 必选
  corpId: 'your corpId',
  corpSecret: 'your corpSecret',
  // 可选
  baseUrl: 'https://oapi.dingtalk.com',
  name: 'Dingtalk',
};

const dk = new Dingtalk(opts);

directories.use(dk);

// member为您要创建的成员, 其数据结构请参考钉钉开放平台文档
directories.createMember('Dingtalk', member)
  .then(res => res.data, err => err.data);

directories.readMembers('Dingtalk')
  .then(res => res.data, err => err.data);
```

## 注意事项

- 全部代码使用ES6进行编写, 您可能需要`babel`或`--harmony`模式的协助
- 执行测试时请先行配置以下环境变量(见于test.sh)
  - `DINGTALK_CORP_ID` 钉钉授予的组织ID
  - `DINGTALK_CORP_SECRET` 钉钉授予的组织秘钥

## 参考资料

- [钉钉开放平台 - 人员管理](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.HzKfms&treeId=371&articleId=106816&docType=1)
