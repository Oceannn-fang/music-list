import pandas as pd
import os

os.chdir('C:/Users/86185/OneDrive/桌面/新建文件夹 (2)')

# 列出所有xlsx文件
files = [f for f in os.listdir('.') if f.endswith('.xlsx') and not f.startswith('~$')]

# 读取目标文件（学员事项完成情况）
target_file = [f for f in files if f.startswith('学员') or '事项' in f or f.startswith('ѧ')][0]
df = pd.read_excel(target_file)

# 正确解析事项时间，提取结束时间
def parse_end_time(time_str):
    if pd.isna(time_str):
        return None
    # 格式: 2024-12-23 08:00-2025-01-23 18:00
    try:
        # 找到最后一个空格，区分开始时间和结束时间
        # 格式是: YYYY-MM-DD HH:MM-YYYY-MM-DD HH:MM
        parts = time_str.split('-')
        if len(parts) == 6:  # ['2024', '12', '23 08:00', '2025', '01', '23 18:00']
            end_time_str = parts[3] + '-' + parts[4] + '-' + parts[5]
            return pd.to_datetime(end_time_str.strip())
        return None
    except Exception as e:
        print(f"Error parsing end time: {time_str}, error: {e}")
        return None

# 正确解析开始时间
def parse_start_time(time_str):
    if pd.isna(time_str):
        return None
    try:
        parts = time_str.split('-')
        if len(parts) == 6:  # ['2024', '12', '23 08:00', '2025', '01', '23 18:00']
            start_time_str = parts[0] + '-' + parts[1] + '-' + parts[2]
            return pd.to_datetime(start_time_str.strip())
        return None
    except Exception as e:
        print(f"Error parsing start time: {time_str}, error: {e}")
        return None

# 测试解析
test_time = "2024-12-23 08:00-2025-01-23 18:00"
print(f"Test time string: {test_time}")
print(f"Parsed start: {parse_start_time(test_time)}")
print(f"Parsed end: {parse_end_time(test_time)}")

# 提取时间
df['事项开始时间'] = df['事项时间（开始时间-结束时间）'].apply(parse_start_time)
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
print("\n完成状态验证结果:")
print(df['判断正确'].value_counts())

print("\n判断不一致的记录:")
mismatches = df[df['判断正确'] == False]
print(f"共有 {len(mismatches)} 条记录判断不一致")
if len(mismatches) > 0:
    print(mismatches[['姓名', '事项名称', '完成状态', '预期状态', '事项开始时间', '事项结束时间', '完成时间']].head(20).to_string())
else:
    print("所有记录的完成状态判断都正确!")

# 保存验证结果
df.to_csv('C:/Users/86185/.openclaw/workspace/verification_result3.csv', index=False, encoding='utf-8-sig')
print("\n验证结果已保存到 verification_result3.csv")
