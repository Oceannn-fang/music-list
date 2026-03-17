import pandas as pd
import os

# 列出所有xlsx文件
files = [f for f in os.listdir('.') if f.endswith('.xlsx') and not f.startswith('~$')]
print("找到的Excel文件:")
for i, f in enumerate(files):
    print(f"{i}: {f}")

print("\n" + "="*50)

# 读取源文件（整体学习情况）
source_file = [f for f in files if '20260303' in f][0]
print(f"\n源文件: {source_file}")
df_source = pd.read_excel(source_file)
print(f"\n源文件列名: {df_source.columns.tolist()}")
print(f"\n源文件前5行:")
print(df_source.head())

print("\n" + "="*50)

# 读取目标文件（学员事项完成情况）
target_file = [f for f in files if f.startswith('学员') or '事项' in f or f.startswith('ѧ')][0]
print(f"\n目标文件: {target_file}")
df_target = pd.read_excel(target_file)
print(f"\n目标文件列名: {df_target.columns.tolist()}")
print(f"\n目标文件前10行:")
print(df_target.head(10))
