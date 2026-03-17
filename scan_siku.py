import os
from pathlib import Path

def scan_directory(path):
    """扫描目录结构"""
    structure = []
    for root, dirs, files in os.walk(path):
        # 跳过隐藏文件夹
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        level = root.replace(path, '').count(os.sep)
        rel_path = os.path.relpath(root, path)
        structure.append({
            'path': root,
            'rel_path': rel_path,
            'level': level,
            'dirs': dirs,
            'files': [f for f in files if not f.startswith('.')]
        })
    return structure

# 扫描 E:\思酷
vault_path = r"E:\思酷"
structure = scan_directory(vault_path)

# 打印结构
print("=" * 60)
print("E:\\思酷 文件夹结构:")
print("=" * 60)

for item in structure[:20]:  # 只显示前20个文件夹
    indent = "  " * item['level']
    folder_name = os.path.basename(item['path']) if item['rel_path'] != '.' else '思酷 (根目录)'
    file_count = len(item['files'])
    print(f"{indent}📁 {folder_name} ({file_count} 个文件)")

print("\n" + "=" * 60)
print(f"总共扫描到 {len(structure)} 个文件夹")
