import os
from pathlib import Path
from datetime import datetime

def create_index_files(vault_path):
    """为每个文件夹创建索引文件"""
    
    # 文件类型图标映射
    type_icons = {
        '.ppt': '📊', '.pptx': '📊',
        '.doc': '📝', '.docx': '📝',
        '.pdf': '📄',
        '.xls': '📈', '.xlsx': '📈', '.csv': '📈',
        '.md': '📑',
        '.txt': '📃',
        '.png': '🖼️', '.jpg': '🖼️', '.jpeg': '🖼️', '.gif': '🖼️', '.svg': '🖼️',
        '.mp4': '🎬', '.avi': '🎬', '.mov': '🎬',
        '.mp3': '🎵', '.wav': '🎵',
        '.zip': '📦', '.rar': '📦', '.7z': '📦',
        '.py': '💻', '.js': '💻', '.html': '💻', '.css': '💻',
    }
    
    def get_file_icon(filename):
        ext = Path(filename).suffix.lower()
        return type_icons.get(ext, '📎')
    
    def create_folder_index(folder_path, rel_path, files, subdirs):
        """为单个文件夹创建索引文件"""
        folder_name = os.path.basename(folder_path) if rel_path != '.' else '思酷资料库'
        index_file = os.path.join(folder_path, '_索引.md')
        
        # 分类文件
        categories = {
            '文档': [],
            '表格': [],
            '演示文稿': [],
            'PDF': [],
            '图片': [],
            '视频': [],
            '音频': [],
            '压缩包': [],
            '代码': [],
            '其他': []
        }
        
        for f in files:
            ext = Path(f).suffix.lower()
            if ext in ['.doc', '.docx', '.txt', '.md']:
                categories['文档'].append(f)
            elif ext in ['.xls', '.xlsx', '.csv']:
                categories['表格'].append(f)
            elif ext in ['.ppt', '.pptx']:
                categories['演示文稿'].append(f)
            elif ext == '.pdf':
                categories['PDF'].append(f)
            elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.webp']:
                categories['图片'].append(f)
            elif ext in ['.mp4', '.avi', '.mov', '.mkv', '.flv']:
                categories['视频'].append(f)
            elif ext in ['.mp3', '.wav', '.ogg', '.flac', '.aac']:
                categories['音频'].append(f)
            elif ext in ['.zip', '.rar', '.7z', '.tar', '.gz']:
                categories['压缩包'].append(f)
            elif ext in ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs']:
                categories['代码'].append(f)
            else:
                categories['其他'].append(f)
        
        # 生成索引内容
        content = f"""# {folder_name}

> 📁 文件夹索引
> 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## 📂 文件夹信息

- **路径**: `{rel_path}`
- **文件总数**: {len(files)} 个
- **子文件夹**: {len(subdirs)} 个

"""
        
        # 添加子文件夹导航
        if subdirs:
            content += "## 📁 子文件夹\n\n"
            for subdir in sorted(subdirs):
                subdir_index = os.path.join(subdir, '_索引.md')
                content += f"- [[{subdir_index}|{subdir}]]\n"
            content += "\n"
        
        # 添加返回上级链接
        if rel_path != '.':
            parent_path = os.path.dirname(rel_path) if os.path.dirname(rel_path) else '.'
            parent_index = os.path.join(parent_path, '_索引.md') if parent_path != '.' else '_索引.md'
            content += f"## ⬆️ 返回上级\n\n[[{parent_index}|返回上级目录]]\n\n"
        
        # 添加文件列表（按分类）
        has_files = False
        for category, file_list in categories.items():
            if file_list:
                has_files = True
                content += f"## {category}\n\n"
                for f in sorted(file_list):
                    icon = get_file_icon(f)
                    # 创建相对链接
                    file_rel_path = os.path.join(rel_path, f) if rel_path != '.' else f
                    content += f"- {icon} [{f}]({f})\n"
                content += "\n"
        
        if not has_files:
            content += "## 📄 文件\n\n*此文件夹为空*\n\n"
        
        # 写入文件
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return index_file
    
    # 遍历所有文件夹
    created_count = 0
    for root, dirs, files in os.walk(vault_path):
        # 跳过隐藏文件夹
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        files = [f for f in files if not f.startswith('.') and f != '_索引.md']
        
        rel_path = os.path.relpath(root, vault_path)
        
        try:
            index_file = create_folder_index(root, rel_path, files, dirs)
            created_count += 1
            if created_count % 100 == 0:
                print(f"已创建 {created_count} 个索引文件...")
        except Exception as e:
            print(f"创建索引失败 {root}: {e}")
    
    return created_count

# 执行
vault_path = r"E:\思酷"
print(f"开始为 {vault_path} 创建索引文件...")
print("这可能需要几分钟，请稍候...")
print()

count = create_index_files(vault_path)
print(f"\n✅ 完成！共创建 {count} 个索引文件")
print(f"现在可以把 'E:\\思酷' 作为 Obsidian vault 打开了")
