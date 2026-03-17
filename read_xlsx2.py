import pandas as pd
import os

# 列出所有xlsx文件
files = [f for f in os.listdir('.') if f.endswith('.xlsx') and not f.startswith('~$')]
print("Found Excel files:")
for i, f in enumerate(files):
    print(f"{i}: {repr(f)}")

print("\n" + "="*50)

# 读取源文件（整体学习情况）
source_file = [f for f in files if '20260303' in f][0]
print(f"\nSource file: {repr(source_file)}")
df_source = pd.read_excel(source_file)
print(f"\nSource columns: {df_source.columns.tolist()}")
print(f"\nSource shape: {df_source.shape}")
print(f"\nSource first 5 rows:")
for idx, row in df_source.head().iterrows():
    print(f"Row {idx}: {row.to_dict()}")

print("\n" + "="*50)

# 读取目标文件（学员事项完成情况）
target_file = [f for f in files if f.startswith('学员') or '事项' in f or f.startswith('ѧ')][0]
print(f"\nTarget file: {repr(target_file)}")
df_target = pd.read_excel(target_file)
print(f"\nTarget columns: {df_target.columns.tolist()}")
print(f"\nTarget shape: {df_target.shape}")
print(f"\nTarget first 15 rows:")
for idx, row in df_target.head(15).iterrows():
    print(f"Row {idx}: {row.to_dict()}")

# 检查完成状态的唯一值
print("\n" + "="*50)
print("\nUnique values in '完成状态' column:")
if '完成状态' in df_target.columns:
    print(df_target['完成状态'].unique())
else:
    # Try to find the status column
    for col in df_target.columns:
        if '状态' in col:
            print(f"Column '{col}' values: {df_target[col].unique()}")
