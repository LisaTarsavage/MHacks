import torch
import requests
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import intel_extension_for_pytorch as ipex
from flask import Flask, request, jsonify

app = Flask(__name__)

# Set the device to Intel GPU
device = torch.device("xpu" if torch.xpu.is_available() else "cpu")

# Initialize the processor and model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-large"
)
# Optimize the model with IPEX
model = model.to(device)
model = ipex.optimize(model)

@app.route('/generate_caption', methods=['POST'])
def generate_caption():
    data = request.get_json()
    img_url = data.get('image_url')

    if not img_url:
        return jsonify({'error': 'No image URL provided'}), 400

    try:
        # Retrieve and process the image
        raw_image = Image.open(requests.get(img_url, stream=True).raw).convert('RGB')
    except Exception as e:
        return jsonify({'error': 'Could not retrieve or open image', 'details': str(e)}), 400

    # Unconditional image captioning
    inputs = processor(raw_image, return_tensors="pt").to(device)
    out = model.generate(**inputs)
    caption = processor.decode(out[0], skip_special_tokens=True)

    return jsonify({'caption': caption}), 200

if __name__ == '__main__':
    # Run the app on all interfaces, port 5000
    app.run(host='0.0.0.0', port=5000)