---
description: Release a new version via CI/CD tags
---

To release a new version of ng-laydate:

1. Update the version in `projects/ng-laydate/package.json`.

2. Push your code changes to the `main` branch.

3. Create and push a tag:

**For a Stable Release:**
```bash
git tag v1.x.x
git push origin v1.x.x
```
This publishes to npm as `latest`.

**For a Beta/Test Release:**
```bash
git tag beta-x.x.x
git push origin beta-x.x.x
```
This publishes to npm as `beta`.

Refer to [CI-CD.md](file:///Users/apple/Downloads/laydate-next-main/ng-laydate/CI-CD.md) for more details.
