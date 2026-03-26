# Solar System Simulator 设计文档

## 概述

一个基于真实数据的 3D 太阳系模拟器，使用 NASA 纹理材质，支持公转和自转速度调节。

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 3D 渲染 | React Three Fiber (R3F) + Three.js |
| 辅助库 | @react-three/drei（相机控制等）|
| 状态管理 | Zustand |
| 样式 | TailwindCSS（控制面板 UI）|

## 架构

### 目录结构

```
src/
├── data/                    # 静态数据
│   ├── planets.ts          # 行星数据（轨道、大小、自转周期等）
│   ├── moons.ts            # 卫星数据
│   ├── dwarf-planets.ts    # 矮行星数据
│   └── textures.ts         # NASA 纹理 URL 配置
├── components/
│   ├── scene/              # 3D 场景组件
│   │   ├── SolarSystem.tsx # 场景根组件
│   │   ├── CelestialBody.tsx # 通用天体组件
│   │   ├── OrbitLine.tsx   # 轨道线
│   │   └── StarField.tsx   # 星空背景
│   ├── ui/                 # 2D UI 组件
│   │   ├── ControlPanel.tsx    # 速度控制面板
│   │   ├── InfoPanel.tsx       # 行星信息面板
│   │   ├── CelestialSelector.tsx # 天体选择器
│   │   └── helpers/        # 辅助显示开关
│   └── three/              # Three.js 扩展
│       ├── useTextureLoader.ts # NASA 纹理加载
│       └── cameraControls.ts   # 相机控制
├── stores/
│   ├── simulationStore.ts  # 模拟状态（速度、时间）
│   └── selectionStore.ts   # 选中天体状态
└── utils/
    ├── orbital.ts          # 轨道计算
    └── scale.ts            # 比例缩放工具
```

## 数据模型

### 天体数据结构

```typescript
interface CelestialBody {
  id: string;
  name: string;              // 显示名称
  type: 'star' | 'planet' | 'dwarf' | 'moon';

  // 物理属性
  radius: number;            // 真实半径
  mass: number;              // 质量

  // 轨道属性 (真实数据)
  semiMajorAxis: number;     // 半长轴
  eccentricity: number;      // 离心率
  inclination: number;       // 轨道倾角 (度)
  orbitalPeriod: number;     // 公转周期 (地球日)
  rotationPeriod: number;    // 自转周期 (地球日)
  axialTilt: number;         // 轴倾斜 (度)

  // 渲染配置
  textureUrl: string;        // NASA 纹理 URL
  renderRadius: number;      // 渲染用半径 (放大后的)

  // 层级关系
  parentId?: string;         // 父天体 ID (卫星绕行星)
  children?: string[];       // 子天体 ID 列表
}
```

### 数据来源

- NASA Solar System Exploration API
- Wikipedia 天文数据
- Solar System Scope 纹理资源

## 核心功能

### 速度控制

```typescript
interface SimulationState {
  timeScale: number;           // 时间缩放因子 (默认 0.1 天/秒)
  rotationMultiplier: number;  // 自转速度倍数
  orbitMultiplier: number;     // 公转速度倍数
  isPaused: boolean;

  setTimeScale: (scale: number) => void;
  togglePause: () => void;
}

const DEFAULT_CONFIG = {
  timeScale: 0.1,              // 默认慢速，便于观察
  rotationMultiplier: 1,
  orbitMultiplier: 1,
  isPaused: false,
  timeScaleRange: [0.01, 100], // 速度调节范围
};
```

### 轨道运动

- 使用开普勒定律计算椭圆轨道
- 每帧更新位置：`θ = θ + (2π / orbitalPeriod) * deltaTime * timeScale`
- 支持离心率和轨道倾角的真实轨道形状

### 相机控制

- OrbitControls：自由旋转、缩放、平移
- 聚焦天体：相机平滑移动到选中天体附近
- 视角限制：防止穿过天体或飞出太远

## 纹理加载

### 来源

- Solar System Scope: `https://www.solarsystemscope.com/textures/`
- NASA 官方纹理

### 加载策略

1. **渐进加载**：先加载太阳和内行星，用户可先交互
2. **纹理压缩**：使用 `.webp` 格式减小体积
3. **LOD（细节层次）**：远距离用低分辨率纹理
4. **加载状态显示**：进度条显示当前加载的天体

### 纹理映射

- 球体使用标准 UV 球面投影纹理
- 太阳使用自发光材质
- 土星环使用单独的环纹理

## 比例处理

```typescript
const SCALE_CONFIG = {
  distanceScale: 1e-9,     // 距离缩放（保持真实比例）
  planetSizeBase: 0.5,      // 行星最小渲染半径
  sunSize: 5,               // 太阳渲染半径
  sizeMultiplier: 50,       // 行星放大倍数（便于观察）
};
```

策略：轨道距离真实比例，行星大小放大以便观察。

## UI 布局

```
┌─────────────────────────────────────────────────────┐
│  [标题: Solar System Simulator]                     │
├─────────────────────────────────────────────────────┤
│                                        ┌───────────┐│
│                                        │ 天体选择器││
│         3D 场景区域                    │ ▼ 地球    ││
│                                         └───────────┘│
│                                        ┌───────────┐│
│                                        │ 信息面板   ││
│                                        │ 名称: 地球 ││
│                                        │ 半径: ...  ││
│                                        │ 轨道: ...  ││
│                                        └───────────┘│
├─────────────────────────────────────────────────────┤
│ 控制面板                                            │
│ [▶/⏸ 播放/暂停] 公转速度: [━━━●━━] 0.1x           │
│                   自转速度: [━━━●━━] 1x             │
│ [ ] 显示轨道线  [ ] 显示标签  [ ] 显示比例尺        │
└─────────────────────────────────────────────────────┘
```

### 交互功能

1. 启动时显示加载进度
2. 加载完成后进入自由浏览模式
3. 用户可拖拽旋转视角、滚轮缩放
4. 点击天体或使用选择器聚焦
5. 控制面板调节速度、切换显示选项

## 天体范围

| 类别 | 天体 |
|------|------|
| **恒星** | 太阳 |
| **八大行星** | 水星、金星、地球、火星、木星、土星、天王星、海王星 |
| **矮行星** | 冥王星、谷神星、妊神星、鸟神星、阋神星 |
| **主要卫星** | 月球、木卫一~四（伽利略卫星）、土卫六、天卫三、海卫一 |
| **小行星带** | 以粒子系统或小天体群形式展示 |

### 实现优先级

1. 核心版本：太阳 + 八大行星 + 月球
2. 扩展版本：添加矮行星 + 主要卫星
3. 完整版本：小行星带 + 更多卫星

## 性能优化

- 使用 `InstancedMesh` 渲染小行星带
- 远距离天体使用简化几何体
- 纹理按需加载，不在视野内时降级
- 帧率监控，自动调整渲染质量

## 错误处理

- 纹理加载失败时使用纯色材质后备
- WebGL 不支持时显示提示信息
- 网络错误时重试机制

## 非目标

- 多人在线协作
- 后端 API 服务
- 用户账户系统
- 移动端原生应用