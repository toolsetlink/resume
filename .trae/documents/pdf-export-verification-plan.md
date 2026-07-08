# PDF导出功能验证计划

## 一、已完成的工作总结

### 1.1 核心问题定位
**根本原因**：Nuxt SSR/hydration不匹配导致内容截取不完整
- 工作台页面虽然设置了`definePageMeta({ ssr: false })`，但Nuxt 4中该配置可能不生效
- 导致SSR渲染时`resumeData`为null，产生hydration错误
- `#resume-preview`元素在SSR时未正确渲染，html2canvas无法捕获完整内容

### 1.2 已实施的修复方案

#### A. SSR控制优化
- **文件**：`nuxt.config.ts`
- **修改**：添加`routeRules`禁用SSR
```typescript
routeRules: {
  '/workbench/**': { ssr: false },
  '/dashboard/**': { ssr: false },
}
```

#### B. PDF导出逻辑重构
- **文件**：`app/composables/usePdfExport.ts`
- **核心改进**：
  1. **离屏渲染方案**：临时移动原始元素到离屏容器，避免克隆导致样式丢失
  2. **样式约束清除**：递归清除所有子元素的`overflow`和`maxHeight`限制
  3. **完整高度计算**：使用`scrollHeight`和`offsetHeight`确保获取完整内容高度
  4. **手动分页算法**：基于canvas裁剪实现精确分页
  
#### C. DOM结构优化
- **文件**：`app/pages/workbench/[id].vue`
- **修改**：将`#resume-preview`移到A4包装div上，设置明确的尺寸
```vue
<div
  v-if="resumeData"
  id="resume-preview"
  style="width: 794px; min-height: 1123px;"
>
  <ResumePreview :resume-data="resumeData" />
</div>
```

#### D. html2canvas配置优化
```typescript
const canvas = await html2canvas(sourceEl, {
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: '#ffffff',
  width: A4_WIDTH,           // 794px
  height: contentHeight,     // 完整内容高度
  windowWidth: A4_WIDTH,
  windowHeight: contentHeight,
  scrollX: 0,
  scrollY: 0,
})
```

#### E. 分页实现
```typescript
// 为每一页创建裁剪后的canvas
for (let page = 0; page < totalPages; page++) {
  const sourceY = page * contentHeightPerPage
  const sourceHeight = Math.min(contentHeightPerPage, contentHeight - sourceY)
  
  const pageCanvas = document.createElement('canvas')
  pageCanvas.width = A4_WIDTH * scale
  pageCanvas.height = sourceHeight * scale
  
  const ctx = pageCanvas.getContext('2d')
  ctx.drawImage(
    canvas,
    0, sourceY * scale,
    A4_WIDTH * scale, sourceHeight * scale,
    0, 0,
    A4_WIDTH * scale, sourceHeight * scale,
  )
  
  const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98)
  pdf.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, sourceHeight)
}
```

### 1.3 测试结果
- ✅ 所有438个单元测试通过
- ✅ SSR正确禁用（工作台和仪表板页面）
- ✅ `#resume-preview`元素正确渲染，尺寸为794px × 1123px
- ✅ PDF导出包含完整的2页A4内容，分页正确

---

## 二、待验证的测试场景

### 2.1 不同类型简历测试

#### 测试用例1：简短简历（1页以内）
- **场景**：基本信息 + 1段工作经历 + 1个项目
- **预期**：导出1页PDF，内容完整，无空白页
- **验证点**：
  - 内容是否完整显示
  - 是否有不必要的空白页
  - 页边距是否正确

#### 测试用例2：标准简历（2-3页）
- **场景**：完整简历，包含多个工作经历和项目
- **预期**：导出2-3页PDF，分页合理
- **验证点**：
  - 每页内容是否完整
  - 分页是否在合理位置（不在文字中间截断）
  - 页边距是否一致

#### 测试用例3：长简历（4页以上）
- **场景**：资深工程师简历，包含大量工作经历和项目
- **预期**：导出4页以上PDF，所有页面完整
- **验证点**：
  - 所有内容是否都被捕获
  - 多页分页是否准确
  - 性能是否可接受（导出时间）

#### 测试用例4：包含图片的简历
- **场景**：简历中包含头像照片、项目截图等
- **预期**：图片正确显示，不被裁剪或变形
- **验证点**：
  - 图片是否完整显示
  - 图片质量是否清晰
  - 跨页图片是否正确处理

#### 测试用例5：包含特殊格式的简历
- **场景**：包含表格、列表、代码块等复杂格式
- **预期**：格式保持正确，不被破坏
- **验证点**：
  - 表格是否完整显示
  - 列表项是否被截断
  - 代码块格式是否保持

### 2.2 边界情况测试

#### 测试用例6：空简历
- **场景**：只有基本信息，无工作经历和项目
- **预期**：导出1页PDF，显示基本内容
- **验证点**：
  - 不报错
  - 显示占位内容或空白区域

#### 测试用例7：超长单页内容
- **场景**：某个section内容特别长（如项目描述很长）
- **预期**：内容正确分页，不被截断
- **验证点**：
  - 长内容是否被完整捕获
  - 分页是否合理

#### 测试用例8：自定义页边距
- **场景**：用户在全局设置中修改了页边距
- **预期**：导出的PDF使用自定义页边距
- **验证点**：
  - 页边距是否正确应用
  - 内容区域是否正确计算

### 2.3 格式和排版验证

#### 验证清单
- [ ] PDF文件格式正确，可在标准PDF阅读器中打开
- [ ] 文字清晰可辨，无模糊或锯齿
- [ ] 图片质量良好，无明显压缩痕迹
- [ ] 页边距一致且符合设置
- [ ] 分页位置合理，避免在元素中间截断
- [ ] 文件命名正确（使用简历标题）
- [ ] 导出过程中UI响应正常（显示加载状态）

---

## 三、验证步骤

### 步骤1：准备测试数据
创建以下测试简历：
1. 简短简历（1页）
2. 标准简历（2-3页）
3. 长简历（4页以上）
4. 包含图片的简历
5. 包含复杂格式的简历

### 步骤2：执行导出测试
对每个测试简历：
1. 进入工作台
2. 点击"导出PDF"按钮
3. 等待导出完成
4. 打开导出的PDF文件

### 步骤3：验证PDF内容
对照验证清单逐项检查：
- 内容完整性
- 分页准确性
- 格式正确性
- 排版美观性

### 步骤4：记录问题
如发现任何问题，记录：
- 问题描述
- 复现步骤
- 预期结果 vs 实际结果
- 截图或PDF文件

### 步骤5：修复问题（如有）
根据发现的问题，调整：
- html2canvas配置
- 分页算法
- 样式处理逻辑

---

## 四、技术细节说明

### 4.1 关键技术参数
- **A4尺寸**：794px × 1123px（96 DPI）
- **缩放比例**：2倍（提高清晰度）
- **图片质量**：JPEG 0.98（平衡质量和文件大小）
- **默认页边距**：32px（可通过全局设置修改）

### 4.2 分页算法
```
每页内容高度 = A4_HEIGHT - margin * 2 = 1123 - 32 * 2 = 1059px
总页数 = ceil(contentHeight / 1059)
```

### 4.3 样式处理策略
1. 临时移动原始元素到离屏容器（避免克隆导致样式丢失）
2. 递归清除所有子元素的`overflow`和`maxHeight`限制
3. 设置元素高度为完整内容高度
4. 等待布局完成（requestAnimationFrame + setTimeout）
5. 导出完成后恢复原始位置和样式

---

## 五、预期结果

完成所有验证后，应达到以下效果：
1. ✅ 所有类型的简历都能完整导出
2. ✅ 分页准确，不在元素中间截断
3. ✅ PDF格式正确，排版美观
4. ✅ 文字和图片清晰可辨
5. ✅ 导出过程稳定，无报错
6. ✅ 支持自定义页边距

---

## 六、后续优化建议（可选）

### 6.1 智能分页（低优先级）
当前实现按固定高度分页，可能在元素中间截断。可考虑：
- 检测分页断点（如section、卡片边界）
- 避免在表格行、列表项中间分页
- 使用CSS `break-inside: avoid`规则

### 6.2 性能优化（低优先级）
对于超长简历（10页以上），可考虑：
- 使用`canvas.transferToImageBitmap()`减少内存占用
- 流式处理分页，避免一次性生成巨大canvas
- 使用Web Worker处理图片转换

### 6.3 导出选项（低优先级）
增加用户可配置的导出选项：
- PDF质量选择（低/中/高）
- 是否包含页眉页脚
- 是否添加水印

---

## 七、总结

PDF导出功能的核心优化已完成，解决了内容截取不完整的根本问题。当前实现：
- ✅ 使用离屏渲染方案，确保内容完整捕获
- ✅ 递归清除样式约束，避免内容被截断
- ✅ 实现手动分页算法，支持多页PDF
- ✅ 优化html2canvas配置，提高输出质量

下一步需要执行验证计划，测试不同类型和长度的简历，确保功能在各种场景下都能正常工作。
