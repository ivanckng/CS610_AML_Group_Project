#!/usr/bin/env python3
"""
Sneaker Recognition System Startup Script
This script helps you start the Flask API server and provides instructions for the web interface.
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = ['flask', 'torch', 'torchvision', 'pillow', 'numpy']
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'pillow':
                __import__('PIL')
            else:
                __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Please install missing packages using:")
        print("   pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def check_model_file():
    """Check if the model file exists"""
    model_path = Path("../model_bank/best_cnn_resnet50.pth")
    if not model_path.exists():
        print("❌ Model file not found:")
        print(f"   {model_path}")
        print("\n📁 Please ensure the model file exists in the model_bank directory")
        return False
    
    print("✅ Model file found")
    return True

def start_api_server():
    """Start the Flask API server"""
    print("\n🚀 Starting Flask API server...")
    print("   API will be available at: http://localhost:5000")
    print("   Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Start the Flask app
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Failed to start server: {e}")
        return False
    
    return True

def open_web_interface():
    """Open the web interface in browser"""
    web_path = Path("index.html")
    if web_path.exists():
        print(f"\n🌐 Opening web interface...")
        webbrowser.open(f"file://{web_path.absolute()}")
    else:
        print(f"\n❌ Web interface not found: {web_path}")

def main():
    """Main startup function"""
    print("=" * 60)
    print("🎯 Sneaker Recognition System")
    print("=" * 60)
    
    # Check dependencies
    print("\n📋 Checking dependencies...")
    if not check_dependencies():
        return
    
    # Check model file
    print("\n🔍 Checking model file...")
    if not check_model_file():
        return
    
    # Instructions
    print("\n📖 Instructions:")
    print("1. The Flask API server will start on http://localhost:5000")
    print("2. Open index.html in your browser")
    print("3. Upload a sneaker image and click 'Start to Identify'")
    print("4. The system will use the ResNet50 model to identify the sneaker")
    
    # Ask user if they want to start the server
    print("\n" + "=" * 60)
    response = input("🚀 Start the API server now? (y/n): ").lower().strip()
    
    if response in ['y', 'yes']:
        # Open web interface
        open_web_interface()
        
        # Start server
        start_api_server()
    else:
        print("\n📝 Manual startup instructions:")
        print("1. Run: python app.py")
        print("2. Open index.html in your browser")
        print("3. Start identifying sneakers!")

if __name__ == "__main__":
    main() 