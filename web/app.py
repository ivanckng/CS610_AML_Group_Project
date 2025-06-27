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

# Global variables
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_names = None
val_test_transform = None

def load_model():
    """Load pre-trained ResNet50 model"""
    global model, class_names, val_test_transform
    
    # Define class names (from new_cnn.ipynb)
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
    
    # Define validation/test transforms (from new_cnn.ipynb)
    val_test_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  # ImageNet normalization
    ])
    
    # Create ResNet50 model
    model = models.resnet50(pretrained=False)
    model.fc = nn.Linear(model.fc.in_features, len(class_names))
    
    # Load trained weights
    model_path = '../model_bank/best_cnn_resnet50.pth'
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        print(f"Model loaded from {model_path}")
    else:
        print(f"Warning: Model file {model_path} does not exist")
        return False
    
    model = model.to(device)
    model.eval()
    print(f"Model loaded on device: {device}")
    return True

def preprocess_image(image_data):
    """Preprocess image data"""
    try:
        # Decode base64 image data
        if image_data.startswith('data:image'):
            # Remove data URL prefix
            image_data = image_data.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB (handle RGBA etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Apply preprocessing transforms
        image_tensor = val_test_transform(image)
        
        # Add batch dimension
        image_tensor = image_tensor.unsqueeze(0)
        
        return image_tensor.to(device)
    
    except Exception as e:
        print(f"Image preprocessing error: {str(e)}")
        return None

def predict_shoe(image_tensor):
    """Make prediction using the model"""
    try:
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            
            # Get highest probability class
            predicted_class = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_class].item()
            
            # Get class name
            predicted_class_name = class_names[predicted_class]
            
            return {
                'predicted_class': predicted_class_name,
                'confidence': confidence
            }
    
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return None

@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'Missing image data'}), 400
        
        image_data = data['image']
        
        # Preprocess image
        image_tensor = preprocess_image(image_data)
        if image_tensor is None:
            return jsonify({'error': 'Image preprocessing failed'}), 400
        
        # Make prediction
        result = predict_shoe(image_tensor)
        if result is None:
            return jsonify({'error': 'Prediction failed'}), 500
        
        # Format response
        response = {
            'success': True,
            'prediction': {
                'shoeModel': result['predicted_class'],
                'confidence': result['confidence'] * 100  # Convert to percentage
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"API error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': str(device)
    })

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'Sneaker Recognition API',
        'endpoints': {
            'POST /predict': 'Predict sneaker type',
            'GET /health': 'Health check'
        }
    })

if __name__ == '__main__':
    # Load model
    if load_model():
        print("🚀 Sneaker Recognition API starting...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("❌ Model loading failed, cannot start API") 