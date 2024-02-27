import asyncio
from pyppeteer import launch
import aiohttp
import os
from urllib.parse import urlparse, urljoin
import ssl  # Import the SSL module for SSL context

async def fetch_and_download_resources(url, download_dir):
    # Ensure download directory exists
    if not os.path.exists(download_dir):
        os.makedirs(download_dir)

    # Launch the browser
    browser = await launch()
    page = await browser.newPage()

    # Navigate to the page
    await page.goto(url, {'waitUntil': 'networkidle2'})

    # Get the page HTML content and save it
    html_content = await page.content()
    html_filename = "index.html"
    with open(os.path.join(download_dir, html_filename), 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"Downloaded HTML content to {html_filename}")

    # JavaScript function as a string to get all resource URLs on the page
    extract_resources_js = """
    () => {
        const tags = document.querySelectorAll('link[href], script[src], img[src], video[src], audio[src], source[src]');
        const links = Array.from(tags).map(tag => tag.src || tag.href).filter(url => url);
        return links;
    }
    """

    # Evaluate the JavaScript function in the context of the page
    resource_urls = await page.evaluate(extract_resources_js)

    await browser.close()

    # Create a custom SSL context that does not verify certificates
    ssl_context = ssl._create_unverified_context()

    # Download each resource
    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
        tasks = [download_resource(session, resource_url, download_dir) for resource_url in resource_urls]
        await asyncio.gather(*tasks)

async def download_resource(session, resource_url, download_dir):
    try:
        # Handle relative URLs
        parsed_url = urlparse(resource_url)
        if not parsed_url.netloc:
            print(f"Skipping relative URL (consider prepending the base URL): {resource_url}")
            return

        async with session.get(resource_url) as response:
            filename = os.path.basename(parsed_url.path)
            if not filename:
                print(f"Could not extract filename for URL: {resource_url}")
                return
            filepath = os.path.join(download_dir, filename)
            with open(filepath, 'wb') as file:
                while True:
                    chunk = await response.content.read(1024)
                    if not chunk:
                        break
                    file.write(chunk)
            print(f"Downloaded {resource_url} to {filepath}")
    except Exception as e:
        print(f"Error downloading {resource_url}: {str(e)}")

# The URL of the website to crawl
url = 'https://173-230-150-221.ip.linodeusercontent.com:3000/demos/butcher/index.html'

# Directory to save the downloaded resources
download_dir = os.getcwd()  # Current working directory

# Run the script
asyncio.run(fetch_and_download_resources(url, download_dir))