import cv2
import numpy as np
import os
from PIL import Image
import random

def image_augmentation(image, augmentation_type, angle_range=(-15, 15), brightness_range=(0.7, 1.3)):
    """
    Enhanced image augmentation function with multiple techniques
    
    Args:
        image: Input image (numpy array)
        augmentation_type: Type of augmentation to apply
        angle_range: Range for rotation angles
        brightness_range: Range for brightness adjustment
    
    Returns:
        Augmented image
    """
    if augmentation_type == 'flip':
        return cv2.flip(image, 1)  # Horizontal flip
    
    elif augmentation_type == 'rotate':
        angle = np.random.randint(angle_range[0], angle_range[1] + 1)
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        return cv2.warpAffine(image, M, (w, h), borderMode=cv2.BORDER_REFLECT)
    
    elif augmentation_type == 'brightness':
        brightness_factor = np.random.uniform(brightness_range[0], brightness_range[1])
        return np.clip(image * brightness_factor, 0, 255).astype(np.uint8)
    
    elif augmentation_type == 'contrast':
        contrast_factor = np.random.uniform(0.8, 1.2)
        return np.clip(image * contrast_factor, 0, 255).astype(np.uint8)
    
    elif augmentation_type == 'noise':
        noise = np.random.normal(0, 25, image.shape).astype(np.uint8)
        return np.clip(image + noise, 0, 255).astype(np.uint8)
    
    elif augmentation_type == 'blur':
        kernel_size = random.choice([3, 5])
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)
    
    elif augmentation_type == 'sharpen':
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        return cv2.filter2D(image, -1, kernel)
    
    elif augmentation_type == 'zoom':
        scale = np.random.uniform(0.8, 1.2)
        h, w = image.shape[:2]
        new_h, new_w = int(h * scale), int(w * scale)
        resized = cv2.resize(image, (new_w, new_h))
        
        # Crop or pad to original size
        if scale > 1:
            # Crop from center
            start_h = (new_h - h) // 2
            start_w = (new_w - w) // 2
            return resized[start_h:start_h+h, start_w:start_w+w]
        else:
            # Pad with zeros
            pad_h = (h - new_h) // 2
            pad_w = (w - new_w) // 2
            result = np.zeros_like(image)
            result[pad_h:pad_h+new_h, pad_w:pad_w+new_w] = resized
            return result
    
    elif augmentation_type == 'color_jitter':
        # Random color adjustments
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        hsv[:,:,0] = hsv[:,:,0] * np.random.uniform(0.8, 1.2)  # Hue
        hsv[:,:,1] = hsv[:,:,1] * np.random.uniform(0.8, 1.2)  # Saturation
        hsv[:,:,2] = hsv[:,:,2] * np.random.uniform(0.8, 1.2)  # Value
        return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    
    elif augmentation_type == 'elastic_transform':
        # Simple elastic transformation
        alpha = np.random.uniform(0, 1)
        sigma = np.random.uniform(0, 1)
        h, w = image.shape[:2]
        
        # Create random displacement fields
        dx = np.random.randn(h, w) * sigma
        dy = np.random.randn(h, w) * sigma
        
        # Apply displacement
        x, y = np.meshgrid(np.arange(w), np.arange(h))
        x = x + dx * alpha
        y = y + dy * alpha
        
        # Ensure coordinates are within bounds
        x = np.clip(x, 0, w-1).astype(np.float32)
        y = np.clip(y, 0, h-1).astype(np.float32)
        
        return cv2.remap(image, x, y, cv2.INTER_LINEAR)
    
    return image  # Return original image if no valid augmentation type

def apply_multiple_augmentations(image, num_augmentations=3):
    """
    Apply multiple random augmentations to an image
    
    Args:
        image: Input image
        num_augmentations: Number of augmentations to apply
    
    Returns:
        List of augmented images
    """
    augmentation_types = [
        'flip', 'rotate', 'brightness', 'contrast', 'noise', 
        'blur', 'sharpen', 'zoom', 'color_jitter', 'elastic_transform'
    ]
    
    augmented_images = []
    
    for _ in range(num_augmentations):
        aug_type = random.choice(augmentation_types)
        augmented_img = image_augmentation(image, aug_type)
        augmented_images.append(augmented_img)
    
    return augmented_images

def augment_dataset(input_dir, output_dir, augmentations_per_image=3):
    """
    Augment all images in a directory
    
    Args:
        input_dir: Directory containing original images
        output_dir: Directory to save augmented images
        augmentations_per_image: Number of augmentations per image
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    supported_formats = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp')
    
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(supported_formats):
            # Load image
            img_path = os.path.join(input_dir, filename)
            image = cv2.imread(img_path)
            
            if image is None:
                print(f"Error loading {img_path}")
                continue
            
            # Apply augmentations
            augmented_images = apply_multiple_augmentations(image, augmentations_per_image)
            
            # Save original and augmented images
            base_name = os.path.splitext(filename)[0]
            
            # Save original
            cv2.imwrite(os.path.join(output_dir, f"{base_name}_original.jpg"), image)
            
            # Save augmented versions
            for i, aug_img in enumerate(augmented_images):
                aug_filename = f"{base_name}_aug_{i+1}.jpg"
                cv2.imwrite(os.path.join(output_dir, aug_filename), aug_img)
    
    print(f"Augmentation completed. Results saved to {output_dir}")

def augment_training_data(training_dir, output_dir, augmentations_per_image=3):
    """
    Augment training data while preserving class structure
    
    Args:
        training_dir: Directory containing training data with class subdirectories
        output_dir: Directory to save augmented training data
        augmentations_per_image: Number of augmentations per image
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    for class_name in os.listdir(training_dir):
        class_dir = os.path.join(training_dir, class_name)
        if os.path.isdir(class_dir):
            # Create output class directory
            output_class_dir = os.path.join(output_dir, class_name)
            if not os.path.exists(output_class_dir):
                os.makedirs(output_class_dir)
            
            print(f"Augmenting class: {class_name}")
            augment_dataset(class_dir, output_class_dir, augmentations_per_image)

# Example usage
if __name__ == "__main__":
    # Example: Augment a single image
    # image = cv2.imread("path/to/image.jpg")
    # augmented = image_augmentation(image, 'rotate')
    # cv2.imwrite("augmented_image.jpg", augmented)
    
    # Example: Augment entire training dataset
    # augment_training_data("path/to/training_data", "path/to/augmented_training_data", 3)
    
    print("Data augmentation functions ready to use!") 