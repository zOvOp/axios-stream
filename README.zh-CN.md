# axios-stream

[English](./README.md) | [简体中文](./README.zh-CN.md)

这是一个基于 axios 的二次封装库，保留了 axios 的原始配置能力，并提供了开箱即用的流式请求（Streaming）接口，旨在提升开发效率。

## 特性

- 🚀 **完全兼容**：基于 axios，保留原有拦截器、配置项等所有特性。
- 🌊 **流式支持**：内置 `stream` 方法，轻松处理流式响应（如 LLM 打字机效果）。
- 🛠 **开箱即用**：提供默认实例，也支持创建自定义实例。
- 📦 **SSE 助手**：内置 SSE 解析工具，方便处理 Server-Sent Events。

## 安装

```bash
npm install axios-stream
```

## 使用指南

### 1. 基础请求 (同 axios)

```javascript
import request from 'axios-stream';

// GET 请求
request.get('/user?ID=12345')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// POST 请求
request.post('/user', {
    firstName: 'Fred',
    lastName: 'Flintstone'
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

### 2. 流式请求 (Streaming)

适用于接收大文件或 AI 对话流等场景。

```javascript
import request from 'axios-stream';

const cancel = request.stream(
  {
    url: '/api/chat',
    method: 'POST',
    data: { message: 'Hello' }
  },
  (chunk) => {
    // 收到数据片段
    console.log('Received chunk:', chunk);
  },
  () => {
    // 请求完成
    console.log('Stream completed');
  },
  (error) => {
    // 发生错误
    console.error('Stream error:', error);
  }
);

// 如果需要取消请求
// cancel();
```

### 3. 自定义实例

如果你需要独立的配置或拦截器：

```javascript
import { createInstance } from 'axios-stream';

const myRequest = createInstance({
  baseURL: 'https://api.mydomain.com',
  timeout: 5000
});

// 添加自定义拦截器
myRequest.interceptors.request.use(config => {
  config.headers['Authorization'] = 'Bearer token';
  return config;
});

// 使用流式方法
myRequest.stream({ url: '/stream' }, (chunk) => console.log(chunk));
```

### 4. SSE 解析助手

如果你处理的是 SSE (Server-Sent Events) 格式的数据：

```javascript
import request, { parseSSEChunk } from 'axios-stream';

request.stream(
  { url: '/sse-endpoint', method: 'GET' },
  (chunk) => {
    // 解析 SSE 数据
    parseSSEChunk(chunk, (content) => {
      console.log('SSE Message:', content);
    });
  }
);
```

### 5. 使用现有的 Axios 实例

如果你项目中已经有了配置好的 axios 实例，你可以将 stream 方法挂载到该实例上：

```javascript
import axios from 'axios';
import { attachStream } from 'axios-stream';

// 你现有的 axios 实例
const myAxios = axios.create({
  baseURL: 'https://api.myproject.com',
  headers: { 'X-Custom-Header': 'foobar' }
});

// 挂载 stream 方法
attachStream(myAxios);

// 现在你可以在实例上使用 .stream() 方法了
myAxios.stream({ url: '/chat' }, (chunk) => {
  console.log(chunk);
});
```

## License

MIT

## 致谢

本项目基于 [Axios](https://github.com/axios/axios) 开发。
