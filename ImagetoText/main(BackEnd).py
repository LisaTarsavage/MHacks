from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
import re


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    title: str = Form(...),
    url: str = Form(...)
):
    # Read the file content
    content = await file.read()
    html_content = content.decode('utf-8')

    # Process the data as needed
    print(f"Title: {title}")
    print(f"URL: {url}")
    print(f"HTML Content Length: {len(html_content)}")

    # Read the file content
    content = await file.read()
    html_content = content.decode('utf-8')
    
    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract all image URLs
    image_urls = [img['src'] for img in soup.find_all('img', src=True)]
    
    # Optional: If you want to filter for specific URLs or patterns, use re.
    # Example: Filter only .jpg or .png URLs
    image_urls = [url for url in image_urls if re.search(r'\.(jpg|png)$', url)]

    for i in image_urls:
        print(i)
    print(image_urls)
    print(html_content)

    # Return a success response
    return {"message": "Data received successfully", "title": title, "url": url}
