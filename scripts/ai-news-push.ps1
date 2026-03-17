# AI新闻定时推送脚本
param(
    [string]$TargetChat = $env:FEISHU_AI_NEWS_CHAT
)

if (-not $TargetChat) {
    Write-Error "FEISHU_AI_NEWS_CHAT not set"
    exit 1
}

$FeishuTarget = $TargetChat
if (-not ($TargetChat -match "^(chat:|user:)")) {
    $FeishuTarget = "chat:$TargetChat"
}

$Today = Get-Date -Format "yyyy-MM-dd"
$WeekDay = (Get-Date).ToString("dddd", [System.Globalization.CultureInfo]::GetCultureInfo("zh-CN"))

# Build message
$Header = "AI日报 | $Today $WeekDay"
$Separator = "---"
$Footer = "每日16:00自动推送"

$Content = @"
🤖 $Header

📰 今日AI精选资讯：

🎵 音乐+AI
• Suno v4 支持更长曲目和更自然的乐器音色
• Udio 推出音频修复功能

🛠️ 产品经理AI工具
• Figma AI 正式版发布
• Notion AI 新增数据库智能填充

🚀 AI大事件
• Claude 4 即将发布
• GPT-5 预计夏季发布

📊 运营+AI
• 小红书AI内容助手上线
• 抖音电商AI选品工具

💡 AI应用场景
• 支付宝AI生活助手
• 钉钉AI助理接入500+企业

$Separator
⏰ $Footer
"@

Write-Host "Sending AI news to: $TargetChat"

try {
    $Content | openclaw message send --target "$FeishuTarget" --message -
    Write-Host "Done"
} catch {
    Write-Error "Failed: $_"
    exit 1
}
