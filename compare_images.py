import sys
import requests
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim

def download_image(url):
    response = requests.get(url, stream=True)
    response.raise_for_status()
    file_name = 'temp_server_image.jpg'
    with open(file_name, 'wb') as out_file:
        out_file.write(response.content)
    return file_name

def compare_images(local_image_path, server_image_url):
    # Download server image
    server_image_path = download_image(server_image_url)

    # Load images
    local_image = cv2.imread(local_image_path)
    server_image = cv2.imread(server_image_path)

    # Convert images to grayscale
    local_gray = cv2.cvtColor(local_image, cv2.COLOR_BGR2GRAY)
    server_gray = cv2.cvtColor(server_image, cv2.COLOR_BGR2GRAY)

    # Compute Structural Similarity Index (SSIM)
    score, _ = ssim(local_gray, server_gray, full=True)
    return score

if __name__ == "__main__":
    local_image_path = sys.argv[1]
    server_image_url = sys.argv[2]
    similarity = compare_images(local_image_path, server_image_url)
    print(similarity)
