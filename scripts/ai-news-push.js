const { execSync } = require('child_process');

const chatId = process.env.FEISHU_AI_NEWS_CHAT || process.argv[2];
if (!chatId) {
    console.error('Error: FEISHU_AI_NEWS_CHAT not set');
    process.exit(1);
}

const today = new Date().toLocaleDateString('zh-CN');
const weekday = new Date().toLocaleDateString('zh-CN', { weekday: 'long' });

// 使用 web_search 搜索（如果有配置的话）
function tryWebSearch(query) {
    try {
        const result = execSync(`openclaw web search "${query}" --count 2 2>nul`, {
            encoding: 'utf8',
            timeout: 10000
        });
        const lines = result.trim().split('\n').filter(l => l.trim() && !l.includes('Error') && !l.includes('api key'));
        return lines.slice(0, 2);
    } catch (e) {
        return [];
    }
}

// 搜索主题
const searches = [
    { emoji: '🎵', name: '音乐+AI', query: 'AI音乐 Suno 最新' },
    { emoji: '🛠️', name: '产品经理AI工具', query: 'AI产品经理工具 最新' },
    { emoji: '🚀', name: 'AI大事件', query: 'AI人工智能 最新发布' },
    { emoji: '📊', name: '运营+AI', query: 'AI运营 营销 最新' },
    { emoji: '💡', name: 'AI应用场景', query: 'AI落地应用 最新' }
];

// 备用内容
const backupNews = {
    '🎵 音乐+AI': ['Suno v4 支持更长曲目', 'Udio 音频修复功能'],
    '🛠️ 产品经理AI工具': ['Figma AI 正式版', 'Notion AI 数据库填充'],
    '🚀 AI大事件': ['Claude 4 即将发布', 'GPT-5 预计夏季发布'],
    '📊 运营+AI': ['小红书AI内容助手', '抖音AI选品工具'],
    '💡 AI应用场景': ['支付宝AI生活助手', '钉钉AI助理接入500+企业']
};

// 构建消息
let message = `🤖 AI日报 | ${today} ${weekday}\n\n📰 今日AI精选资讯：\n\n`;

searches.forEach(cat => {
    message += `${cat.emoji} ${cat.name}\n`;
    
    // 尝试搜索
    const results = tryWebSearch(cat.query);
    if (results.length > 0) {
        results.forEach(r => {
            const clean = r.replace(/^\d+\.\s*/, '').substring(0, 70);
            message += `• ${clean}\n`;
        });
    } else {
        // 使用备用
        backupNews[cat.name].forEach(item => {
            message += `• ${item}\n`;
        });
    }
    message += '\n';
});

message += '---\n⏰ 每日16:00自动推送';

console.log('Sending...');

try {
    execSync(`openclaw message send --target "chat:${chatId}" --message "${message.replace(/"/g, '\\"')}"`, {
        stdio: 'inherit'
    });
} catch (e) {
    console.error('Failed:', e.message);
    process.exit(1);
}
