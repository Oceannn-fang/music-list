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

# 保存到文本文件
output_path = r"C:\Users\86185\.openclaw\workspace\siku_structure.txt"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write("=" * 60 + "\n")
    f.write("E:\\思酷 文件夹结构:\n")
    f.write("=" * 60 + "\n\n")
    
    for item in structure:
        indent = "  " * item['level']
        folder_name = os.path.basename(item['path']) if item['rel_path'] != '.' else '思酷 (根目录)'
        file_count = len(item['files'])
        f.write(f"{indent}[{folder_name}] - {file_count} files\n")
    
    f.write("\n" + "=" * 60 + "\n")
    f.write(f"总共: {len(structure)} 个文件夹\n")

print(f"结构已保存到: {output_path}")
print(f"总共扫描到 {len(structure)} 个文件夹")
