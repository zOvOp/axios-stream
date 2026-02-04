# stream-axios

[English](./README.md) | [简体中文](./README.zh-CN.md)

A wrapper library based on axios that retains the original configuration capabilities while providing out-of-the-box streaming request interfaces to improve development efficiency.

## Features

- 🚀 **Fully Compatible**: Based on axios, retaining all features like interceptors and configurations.
- 🌊 **Streaming Support**: Built-in `stream` method to easily handle streaming responses (e.g., LLM typewriter effect).
- 🛠 **Out of the Box**: Provides a default instance and supports creating custom instances.
- 📦 **SSE Helper**: Built-in SSE parsing tool for easy handling of Server-Sent Events.

## Installation

```bash
npm install stream-axios
```

## Usage Guide

### 1. Basic Request (Same as axios)

```javascript
import { createInstance } from "stream-axios";

const request = createInstance();

// GET request
request
  .get("/user?ID=12345")
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

// POST request
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

### 2. Streaming Request

Suitable for scenarios like receiving large files or AI conversation streams. The `stream` method returns a **cancel function** that you can call to abort the request.

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
    // Received data chunk
    console.log("Received chunk:", chunk);
  },
  () => {
    // Stream completed
    console.log("Stream completed");
  },
  (error) => {
    // Error occurred
    console.error("Stream error:", error);
  },
);

// Cancel the stream manually when needed
cancel();
```

**Optional: use `AbortSignal`** to cancel from outside (e.g. React cleanup):

```javascript
const controller = new AbortController();
await request.stream(
  { url: "/api/chat", signal: controller.signal },
  onChunk,
  onComplete,
  onError,
);
// controller.abort(); // cancels the request
```

### 3. Custom Instance

`createInstance` merges your config with the default (timeout 15s, `Content-Type: application/json;charset=utf-8`). Override as needed:

```javascript
import { createInstance } from "stream-axios";

const myRequest = createInstance({
  baseURL: "https://api.mydomain.com",
  timeout: 5000,
});

// Add custom interceptor
myRequest.interceptors.request.use((config) => {
  config.headers["Authorization"] = "Bearer token";
  return config;
});
```

### 4. Attach Stream to Existing Axios Instance

If you already have an axios instance, use `attachStream` to add the `stream` method without creating a new instance:

```javascript
import axios from "axios";
import { attachStream } from "stream-axios";

const instance = axios.create({ baseURL: "https://api.example.com" });
attachStream(instance);

// instance.stream() is now available
const cancel = await instance.stream({ url: "/api/stream" }, onChunk, onComplete, onError);
```

### 5. Helper Functions

#### `createSSEParser` (stateful, handles split chunks)

Use for robust SSE parsing when chunks may be split across reads. Callback receives the full event object:

```javascript
import { createInstance, createSSEParser } from "stream-axios";

const request = createInstance();

const parser = createSSEParser((event) => {
  // event: { event?: string, data?: string, id?: string, retry?: number }
  if (event.data) {
    console.log("SSE Data:", event.data);
  }
});

await request.stream(
  { url: "/api/sse-stream" },
  (chunk) => parser(chunk),
);
```

#### `parseSSEChunk` (stateless, full chunks only)

Use when you have a complete SSE text chunk and only need the data content. Callback receives each message's data string:

```javascript
import { parseSSEChunk } from "stream-axios";

const sseText = "data: hello\n\ndata: world\n\n";
parseSSEChunk(sseText, (data) => {
  console.log("Message:", data); // "hello", then "world"
});
```
## License

MIT

## Acknowledgement

This project is based on [Axios](https://github.com/axios/axios).
