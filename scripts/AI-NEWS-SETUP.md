# AI新闻定时推送配置

## ✅ 已完成的任务

### 1. 飞书配置检查
- **状态**: ✓ 正常
- **权限**: 已授予消息发送权限 (`im:message`, `im:message:send_as_bot`)
- **总权限数**: 186项

### 2. 定时任务脚本
- **位置**: `scripts/ai-news-push.ps1`
- **功能**: 每天自动搜索并推送AI新闻到飞书
- **搜索方向**:
  - 🎵 音乐+AI
  - 🛠️ 产品经理AI工具
  - 🚀 AI大事件
  - 📊 运营+AI
  - 💡 AI应用场景

### 3. Windows定时任务
- **任务名称**: `AI-Daily-News-Push`
- **执行时间**: 每天 16:00 (北京时间)
- **状态**: Ready (就绪)
- **下次运行**: 今日 16:00

## ⚙️ 需要补充的配置

### 1. 飞书目标聊天ID（必须）

**当前设置**: `openclaw` - 需要获取实际的chat_id

**如何获取正确的聊天ID**:
1. 打开飞书，进入目标聊天（个人/群聊）
2. 从浏览器地址栏获取 chat ID，格式如：`oc_xxxxxxxx` 或 `oc_1862884871429189634`
3. 或者在飞书开放平台查看机器人绑定的聊天

**设置方法**（二选一）：

方法A - 环境变量:
```powershell
[Environment]::SetEnvironmentVariable("FEISHU_AI_NEWS_CHAT", "oc_xxxxxx", "User")
```

方法B - 重新创建任务（带参数）:
```powershell
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$env:USERPROFILE\.openclaw\workspace\scripts\ai-news-push.ps1`" -TargetChat `"oc_xxxxxx`""
Set-ScheduledTask -TaskName "AI-Daily-News-Push" -Action $Action
```

### 2. Brave Search API Key（可选，用于实时新闻）
```powershell
openclaw configure --section web
# 然后输入你的Brave Search API Key
```
获取API Key: https://api.search.brave.com/app/dashboard

**注意**: 如果不配置API Key，脚本仍会推送消息，但内容是模板形式的提示信息。

## 🧪 手动测试

立即测试脚本:
```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\.openclaw\workspace\scripts\ai-news-push.ps1" -TargetChat "你的聊天ID"
```

## 📝 管理任务

查看任务:
```powershell
Get-ScheduledTask -TaskName "AI-Daily-News-Push"
```

手动运行:
```powershell
Start-ScheduledTask -TaskName "AI-Daily-News-Push"
```

删除任务:
```powershell
Unregister-ScheduledTask -TaskName "AI-Daily-News-Push" -Confirm:$false
```

修改执行时间（例如改为17:00）:
```powershell
$Trigger = New-ScheduledTaskTrigger -Daily -At "17:00"
Set-ScheduledTask -TaskName "AI-Daily-News-Push" -Trigger $Trigger
```

## 📋 任务摘要

| 项目 | 配置 |
|------|------|
| 任务名称 | AI-Daily-News-Push |
| 执行频率 | 每日一次 |
| 执行时间 | 16:00 (北京时间) |
| 脚本路径 | ~/.openclaw/workspace/scripts/ai-news-push.ps1 |
| 推送内容 | AI新闻（5个分类） |
| 飞书目标 | ⚠️ 待配置（需提供正确的 chat_id） |
| 状态 | ✅ 定时任务就绪，待配置目标聊天ID |

## ⚠️ 注意事项

1. **Brave API Key**: 当前未配置，脚本会使用备用内容推送
2. **目标聊天**: 需要在环境变量或脚本参数中指定飞书聊天ID
3. **电脑状态**: 定时任务需要电脑在16:00处于开机状态
