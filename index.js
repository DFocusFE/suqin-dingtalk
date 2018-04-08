const querystring = require('querystring');
const { Provider } = require('suqin');

const config = {
  baseUrl: 'https://oapi.dingtalk.com',
  name: 'Dingtalk',
};

module.exports = class Dingtalk extends Provider {
  /**
   * 构造函数
   * @param {Object} opts 更多配置项
   */
  constructor(opts = { baseUrl: config.baseUrl }) {
    super(opts);
    if (typeof opts.corpId !== 'string') throw Error('Params Error: opts.corpId must be a String.');
    if (typeof opts.corpSecret !== 'string') throw Error('Params Error: opts.corpSecret must be a String.');

    // 在suqin体系中的代号/名称/key
    this.name = opts.name || config.name;
    // API Host
    this._apiHost = opts.baseUrl || config.baseUrl;
    // 钉钉授予的组织ID
    this._corpId = opts.corpId;
    // 钉钉授予的组织秘钥
    this._corpSecret = opts.corpSecret;
    // 缓存token
    this._token = {
      value: null,
      expires: null,
    };
  }

  get token() {
    const token = this._token;
    if (!token.expires || token.expires < +new Date()) {
      return this.getToken();
    }
    return token.value;
  }

  set token(val) {
    this._token = val;
    return this._token;
  }

  /**
   * 获取Token
   */
  async getToken() {
    return this.fetch({
      method: 'get',
      url: `${this._apiHost}/gettoken?corpid=${this._corpId}&corpsecret=${this._corpSecret}`,
    })
      .then(res => {
        const token = res.data;
        const now = +new Date();
        this.token = {
          value: token.access_token,
          // 钉钉颁发的token有效期为7200秒
          // 提前 300秒 重新获取token
          expires: now + ((7200 - 300) * 1000),
        };
        return token.access_token;
      });
  }

  /**
   * 请求参数构造器
   * 将基础参数进行封装, 用于适配suqin.fetch()
   * @param {Object} opts 基础参数
   */
  async fetchConfGenerator(opts = {}) {
    return {
      method: opts.method ? opts.method.toLowerCase() : 'get',
      url: `${opts.url}?${querystring.stringify({
        access_token: await this.token,
        ...opts.query,
      })}`,
      headers: opts.headers || {},
      data: opts.data,
    };
  }

  /* eslint-disable class-methods-use-this */
  get readAPIs() {
    return {
      /**
       * 查询成员列表
       * @param {Object} opts 其余参数
       */
      async readMembers(opts = { department_id: 1 }) {
        return this.fetch(await this.fetchConfGenerator({
          url: `${this._apiHost}/user/list`,
          query: opts,
        }));
      },

      /**
       * 查询成员详情
       * @param {String} id   成员ID
       * @param {Object} opts 其余参数
       */
      async readMember(id, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          url: `${this._apiHost}/user/get`,
          query: { ...opts, userid: id },
        }));
      },

      /**
       * 查询群组列表
       * @param {String} id 父部门id
       * @param {Object} opts 其余参数
       */
      async readGroups(id, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          url: `${this._apiHost}/department/list`,
          query: { ...opts, id },
        }));
      },

      /**
       * 查询群组详情
       * @param {String} id 父部门id
       * @param {Object} opts 其余参数
       */
      async readGroup(id, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          url: `${this._apiHost}/department/get`,
          query: { ...opts, id },
        }));
      },

      // /**
      //  * 校验用户是否存在
      //  * @param {String} name 用户主邮箱 principalName
      //  * @param {String} pwd  用户密码
      //  * @return {Bolean} true: 存在, false: 不存在
      //  */
      // async verifiyMember(name, pwd) {
      //   const authUrl = `${this._authHost}/${this._tenlentId}/oauth2/token?api-version=1.0`;

      //   return this.fetch({
      //     method: 'post',
      //     url: authUrl,
      //     data: querystring.stringify({
      //       grant_type: 'password',
      //       resource: this._graphHost,
      //       client_id: this._clientId,
      //       username: name,
      //       password: pwd,
      //     }),
      //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   })
      //     .then(res => !!res.data.access_token);
      // },

    };
  }
  get writeAPIs() {
    return {
      /**
       * 创建成员
       * @param {Object} member 成员
       * @param {Object} opts   其余参数
       */
      async createMember(member, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          method: 'POST',
          url: `${this._apiHost}/user/create`,
          query: opts,
          data: member,
        }));
      },

      /**
       * 删除成员
       * @param {String} id   成员ID
       * @param {Object} opts 其余参数
       */
      async deleteMember(id, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          method: 'GET',
          url: `${this._apiHost}/user/delete`,
          query: { ...opts, userid: id },
        }));
      },

      /**
       * 修改成员
       * @param {String} id     成员ID
       * @param {Object} member 成员
       */
      async updateMember(id, member, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          method: 'POST',
          url: `${this._apiHost}/user/update`,
          query: opts,
          data: { ...member, userid: id },
        }));
      },

      /**
       * 创建群组
       * @param {Object} group 群组
       * @param {Object} opts  其余参数
       */
      async createGroup(group, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          method: 'POST',
          url: `${this._apiHost}/department/create`,
          query: opts,
          data: group,
        }));
      },

      /**
       * 删除群组
       * @param {String} id   群组ID
       * @param {Object} opts 其余参数
       */
      async deleteGroup(id, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          method: 'GET',
          url: `${this._apiHost}/department/delete`,
          query: { ...opts, id },
        }));
      },

      /**
       * 修改群组
       * @param {Object} id    群组ID
       * @param {Object} group 群组
       * @param {Object} opts  其余参数
       */
      async updateGroup(id, group, opts = {}) {
        return this.fetch(await this.fetchConfGenerator({
          method: 'POST',
          url: `${this._apiHost}/department/update`,
          query: opts,
          data: { ...group, id },
        }));
      },
    };
  }
  /* eslint-enable class-methods-use-this */
};
