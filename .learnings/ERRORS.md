# Errors Log

记录命令失败、异常和意外行为。

## 格式模板

```markdown
## [ERR-YYYYMMDD-XXX] skill_or_command_name

**Logged**: ISO-8601 timestamp
**Priority**: high
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Summary
简要描述什么失败了

### Error
```
实际的错误信息或输出
```

### Context
- 尝试的命令/操作
- 使用的输入或参数
- 相关环境信息

### Suggested Fix
如果可识别，如何解决

### Metadata
- Reproducible: yes | no | unknown
- Related Files: path/to/file.ext
- See Also: ERR-20250110-001 (如果是重复问题)

---
```

## 条目

