import requests

# Assuming the backend is running locally on port 8000
url = "http://localhost:8000/api/v1/careers/android-developer"
try:
    response = requests.get(url)
    print("STATUS:", response.status_code)
    print("RESPONSE JSON:", response.json())
except Exception as e:
    print("Error calling endpoint:", e)
