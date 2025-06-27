# 鞋类识别系统 API 使用说明

## 概述

这是一个基于ResNet50的鞋类识别系统，使用Flask提供API服务，前端使用现代化的Web界面。

## 系统要求

- Python 3.8+
- PyTorch 2.1.0+
- Flask 2.3.3+
- 其他依赖见 `requirements.txt`

## 安装和运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 启动API服务器

```bash
python app.py
```

API服务器将在 `http://localhost:5000` 启动。

### 3. 访问Web界面

在浏览器中打开 `web/index.html` 文件。

## API 端点

### 1. 健康检查
- **URL**: `GET /health`
- **描述**: 检查API服务器状态
- **响应**:
```json
{
    "status": "healthy",
    "model_loaded": true,
    "device": "cuda"
}
```

### 2. 鞋类识别
- **URL**: `POST /predict`
- **描述**: 上传图像进行鞋类识别
- **请求体**:
```json
{
    "image": "base64编码的图像数据"
}
```
- **响应**:
```json
{
    "success": true,
    "prediction": {
        "shoeModel": "nike_air_force_1_low",
        "confidence": 95.67,
        "top5_predictions": [
            {
                "class": "nike_air_force_1_low",
                "confidence": 0.9567
            },
            {
                "class": "nike_air_force_1_high",
                "confidence": 0.0234
            }
        ]
    }
}
```

## 支持的鞋类

系统可以识别以下50种鞋类：

### Adidas
- adidas_forum_high
- adidas_forum_low
- adidas_gazelle
- adidas_nmd_r1
- adidas_samba
- adidas_stan_smith
- adidas_superstar
- adidas_ultraboost

### Asics
- asics_gel-lyte_iii

### Converse
- converse_chuck_70_high
- converse_chuck_70_low
- converse_chuck_taylor_all-star_high
- converse_chuck_taylor_all-star_low
- converse_one_star

### New Balance
- new_balance_327
- new_balance_550
- new_balance_574
- new_balance_990
- new_balance_992

### Nike
- nike_air_force_1_high
- nike_air_force_1_low
- nike_air_force_1_mid
- nike_air_jordan_1_high
- nike_air_jordan_1_low
- nike_air_jordan_11
- nike_air_jordan_3
- nike_air_jordan_4
- nike_air_max_1
- nike_air_max_270
- nike_air_max_90
- nike_air_max_95
- nike_air_max_97
- nike_air_max_plus_(tn)
- nike_air_vapormax_flyknit
- nike_air_vapormax_plus
- nike_blazer_mid_77
- nike_cortez
- nike_dunk_high
- nike_dunk_low

### 其他品牌
- puma_suede_classic
- reebok_classic_leather
- reebok_club_c_85
- salomon_xt-6
- vans_authentic
- vans_old_skool
- vans_sk8-hi
- vans_slip-on_checkerboard
- yeezy_700_wave_runner
- yeezy_boost_350_v2
- yeezy_slide

## 图像预处理

系统使用与训练时相同的预处理步骤：

1. 调整图像大小为 224x224 像素
2. 转换为PyTorch张量
3. 使用ImageNet标准化参数进行归一化

## 模型信息

- **模型架构**: ResNet50
- **训练数据**: 50个鞋类，每个类别约100-150张图像
- **模型文件**: `model_bank/best_cnn_resnet50.pth`
- **输入尺寸**: 224x224 RGB图像
- **输出**: 50个类别的概率分布

## 使用示例

### Python客户端示例

```python
import requests
import base64

# 读取图像文件
with open('shoe_image.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

# 发送请求
response = requests.post('http://localhost:5000/predict', 
                        json={'image': image_data})

# 处理响应
if response.status_code == 200:
    result = response.json()
    print(f"预测结果: {result['prediction']['shoeModel']}")
    print(f"置信度: {result['prediction']['confidence']:.2f}%")
else:
    print(f"错误: {response.text}")
```

### JavaScript客户端示例

```javascript
// 将图像转换为base64
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = image.width;
canvas.height = image.height;
ctx.drawImage(image, 0, 0);
const imageData = canvas.toDataURL('image/jpeg').split(',')[1];

// 发送请求
fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        image: imageData
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('预测结果:', data.prediction.shoeModel);
        console.log('置信度:', data.prediction.confidence);
    }
})
.catch(error => console.error('错误:', error));
```

## 故障排除

### 常见问题

1. **模型加载失败**
   - 确保 `model_bank/best_cnn_resnet50.pth` 文件存在
   - 检查文件权限

2. **CUDA不可用**
   - 系统会自动回退到CPU模式
   - 性能会有所下降，但功能正常

3. **内存不足**
   - 减少批处理大小
   - 使用CPU模式

4. **CORS错误**
   - 确保Flask-CORS已正确安装
   - 检查浏览器控制台错误信息

### 日志信息

API服务器会输出详细的日志信息，包括：
- 模型加载状态
- 请求处理过程
- 错误信息

## 性能优化

1. **GPU加速**: 如果有NVIDIA GPU，安装CUDA版本的PyTorch
2. **模型量化**: 可以进一步优化模型大小和推理速度
3. **缓存**: 对于重复请求，可以实现结果缓存

## 许可证

本项目仅供学习和研究使用。 