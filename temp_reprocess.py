import pandas as pd
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\86185\OneDrive\桌面\新建文件夹 (2)\2024导师带教项目_整体学习情况_20260303_174145.xlsx'
output_path = r'C:\Users\86185\OneDrive\桌面\新建文件夹 (2)\2024导师带教项目_学习情况汇总表_更新.xlsx'

# 读取数据
df_tasks = pd.read_excel(file_path, sheet_name=1)  # 事项时间数据
df_detail = pd.read_excel(file_path, sheet_name=2)  # 学员明细数据

# 创建事项时间字典
task_time_dict = {}
for _, row in df_tasks.iterrows():
    task_name = row['事项名称']
    start_time = pd.to_datetime(row['事项开始时间'])
    end_time = pd.to_datetime(row['事项结束时间'])
    task_time_dict[task_name] = {'start': start_time, 'end': end_time}

print(f'事项数量: {len(task_time_dict)}')
print(f'学员明细数量: {len(df_detail)}')

# 定义状态判断函数
def judge_status(task_name, complete_time_str):
    # 如果没有完成时间
    if pd.isna(complete_time_str) or complete_time_str == '--' or complete_time_str == '':
        return '未完成', ''
    
    # 获取事项时间
    if task_name not in task_time_dict:
        return '已完成', complete_time_str  # 如果找不到事项时间，按原状态
    
    task_info = task_time_dict[task_name]
    start_time = task_info['start']
    end_time = task_info['end']
    
    # 解析完成时间
    try:
        complete_time = pd.to_datetime(complete_time_str)
    except:
        return '已完成', complete_time_str
    
    # 判断状态
    if start_time <= complete_time <= end_time:
        return '已完成', complete_time_str
    elif complete_time > end_time:
        return '超时完成', complete_time_str
    else:
        return '已完成', complete_time_str

# 处理数据
results = []
for _, row in df_detail.iterrows():
    task_name = row['事项名称']
    complete_time = row['完成时间']
    status, actual_time = judge_status(task_name, complete_time)
    
    results.append({
        '姓名': row['姓名'],
        '账号': row['账号'],
        '部门': row['部门'],
        '岗位': row['岗位'] if pd.notna(row['岗位']) else '',
        '事项名称': task_name,
        '完成状态': status,
        '完成时间': actual_time
    })

# 创建新 DataFrame
df_result = pd.DataFrame(results)

# 创建透视表 - 以学员为行，事项为列
pivot_table = df_result.pivot_table(
    index=['姓名', '账号', '部门', '岗位'],
    columns='事项名称',
    values='完成状态',
    aggfunc='first'
).reset_index()

# 保存到 Excel
with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    df_result.to_excel(writer, index=False, sheet_name='学习情况汇总')
    pivot_table.to_excel(writer, index=False, sheet_name='学员事项透视表')

print(f'\n处理完成！')
print(f'总行数: {len(df_result)}')
print(f'\n状态分布:')
print(df_result['完成状态'].value_counts())
print(f'\n输出文件: {output_path}')
