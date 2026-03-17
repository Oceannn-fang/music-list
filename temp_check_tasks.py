import pandas as pd
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\86185\OneDrive\桌面\新建文件夹 (2)\2024导师带教项目_整体学习情况_20260303_174145.xlsx'

# 读取事项数据（第二个 sheet）
df_tasks = pd.read_excel(file_path, sheet_name=1)

print('=== 更新后的事项数据 ===')
print(f'事项数量: {len(df_tasks)}')
print()
print('所有事项及时间:')
for idx, row in df_tasks.iterrows():
    print(f"{idx+1:2d}. {row['事项名称']}")
    print(f"    开始: {row['事项开始时间']}")
    print(f"    结束: {row['事项结束时间']}")
