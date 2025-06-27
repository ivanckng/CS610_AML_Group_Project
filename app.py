from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import base64
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# 全局变量
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_names = None
val_test_transform = None

def load_model():
    """加载预训练的ResNet50模型"""
    global model, class_names, val_test_transform
    
    # 定义类别名称（从new_cnn.ipynb中获取）
    class_names = [
        'adidas_forum_high', 'adidas_forum_low', 'adidas_gazelle', 'adidas_nmd_r1', 
        'adidas_samba', 'adidas_stan_smith', 'adidas_superstar', 'adidas_ultraboost', 
        'asics_gel-lyte_iii', 'converse_chuck_70_high', 'converse_chuck_70_low', 
        'converse_chuck_taylor_all-star_high', 'converse_chuck_taylor_all-star_low', 
        'converse_one_star', 'new_balance_327', 'new_balance_550', 'new_balance_574', 
        'new_balance_990', 'new_balance_992', 'nike_air_force_1_high', 'nike_air_force_1_low', 
        'nike_air_force_1_mid', 'nike_air_jordan_11', 'nike_air_jordan_1_high', 
        'nike_air_jordan_1_low', 'nike_air_jordan_3', 'nike_air_jordan_4', 'nike_air_max_1', 
        'nike_air_max_270', 'nike_air_max_90', 'nike_air_max_95', 'nike_air_max_97', 
        'nike_air_max_plus_(tn)', 'nike_air_vapormax_flyknit', 'nike_air_vapormax_plus', 
        'nike_blazer_mid_77', 'nike_cortez', 'nike_dunk_high', 'nike_dunk_low', 
        'puma_suede_classic', 'reebok_classic_leather', 'reebok_club_c_85', 'salomon_xt-6', 
        'vans_authentic', 'vans_old_skool', 'vans_sk8-hi', 'vans_slip-on_checkerboard', 
        'yeezy_700_wave_runner', 'yeezy_boost_350_v2', 'yeezy_slide'
    ]
    
    # 定义验证/测试转换（从new_cnn.ipynb中获取）
    val_test_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  # ImageNet标准化
    ])
    
    # 创建ResNet50模型
    model = models.resnet50(pretrained=False)
    model.fc = nn.Linear(model.fc.in_features, len(class_names))
    
    # 加载训练好的权重
    model_path = 'model_bank/best_cnn_resnet50.pth'
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        print(f"模型已从 {model_path} 加载")
    else:
        print(f"警告：模型文件 {model_path} 不存在")
        return False
    
    model = model.to(device)
    model.eval()
    print(f"模型已加载到设备: {device}")
    return True

def preprocess_image(image_data):
    """预处理图像数据"""
    try:
        # 解码base64图像数据
        if image_data.startswith('data:image'):
            # 移除data URL前缀
            image_data = image_data.split(',')[1]
        
        # 解码base64
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # 转换为RGB（处理RGBA等格式）
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # 应用预处理转换
        image_tensor = val_test_transform(image)
        
        # 添加batch维度
        image_tensor = image_tensor.unsqueeze(0)
        
        return image_tensor.to(device)
    
    except Exception as e:
        print(f"图像预处理错误: {str(e)}")
        return None

def predict_shoe(image_tensor):
    """使用模型进行预测"""
    try:
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            
            # 获取最高概率的类别
            predicted_class = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_class].item()
            
            # 获取类别名称
            predicted_class_name = class_names[predicted_class]
            
            # 获取前5个预测结果
            top5_probs, top5_indices = torch.topk(probabilities[0], 5)
            top5_results = []
            
            for i in range(5):
                top5_results.append({
                    'class': class_names[top5_indices[i].item()],
                    'confidence': top5_probs[i].item()
                })
            
            return {
                'predicted_class': predicted_class_name,
                'confidence': confidence,
                'top5_predictions': top5_results
            }
    
    except Exception as e:
        print(f"预测错误: {str(e)}")
        return None

@app.route('/predict', methods=['POST'])
def predict():
    """预测端点"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': '缺少图像数据'}), 400
        
        image_data = data['image']
        
        # 预处理图像
        image_tensor = preprocess_image(image_data)
        if image_tensor is None:
            return jsonify({'error': '图像预处理失败'}), 400
        
        # 进行预测
        result = predict_shoe(image_tensor)
        if result is None:
            return jsonify({'error': '预测失败'}), 500
        
        # 格式化响应
        response = {
            'success': True,
            'prediction': {
                'shoeModel': result['predicted_class'],
                'confidence': result['confidence'] * 100,  # 转换为百分比
                'top5_predictions': result['top5_predictions']
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"API错误: {str(e)}")
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': str(device)
    })

@app.route('/', methods=['GET'])
def index():
    """根端点"""
    return jsonify({
        'message': 'Sneaker Recognition API',
        'endpoints': {
            'POST /predict': '预测鞋类',
            'GET /health': '健康检查'
        }
    })

if __name__ == '__main__':
    # 加载模型
    if load_model():
        print("🚀 Sneaker Recognition API 启动中...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("❌ 模型加载失败，无法启动API") 