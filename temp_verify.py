import pandas as pd
import sys
sys.stdout.reconfigure(encoding='utf-8')

output_path = r'C:\Users\86185\OneDrive\桌面\新建文件夹 (2)\2024导师带教项目_学习情况汇总表_更新.xlsx'

# 读取新生成的文件
df = pd.read_excel(output_path, sheet_name='学习情况汇总')

print('=== 更新后的汇总表 ===')
print(f'总行数: {len(df)}')
print(f'学员数: {df["姓名"].nunique()}')
print(f'事项数: {df["事项名称"].nunique()}')

print('\n状态分布:')
status_counts = df['完成状态'].value_counts()
for status, count in status_counts.items():
    pct = count / len(df) * 100
    print(f'  {status}: {count} 条 ({pct:.1f}%)')

print('\n前10行数据:')
print(df.head(10).to_string())
