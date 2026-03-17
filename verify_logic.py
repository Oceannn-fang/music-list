import pandas as pd
from datetime import datetime

# 读取数据
df = pd.read_csv('C:/Users/86185/.openclaw/workspace/target_data.csv')

# 解析事项时间，提取结束时间
def parse_end_time(time_str):
    if pd.isna(time_str):
        return None
    # 格式: 2024-12-23 08:00-2025-01-23 18:00
    parts = time_str.split('-')
    if len(parts) >= 3:
        # 后两部分是结束日期和时间
        end_datetime_str = parts[2] + '-' + parts[3] if len(parts) == 4 else parts[1] + '-' + parts[2]
        try:
            return pd.to_datetime(end_datetime_str.strip())
        except:
            return None
    return None

# 提取结束时间
df['事项结束时间'] = df['事项时间（开始时间-结束时间）'].apply(parse_end_time)
df['完成时间_解析'] = pd.to_datetime(df['完成时间'], errors='coerce')

# 验证完成状态判断逻辑
def verify_status(row):
    end_time = row['事项结束时间']
    complete_time = row['完成时间_解析']
    actual_status = row['完成状态']
    
    if pd.isna(complete_time):
        expected_status = '未完成'
    elif complete_time <= end_time:
        expected_status = '已完成'
    else:
        expected_status = '超时完成'
    
    return expected_status, expected_status == actual_status

df['预期状态'], df['判断正确'] = zip(*df.apply(verify_status, axis=1))

# 检查结果
print("完成状态验证结果:")
print(df['判断正确'].value_counts())

print("\n判断不一致的记录:")
mismatches = df[df['判断正确'] == False]
if len(mismatches) > 0:
    print(mismatches[['姓名', '事项名称', '完成状态', '预期状态', '事项结束时间', '完成时间']].to_string())
else:
    print("所有记录的完成状态判断都正确!")

# 统计各事项的状态分布
print("\n\n各事项的完成状态统计:")
status_stats = df.groupby(['事项名称', '完成状态']).size().unstack(fill_value=0)
print(status_stats)

# 保存验证结果
df.to_csv('C:/Users/86185/.openclaw/workspace/verification_result.csv', index=False, encoding='utf-8-sig')
print("\n验证结果已保存到 verification_result.csv")
