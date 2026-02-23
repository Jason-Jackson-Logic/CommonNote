export const noteTemplates = [
  {
    id: 'blank',
    name: '空白笔记',
    icon: 'FileText',
    description: '从头开始',
    content: ''
  },
  {
    id: 'daily',
    name: '工作日志',
    icon: 'Calendar',
    description: '记录每日工作',
    content: `# 工作日志 - ${new Date().toLocaleDateString('zh-CN')}

## 今日任务
- [ ] 

## 完成情况
- 

## 明日计划
- 

## 备注
`
  },
  {
    id: 'meeting',
    name: '会议记录',
    icon: 'Users',
    description: '会议纪要模板',
    content: `# 会议记录

**日期：** ${new Date().toLocaleDateString('zh-CN')}
**参会人员：** 
**会议主题：** 

## 会议议程
1. 
2. 
3. 

## 讨论内容

### 
- 

## 决议事项
- [ ] 

## 待办事项
| 事项 | 负责人 | 截止日期 |
|------|--------|----------|
|  |  |  |

## 下次会议
**时间：** 
**议题：** 
`
  },
  {
    id: 'reading',
    name: '读书笔记',
    icon: 'Book',
    description: '阅读心得模板',
    content: `# 《书名》读书笔记

## 基本信息
- **书名：** 
- **作者：** 
- **阅读时间：** 
- **评分：** ⭐⭐⭐⭐⭐

## 内容简介


## 精彩摘录
> 

## 核心观点
1. 
2. 
3. 

## 个人感悟


## 推荐理由

`
  },
  {
    id: 'project',
    name: '项目文档',
    icon: 'FolderKanban',
    description: '项目规划模板',
    content: `# 项目名称

## 项目概述
**目标：** 
**负责人：** 
**周期：** 
**状态：** 🟡 进行中

## 需求列表
| 序号 | 需求 | 优先级 | 状态 |
|------|------|--------|------|
| 1 |  | P0 | 待开发 |

## 技术方案
### 架构设计


### 技术栈
- 前端：
- 后端：
- 数据库：

## 里程碑
| 阶段 | 内容 | 截止日期 | 状态 |
|------|------|----------|------|
| v1.0 | MVP |  | ✅ |

## 风险点
- 

## 附录
`
  },
  {
    id: 'tutorial',
    name: '教程文档',
    icon: 'GraduationCap',
    description: '技术教程模板',
    content: `# 教程标题

## 概述
本教程将帮助你...

## 前置条件
- 
- 

## 步骤一：标题

### 1.1 子步骤


### 1.2 代码示例
\`\`\`javascript
// 代码示例
\`\`\`

## 步骤二：标题


## 常见问题

### Q1: 
**A:** 

## 总结


## 参考资料
- 
`
  }
];
