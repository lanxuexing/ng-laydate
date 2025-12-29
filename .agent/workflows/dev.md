---
description: Start the local development server
---

To start developing and see changes in real-time:

1. Run the demo application:
```bash
npm run demo
```
The demo application is configured to use the library source code directly via `tsconfig` paths, so changes to the library will trigger a reload.

2. (Optional) For continuous library type-checking and background building:
```bash
npm run watch:lib
```
