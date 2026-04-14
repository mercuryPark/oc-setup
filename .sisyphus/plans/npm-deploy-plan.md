# opencode-setup npm 배포工作计划

## TL;DR

> **目标**: 将 `opencode-setup` 发布到 npm，使其可以通过 `npm install -g opencode-setup` 或 `npx opencode-setup` 安装使用。
> 
> **交付物**:
> - 通过 npm 安装的 CLI 工具
> - OpenCode 插件集成
> - 完整的测试覆盖
> - CHANGELOG 文档
> 
> **估计工时**: 短 (~2-3小时)
> **并行执行**: 部分可并行 (测试文件)
> **关键路径**: 测试 → 验证 → 发布

---

## 背景

### 当前状态 (2026-04-14)
- Git: clean (commit 6b13d6d)
- Build: ✅ 成功
- Lint: ✅ 通过 (无错误)
- Tests: ❌ 无
- package.json: npm 发布配置完成

### npm 发布最佳实践要求
1. **测试覆盖** - 质量保证和可靠性
2. **Dry-run 验证** - 确认只发布预期文件
3. **CLI 手动测试** - 确保实际可用
4. **CHANGELOG** - 变更追踪
5. **语义化版本** - 0.1.0 (初始版本)

---

## 工作目标

### 核心目标
将 `opencode-setup` 成功发布到 npm 注册表

### 具体交付物
- `dist/` 目录包含所有构建产物
- `templates/` 目录正确打包
- npm 包可安装并正常运行
- 测试套件覆盖核心模块

### 定义完成
- [ ] `bun test` 所有测试通过
- [ ] `npx opencode-setup doctor` 正常运行
- [ ] `npx opencode-setup preset list` 正常运行
- [ ] `npm pack --dry-run` 显示正确文件
- [ ] npm 包发布成功

### 必须有
- 核心模块测试 (config-generator, preset, validator)
- CLI 功能测试
- 正确的包内容验证

### 必须没有 (Guardrails)
- 禁止发布未测试的代码
- 禁止发布失败的构建
- 禁止发布敏感信息

---

## 验证策略

### 测试决策
- **基础设施**: Bun test (内置)
- **自动化测试**: Tests-after (先实现后测试)
- **框架**: bun test
- **Agent-Executed QA**: 必须 (所有任务)

### QA 政策
每个任务必须包含 agent-executed QA 场景
- **Frontend/UI**: Playwright (如需要)
- **CLI/TUI**: interactive_bash (tmux) - 运行命令，验证输出
- **API/Backend**: Bash (curl)
- **Library/Module**: Bash (bun/node REPL) - 导入模块，验证输出

---

## 执行策略

### 并行执行 Waves

```
Wave 1 (立即开始 - 基础):
├── Task 1: 测试 config-generator 模块
├── Task 2: 测试 preset registry 模块
├── Task 3: 测试 validator 模块
└── Task 4: 测试 doctor checks 模块

Wave 2 (Wave 1 后 - 集成):
├── Task 5: 运行全部测试
└── Task 6: CLI 手动测试 (doctor, preset list, validate)

Wave 3 (Wave 2 后 - 准备发布):
├── Task 7: 创建 CHANGELOG.md
└── Task 8: 提交并打标签

Wave FINAL (发布):
├── Task 9: npm publish
└── Task 10: 验证 npm 安装
```

### 依赖矩阵
- **1-4**: 无依赖，可并行
- **5**: 1-4 全部完成
- **6**: 5 完成
- **7-8**: 6 完成
- **9**: 7-8 完成

### Agent 调度
- **Wave 1**: 4个任务 → `unspecified-high` (4并行)
- **Wave 2**: 2个任务 → `unspecified-high`
- **Wave 3**: 2个任务 → `quick`
- **Wave FINAL**: 2个任务 → `quick`

---

## TODOs

- [ ] 1. 测试 config-generator 模块

  **What to do**:
  - 创建 `test/core/config-generator.test.ts`
  - 测试 `generateGlobalConfig()` 函数
  - 测试 `generateProjectConfig()` 函数
  - 测试各种 preset 组合
  - 测试错误处理

  **Must NOT do**:
  - 不要修改 src/ 源码
  - 不要创建需要网络请求的测试

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > - Reason: 测试代码模式简单，函数式验证
  > **Skills**: []
  > - 不需要特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `src/core/config-generator.ts:1-150` - 需要测试的函数签名
  - `src/types/opencode-config.ts` - 类型定义参考
  - `templates/configs/*.json` - 预期的配置文件格式

  **Acceptance Criteria**:
  - [ ] `test/core/config-generator.test.ts` 文件存在
  - [ ] 测试文件包含至少 5 个测试用例
  - [ ] `bun test test/core/config-generator.test.ts` → PASS

  **QA Scenarios**:

  ```
  Scenario: 运行 config-generator 测试
    Tool: Bash
    Preconditions: 在项目根目录
    Steps:
      1. Run `bun test test/core/config-generator.test.ts`
    Expected Result: 所有测试通过，显示 "X passed"
    Failure Indicators: "X failed" 或错误消息
    Evidence: .sisyphus/evidence/task-1-test-result.txt
  ```

  **Commit**: YES (group with 1-4)
  - Message: `test: add unit tests for core modules`
  - Files: `test/`
  - Pre-commit: `bun test`

---

- [ ] 2. 测试 preset registry 模块

  **What to do**:
  - 创建 `test/preset/registry.test.ts`
  - 测试 `listPresets()` 函数
  - 测试 preset 加载逻辑
  - 测试 preset 应用函数

  **Must NOT do**:
  - 不要修改 src/ 源码
  - 不要测试不存在的函数

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > - Reason: 测试代码模式简单
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `src/preset/registry.ts` - 需要测试的函数
  - `templates/configs/*.json` - preset 配置

  **Acceptance Criteria**:
  - [ ] `test/preset/registry.test.ts` 文件存在
  - [ ] `bun test test/preset/registry.test.ts` → PASS

  **QA Scenarios**:

  ```
  Scenario: 运行 preset registry 测试
    Tool: Bash
    Preconditions: 在项目根目录
    Steps:
      1. Run `bun test test/preset/registry.test.ts`
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-2-test-result.txt
  ```

  **Commit**: YES (group with 1-4)

---

- [ ] 3. 测试 validator 模块

  **What to do**:
  - 创建 `test/validator/config-validator.test.ts`
  - 测试 `validateOpenCodeConfig()` 函数
  - 测试错误情况处理

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 5

  **References**:
  - `src/validator/config-validator.ts`

  **Acceptance Criteria**:
  - [ ] `test/validator/config-validator.test.ts` 存在
  - [ ] `bun test test/validator/config-validator.test.ts` → PASS

  **QA Scenarios**:

  ```
  Scenario: 运行 validator 测试
    Tool: Bash
    Steps:
      1. Run `bun test test/validator/config-validator.test.ts`
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-3-test-result.txt
  ```

  **Commit**: YES (group with 1-4)

---

- [ ] 4. 测试 doctor checks 模块

  **What to do**:
  - 创建 `test/doctor/checks.test.ts`
  - 测试 `runAllChecks()` 函数 (mock 文件系统)
  - 测试检查项的逻辑

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 5

  **References**:
  - `src/doctor/checks.ts`
  - `src/doctor/reporter.ts`

  **Acceptance Criteria**:
  - [ ] `test/doctor/checks.test.ts` 存在
  - [ ] `bun test test/doctor/checks.test.ts` → PASS

  **QA Scenarios**:

  ```
  Scenario: 运行 doctor checks 测试
    Tool: Bash
    Steps:
      1. Run `bun test test/doctor/checks.test.ts`
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-4-test-result.txt
  ```

  **Commit**: YES (group with 1-4)

---

- [ ] 5. 运行全部测试

  **What to do**:
  - 执行 `bun test` 运行所有测试
  - 确认所有测试通过
  - 如有失败，修复问题

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 6, 7
  - **Blocked By**: Tasks 1-4

  **References**:
  - `test/` 目录所有测试文件

  **Acceptance Criteria**:
  - [ ] `bun test` → 所有测试通过 (0 failures)

  **QA Scenarios**:

  ```
  Scenario: 运行完整测试套件
    Tool: Bash
    Steps:
      1. Run `bun test`
      2. Verify output shows "X passed" with 0 failures
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-5-full-test.txt
  ```

  **Commit**: NO (与 1-4 一起)

---

- [ ] 6. CLI 手动测试

  **What to do**:
  - 测试 `bun run dev doctor` 命令
  - 测试 `bun run dev preset list` 命令
  - 测试 `bun run dev validate` 命令
  - 验证输出符合预期

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 7, 8
  - **Blocked By**: Task 5

  **References**:
  - `src/cli.ts` - CLI 命令定义

  **Acceptance Criteria**:
  - [ ] `bun run dev doctor` → 输出诊断结果
  - [ ] `bun run dev preset list` → 输出 preset 列表
  - [ ] `bun run dev validate` → 输出验证结果

  **QA Scenarios**:

  ```
  Scenario: 测试 doctor 命令
    Tool: interactive_bash
    Preconditions: 在项目根目录
    Steps:
      1. Run `bun run dev doctor`
      2. Verify output contains diagnostic information
    Expected Result: 命令成功执行，输出诊断结果
    Evidence: .sisyphus/evidence/task-6-doctor.txt

  Scenario: 测试 preset list 命令
    Tool: interactive_bash
    Steps:
      1. Run `bun run dev preset list`
      2. Verify output shows preset list
    Expected Result: 显示可用 preset 列表
    Evidence: .sisyphus/evidence/task-6-preset-list.txt

  Scenario: 测试 validate 命令
    Tool: interactive_bash
    Steps:
      1. Run `bun run dev validate`
      2. Verify output shows validation result
    Expected Result: 显示验证结果
    Evidence: .sisyphus/evidence/task-6-validate.txt
  ```

  **Commit**: NO

---

- [ ] 7. 创建 CHANGELOG.md

  **What to do**:
  - 创建 `CHANGELOG.md` 文件
  - 添加 v0.1.0 版本说明
  - 包含功能列表、bug 修复等

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 6

  **References**:
  - `git log --oneline` - 提交历史
  - `README.md` - 功能列表

  **Acceptance Criteria**:
  - [ ] `CHANGELOG.md` 文件存在
  - [ ] 包含 v0.1.0 版本信息
  - [ ] 包含关键变更列表

  **QA Scenarios**:

  ```
  Scenario: 验证 CHANGELOG.md 内容
    Tool: Bash
    Steps:
      1. Read `CHANGELOG.md`
      2. Verify it contains version 0.1.0
    Expected Result: 文件包含正确的 changelog 内容
    Evidence: .sisyphus/evidence/task-7-changelog.txt
  ```

  **Commit**: YES (with Task 8)
  - Message: `docs: add CHANGELOG for v0.1.0`
  - Files: `CHANGELOG.md`

---

- [ ] 8. 提交并打标签

  **What to do**:
  - 创建 git commit (包含测试和 CHANGELOG)
  - 创建 git tag `v0.1.0`
  - 推送 commit 和 tag

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 6

  **Acceptance Criteria**:
  - [ ] `git log --oneline` 显示新 commit
  - [ ] `git tag -l` 显示 `v0.1.0`
  - [ ] `git push origin master && git push origin v0.1.0` 成功

  **QA Scenarios**:

  ```
  Scenario: 验证 git tag
    Tool: Bash
    Steps:
      1. Run `git tag -l`
      2. Verify `v0.1.0` exists
    Expected Result: tag 存在
    Evidence: .sisyphus/evidence/task-8-tag.txt
  ```

  **Commit**: NO (已是 commit)

---

- [ ] 9. npm publish

  **What to do**:
  - 运行 `npm publish --dry-run` 验证
  - 运行 `npm publish` 实际发布
  - 验证发布成功

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Tasks 7, 8

  **References**:
  - `package.json` - 发布配置

  **Acceptance Criteria**:
  - [ ] `npm publish --dry-run` 显示正确文件
  - [ ] `npm publish` 成功
  - [ ] `npm view opencode-setup` 显示包信息

  **QA Scenarios**:

  ```
  Scenario: Dry-run 验证
    Tool: Bash
    Preconditions: npm 已登录
    Steps:
      1. Run `npm publish --dry-run`
      2. Verify output includes dist/, templates/, README.md
    Expected Result: 显示正确的发布文件列表
    Evidence: .sisyphus/evidence/task-9-dry-run.txt

  Scenario: 实际发布
    Tool: Bash
    Steps:
      1. Run `npm publish`
      2. Verify output shows "+ opencode-setup@0.1.0"
    Expected Result: 发布成功
    Evidence: .sisyphus/evidence/task-9-publish.txt
  ```

  **Commit**: NO

---

- [ ] 10. 验证 npm 安装

  **What to do**:
  - 在临时目录验证 `npx opencode-setup doctor`
  - 确认包可正常安装和运行

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Task 9

  **Acceptance Criteria**:
  - [ ] `npx opencode-setup doctor` 在新目录可运行
  - [ ] `npm view opencode-setup` 显示正确信息

  **QA Scenarios**:

  ```
  Scenario: 验证 npm 包安装
    Tool: Bash
    Steps:
      1. Run `npm view opencode-setup`
      2. Verify package info displayed
    Expected Result: 显示包信息
    Evidence: .sisyphus/evidence/task-10-npm-verify.txt
  ```

  **Commit**: NO

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  读取计划文件，验证每项任务完成
  Output: `Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Build Quality Review** — `unspecified-high`
  运行 `bun run build && bun test`
  Output: `Build [PASS/FAIL] | Tests [N/N pass]`

- [ ] F3. **CLI Functional Test** — `unspecified-high`
  测试所有 CLI 命令
  Output: `Commands [N/N] | VERDICT`

- [ ] F4. **npm Publish Verification** — `quick`
  确认包在 npm 注册表中可见
  Output: `npm view [PASS/FAIL]`

---

## Commit 策略

- **Wave 1**: `test: add unit tests for core modules` - test/*
- **Wave 3**: `docs: add CHANGELOG for v0.1.0` - CHANGELOG.md

---

## 成功标准

### 验证命令
```bash
bun test              # 预期: 所有测试通过
npm pack --dry-run    # 预期: 显示 dist/, templates/, README.md
npm publish           # 预期: + opencode-setup@0.1.0
npm view opencode-setup  # 预期: 显示包信息
```

### 最终检查清单
- [ ] 所有测试通过
- [ ] 所有 CLI 命令正常工作
- [ ] CHANGELOG.md 已创建
- [ ] Git tag v0.1.0 已推送
- [ ] npm 包已发布
- [ ] 包可正常安装使用

---

## Plan 完成后的操作

计划保存到: `.sisyphus/plans/npm-deploy-plan.md`

要开始执行，请运行:
```
/start-work npm-deploy-plan
```

这将:
1. 注册计划为当前活动 boulder
2. 跨会话跟踪进度
3. 如有中断可自动继续
