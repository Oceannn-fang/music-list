import pandas as pd
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\86185\OneDrive\桌面\新建文件夹 (2)\2024导师带教项目_整体学习情况_20260303_174145.xlsx'

# 读取事项数据
df_tasks = pd.read_excel(file_path, sheet_name=1)

print('=== 所有事项时间 ===')
for idx, row in df_tasks.iterrows():
    print(f"{row['事项名称']}: {row['事项开始时间']} ~ {row['事项结束时间']}")
