from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import UnexpectedAlertPresentException
import time
import os

# URL and image folder setup
url = "https://babla45.github.io/beautiful-images"
image_folder = "C:/Users/babla/Desktop/Projects/beautiful_images/images2"

# Initialize WebDriver
driver = webdriver.Chrome()  # Ensure your WebDriver is properly configured
driver.get(url)  # Navigate to the website

# Wait for the page to load
time.sleep(1.5)

# Function to upload images
def upload_image(image_path):
    try:
        # Locate the file input element
        image_upload = driver.find_element(By.ID, "imageUpload")

        # Send the image path to the file input element
        image_upload.send_keys(image_path)

        # Locate and click the upload button after selecting the file
        upload_button = driver.find_element(By.ID, "uploadButton")
        upload_button.click()

        # Wait for the upload to complete (adjust timing as needed)
        time.sleep(3)

    except UnexpectedAlertPresentException as e:
        # Handle unexpected alerts and close them
        alert = driver.switch_to.alert
        print(f"Alert detected: {alert.text}")
        alert.accept()  # Close the alert
        print(f"Handled alert for image: {image_path}")

# Iterate through each image in the folder
i=1
for filename in os.listdir(image_folder):
    if filename.endswith(".jpg") or filename.endswith(".png") or filename.endswith(".jpeg"):  # Adjust file extensions as needed
        image_path = os.path.join(image_folder, filename)
        upload_image(image_path)
        print(f"Uploaded: {filename}, total uploaded ({i}) images")
        i=i+1
    else:
        continue

# Close the WebDriver session
time.sleep(5)
driver.quit()
