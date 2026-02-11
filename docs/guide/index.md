# Guide

## Installation

```bash
npm install stream-axios
```

## TypeScript Support

This library is written in TypeScript and includes complete type definitions. You can import types directly:

```typescript
import { createInstance, StreamOptions } from "stream-axios";

const request = createInstance();
// ...
```

## Usage Guide

### Basic Request

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

### Streaming Request

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
import { createInstance } from "stream-axios";

const request = createInstance();
const controller = new AbortController();
await request.stream(
  { url: "/api/chat", signal: controller.signal },
  onChunk,
  onComplete,
  onError,
);
// controller.abort(); // cancels the request
```

### Retry Mechanism

You can configure automatic retries for failed requests (e.g. network errors):

```javascript
import { createInstance } from "stream-axios";

const request = createInstance();
await request.stream(
  {
    url: "/api/chat",
    retry: 3, // Retry up to 3 times on failure
    retryDelay: 2000, // Wait 2s between retries (default: 1000ms)
  },
  onChunk,
  onComplete,
  onError,
);
```

### Custom Instance

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

### 5. Attach Stream to Existing Axios Instance

If you already have an axios instance, use `attachStream` to add the `stream` method without creating a new instance:

```javascript
import axios from "axios";
import { attachStream } from "stream-axios";

const instance = axios.create({ baseURL: "https://api.example.com" });
attachStream(instance);

// instance.stream() is now available
const cancel = await instance.stream(
  { url: "/api/stream" },
  onChunk,
  onComplete,
  onError,
);
```

### Helper Functions

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

await request.stream({ url: "/api/sse-stream" }, (chunk) => parser(chunk));
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
