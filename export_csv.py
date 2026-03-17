import pandas as pd
import os

os.chdir('C:/Users/86185/OneDrive/桌面/新建文件夹 (2)')

# 列出所有xlsx文件
files = [f for f in os.listdir('.') if f.endswith('.xlsx') and not f.startswith('~$')]

# 读取源文件（整体学习情况）
source_file = [f for f in files if '20260303' in f][0]
df_source = pd.read_excel(source_file)

# 读取目标文件（学员事项完成情况）
target_file = [f for f in files if f.startswith('学员') or '事项' in f or f.startswith('ѧ')][0]
df_target = pd.read_excel(target_file)

# 保存为CSV以便查看
df_source.to_csv('C:/Users/86185/.openclaw/workspace/source_data.csv', index=False, encoding='utf-8-sig')
df_target.to_csv('C:/Users/86185/.openclaw/workspace/target_data.csv', index=False, encoding='utf-8-sig')

print("Files saved successfully")
print(f"Source shape: {df_source.shape}")
print(f"Target shape: {df_target.shape}")
print(f"\nTarget columns: {df_target.columns.tolist()}")
print(f"\nUnique status values: {df_target['完成状态'].unique().tolist()}")
print(f"\nStatus counts:\n{df_target['完成状态'].value_counts()}")
