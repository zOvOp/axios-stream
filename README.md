# axios-stream

[English](./README.md) | [简体中文](./README.zh-CN.md)

A wrapper library based on axios that retains the original configuration capabilities while providing out-of-the-box streaming request interfaces to improve development efficiency.

## Features

- 🚀 **Fully Compatible**: Based on axios, retaining all features like interceptors and configurations.
- 🌊 **Streaming Support**: Built-in `stream` method to easily handle streaming responses (e.g., LLM typewriter effect).
- 🛠 **Out of the Box**: Provides a default instance and supports creating custom instances.
- 📦 **SSE Helper**: Built-in SSE parsing tool for easy handling of Server-Sent Events.

## Installation

```bash
npm install axios-stream
```

## Usage Guide

### 1. Basic Request (Same as axios)

```javascript
import request from "axios-stream";

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

Suitable for scenarios like receiving large files or AI conversation streams.

```javascript
import request from "axios-stream";

const cancel = request.stream(
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

// If you need to cancel the request
// cancel();
```

### 3. Custom Instance

If you need independent configuration or interceptors:

```javascript
import { createInstance } from "axios-stream";

const myRequest = createInstance({
  baseURL: "https://api.mydomain.com",
  timeout: 5000,
});

// Add custom interceptor
myRequest.interceptors.request.use((config) => {
  config.headers["Authorization"] = "Bearer token";
  return config;
});

// Use stream method
myRequest.stream({ url: "/stream" }, (chunk) => console.log(chunk));
```

### 4. SSE Parsing Helper

If you are handling SSE (Server-Sent Events) format data:

```javascript
import request, { parseSSEChunk } from "axios-stream";

request.stream({ url: "/sse-endpoint", method: "GET" }, (chunk) => {
  // Parse SSE data
  parseSSEChunk(chunk, (content) => {
    console.log("SSE Message:", content);
  });
});
```

### 5. Use with Existing Axios Instance

If you already have a configured axios instance in your project, you can attach the stream method to it:

```javascript
import axios from "axios";
import { attachStream } from "axios-stream";

// Your existing axios instance
const myAxios = axios.create({
  baseURL: "https://api.myproject.com",
  headers: { "X-Custom-Header": "foobar" },
});

// Attach stream method
attachStream(myAxios);

// Now you can use .stream() on your instance
myAxios.stream({ url: "/chat" }, (chunk) => {
  console.log(chunk);
});
```

## License

MIT

## Acknowledgement

This project is based on [Axios](https://github.com/axios/axios).
