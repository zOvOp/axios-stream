# 指南

## 安装

```bash
npm install stream-axios
```

## TypeScript 支持

本项目使用 TypeScript 编写，包含完整的类型定义。你可以直接导入类型：

```typescript
import { createInstance, StreamOptions } from "stream-axios";

const request = createInstance();
// ...
```

## 使用指南

### 基础请求

```javascript
import { createInstance } from "stream-axios";

const request = createInstance();

// GET 请求
request
  .get("/user?ID=12345")
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// POST 请求
request
  .post("/user", {
    firstName: "Fred",
    lastName: "Flintstone",
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

### 流式请求

适用于接收大文件或 AI 对话流等场景。`stream` 方法会返回一个**取消函数**，调用即可中止请求。

```javascript
import { createInstance } from "stream-axios";

const request = createInstance();

const cancel = await request.stream(
  {
    url: "/api/chat",
    method: "POST",
    data: { message: "Hello" },
  },
  (chunk) => {
    // 收到数据片段
    console.log("Received chunk:", chunk);
  },
  () => {
    // 请求完成
    console.log("Stream completed");
  },
  (error) => {
    // 发生错误
    console.error("Stream error:", error);
  },
);

// 需要时手动取消流
cancel();
```

**可选：使用 `AbortSignal`** 从外部取消（例如 React 清理时）：

```javascript
import { createInstance } from "stream-axios";

const request = createInstance();
const controller = new AbortController();
await request.stream(
  { url: "/api/chat", signal: controller.signal },
  onChunk,
  onComplete,
  onError,
);
// controller.abort(); // 取消请求
```

### 重试机制

支持配置失败自动重试（例如应对网络波动）：

```javascript
import { createInstance } from "stream-axios";

const request = createInstance();
await request.stream(
  {
    url: "/api/chat",
    retry: 3, // 失败后最多重试 3 次
    retryDelay: 2000, // 每次重试间隔 2000ms (默认 1000ms)
  },
  onChunk,
  onComplete,
  onError,
);
```

### 自定义实例

`createInstance` 会将你的配置与默认配置（超时 15 秒、`Content-Type: application/json;charset=utf-8`）合并，可按需覆盖：

```javascript
import { createInstance } from "stream-axios";

const myRequest = createInstance({
  baseURL: "https://api.mydomain.com",
  timeout: 5000,
});

// 添加自定义拦截器
myRequest.interceptors.request.use((config) => {
  config.headers["Authorization"] = "Bearer token";
  return config;
});
```

### 挂载 Stream

若已有 axios 实例，可用 `attachStream` 为其添加 `stream` 方法，无需新建实例：

```javascript
import axios from "axios";
import { attachStream } from "stream-axios";

const instance = axios.create({ baseURL: "https://api.example.com" });
attachStream(instance);

// instance.stream() 现已可用
const cancel = await instance.stream(
  { url: "/api/stream" },
  onChunk,
  onComplete,
  onError,
);
```

### 辅助函数

#### `createSSEParser`（有状态，可处理分片）

当 SSE 数据可能被拆成多段时，用此解析器更稳妥。回调会收到完整事件对象：

```javascript
import { createInstance, createSSEParser } from "stream-axios";

const request = createInstance();

const parser = createSSEParser((event) => {
  // event: { event?: string, data?: string, id?: string, retry?: number }
  if (event.data) {
    console.log("SSE Data:", event.data);
  }
});

await request.stream({ url: "/api/sse-stream" }, (chunk) => parser(chunk));
```

#### `parseSSEChunk`（无状态，仅完整块）

当已有完整的一段 SSE 文本且只需取出 data 内容时使用。回调仅接收每条消息的 data 字符串：

```javascript
import { parseSSEChunk } from "stream-axios";

const sseText = "data: hello\n\ndata: world\n\n";
parseSSEChunk(sseText, (data) => {
  console.log("Message:", data); // "hello", 然后 "world"
});
```
