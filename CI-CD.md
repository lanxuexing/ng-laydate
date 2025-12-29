---

## Table of Contents
- [English Guide](#english)
  - [Actions & Triggers](#en-triggers)
  - [How to Setup](#en-setup)
- [中文手册](#chinese)
  - [Actions 与触发器](#zh-triggers)
  - [如何配置](#zh-setup)

---

<a name="english"></a>
## English Guide

This project uses GitHub Actions for automated building, deployment (demo), and publishing (npm).

<a name="en-triggers"></a>
### 1. Actions & Triggers
Every `push` to the `main` branch or `pull_request` triggers:
- Dependency installation (`npm ci`)
- Library build (`npm build:lib`)
- Demo build (`npm build:demo`)
*This ensures that any change doesn't break the build.*

### 2. Demo Deployment
Every successful `push` to the `main` branch automatically:
- Builds the demo application.
- Deploys it to the `gh-pages` branch.
- Updates your live demo on GitHub Pages.

### 3. Publishing to NPM (Dual Channels)

We support two release channels via GitHub Tags:

#### A. Stable Release (`latest`)
- **Trigger**: Push a tag starting with `v` (e.g., `v1.0.0`, `v2.1.3`).
- **Effect**:
    - Creates a standard GitHub Release with auto-generated notes.
    - Publishes to npm with the `latest` tag (`npm install ng-laydate`).

#### B. Test/Beta Release (`beta`)
- **Trigger**: Push a tag starting with `beta-` (e.g., `beta-0.1.0`, `beta-bugfix`).
- **Effect**:
    - Creates a GitHub Release marked as **"Pre-release"**.
    - Publishes to npm with the `beta` tag (`npm install ng-laydate@beta`).
- **Provenance**: Includes a signed attestation for maximum security.

### How to Release
1. Update the version in `projects/ng-laydate/package.json`.
2. Commit and push your changes to `main`.
3. Create and push a tag:
   ```bash
   # For Stable
   git tag v1.0.0
   git push origin v1.0.0

   # For Beta/Test
   git tag beta-1.0.0
   git push origin beta-1.0.0
   ```

<a name="en-setup"></a>
### 2. Setting up Trusted Publishing (One-time)

NPM now supports **Trusted Publishing** via OIDC, which is more secure than using static tokens.

1. **Configure NPM**:
   - Go to [npmjs.com](https://www.npmjs.com/) -> **Integrations** (or Package Settings -> Publishing).
   - Select **GitHub Actions**.
   - Fill in the details:
     - **GitHub Organization/User**: `lanxuexing`
     - **GitHub Repository**: `ng-laydate`
     - **Workflow Name**: `ci-cd.yml` (or the name in `ci-cd.yml`)
2. **Check Permissions**:
   - In GitHub Settings -> **Actions** -> **General**, ensure "Workflow permissions" is set to "Read and write permissions".
3. **No Secret Needed**: 
   - You don't need to add `NPM_TOKEN` anymore! The workflow uses short-lived OIDC tokens.

---

<a name="chinese"></a>
## 中文手册

项目使用 GitHub Actions 实现了自动化的构建、演示页部署以及 npm 发布。

<a name="zh-triggers"></a>
### 1. Actions 与触发器
每次提交到 `main` 分支或提交 `pull_request` 都会触发：
- 依赖安装 (`npm ci`)
- 类库构建 (`npm build:lib`)
- 演示页构建 (`npm build:demo`)
*确保代码变更不会破坏构建。*

### 2. 演示页部署
每次成功合并/提交到 `main` 分支后，会自动：
- 构建 `laydate-demo`。
- 部署到 `gh-pages` 分支。
- 更新 GitHub Pages 上的在线演示地址。

### 3. 发布到 NPM (双渠道)

我们通过 GitHub Tag 支持两种发布渠道：

#### A. 正式版本 (`latest`)
- **触发条件**: 推送以 `v` 开头的标签 (例如 `v1.0.0`, `v2.1.3`)。
- **效果**:
    - 在 GitHub 上创建一个正式的 Release，并自动生成发行日志。
    - 发布到 npm 并标记为 `latest` (`npm install ng-laydate`)。

#### B. 测试版本 (`beta`)
- **触发条件**: 推送以 `beta-` 开头的标签 (例如 `beta-0.1.0`, `beta-fix`)。
- **效果**:
    - 在 GitHub 上创建一个标记为 **"Pre-release" (预发布)** 的 Release。
    - 发布到 npm 并标记为 `beta` (`npm install ng-laydate@beta`)。

### 如何发布
1. 修改 `projects/ng-laydate/package.json` 中的 `version` 字段。
2. 提交并推送代码到 `main` 分支。
3. 创建并推送标签：
   ```bash
   # 发布正式版
   git tag v1.0.0
   git push origin v1.0.0

   # 发布测试版
   git tag beta-1.0.0
   git push origin beta-1.0.0
   ```

<a name="zh-setup"></a>
### 2. 如何配置 Trusted Publishing (仅需一次)

NPM 现在通过 OIDC 支持 **Trusted Publishing**，这比使用静态 Token 更安全。

1. **NPM 端配置**:
   - 登录 [npmjs.com](https://www.npmjs.com/) -> **Integrations** (或进入包设置 -> Publishing)。
   - 选择 **GitHub Actions**。
   - 填写以下信息：
     - **GitHub Organization/User**: `lanxuexing`
     - **GitHub Repository**: `ng-laydate`
     - **Workflow Name**: `ci-cd.yml` (或 `ci-cd.yml` 中定义的 name)
2. **检查 GitHub 权限**:
   - 在 GitHub 仓库 Settings -> **Actions** -> **General** 中，确保 "Workflow permissions" 设置为 "Read and write permissions"。
3. **无需 Secret**:
   - 您**不再需要**添加 `NPM_TOKEN`！工作流会自动获取临时的 OIDC Token 进行发布。
