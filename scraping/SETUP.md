# AGMARKNET Scraping Service Setup

## Prerequisites

1. **Python 3.8+** - Make sure Python is installed on your system
2. **Chrome Browser** - Required for Selenium WebDriver
3. **Internet Connection** - For downloading ChromeDriver and accessing AGMARKNET

## Installation Steps

### 1. Navigate to the scraping directory
```bash
cd d:\PROJECTS\GramSetu\scraping
```

### 2. Create a Python virtual environment (recommended)
```bash
python -m venv venv
```

### 3. Activate the virtual environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install required packages
```bash
pip install -r requirements.txt
```

### 5. Install ChromeDriver (automatic)
The script will automatically download and manage ChromeDriver, but you can also install it manually:
- Download from: https://chromedriver.chromium.org/
- Place in your system PATH

## Running the Service

### 1. Start the Flask API server
```bash
python agmarknet_scraper.py
```

The server will start on `http://localhost:5000`

### 2. Test the API health
Open your browser and visit: `http://localhost:5000/health`

You should see:
```json
{
  "status": "healthy",
  "message": "AGMARKNET scraping service is running"
}
```

## API Endpoints

### Health Check
- **URL:** `GET /health`
- **Response:** Service status

### Single Market Request
- **URL:** `GET /request?state={state}&commodity={commodity}&market={market}`
- **Example:** `GET /request?state=Maharashtra&commodity=Wheat&market=Pune`

### Batch Processing
- **URL:** `POST /batch`
- **Body:** Array of requests
```json
[
  {
    "state": "Maharashtra",
    "commodity": "Wheat",
    "market": "Pune"
  },
  {
    "state": "Punjab",
    "commodity": "Rice",
    "market": "Ludhiana"
  }
]
```

### Get Available Markets
- **URL:** `GET /markets?state={state}`
- **Example:** `GET /markets?state=Maharashtra`

### Get Available Commodities
- **URL:** `GET /commodities`
- **Response:** List of all available commodities

## Configuration

### Environment Variables
Create a `.env` file in the scraping directory:

```env
# Flask configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Chrome options
CHROME_HEADLESS=True
CHROME_NO_SANDBOX=True

# Request timeouts
REQUEST_TIMEOUT=30
BATCH_TIMEOUT=60

# Logging level
LOG_LEVEL=INFO
```

### React Native App Configuration
In your React Native app, set the Flask API URL in your environment:

```env
EXPO_PUBLIC_FLASK_API_URL=http://192.168.1.100:5000
```

Replace `192.168.1.100` with your computer's actual IP address.

## Troubleshooting

### 1. ChromeDriver Issues
- **Error:** "ChromeDriver not found"
- **Solution:** The script will auto-download ChromeDriver. If issues persist, manually download and add to PATH.

### 2. Permission Issues (Windows)
- **Error:** "Access denied" when downloading ChromeDriver
- **Solution:** Run command prompt as Administrator

### 3. Network Issues
- **Error:** "Unable to reach AGMARKNET"
- **Solution:** Check internet connection and try again. The site may be temporarily down.

### 4. Memory Issues
- **Error:** "Out of memory"
- **Solution:** Reduce batch size or add more system RAM

### 5. React Native Connection Issues
- **Error:** "Network request failed"
- **Solution:** 
  - Make sure Flask server is running
  - Check if IP address is correct
  - Ensure firewall allows connections to port 5000

## Performance Tips

1. **Batch Processing:** Use batch requests for multiple commodities to reduce overhead
2. **Caching:** Results are cached for 5 minutes to avoid repeated requests
3. **Rate Limiting:** Built-in delays prevent overwhelming the AGMARKNET server
4. **Error Handling:** Automatic retries with exponential backoff

## Development

### Running in Development Mode
```bash
python agmarknet_scraper.py --debug
```

### Logs
Check the console output for detailed logging of all scraping activities.

### Testing
Test individual endpoints using tools like Postman or curl:

```bash
curl http://localhost:5000/health
curl "http://localhost:5000/request?state=Maharashtra&commodity=Wheat&market=Pune"
```

## Production Deployment

For production deployment:

1. Set `FLASK_ENV=production`
2. Use a proper WSGI server like Gunicorn
3. Configure proper logging
4. Set up process monitoring
5. Use environment variables for sensitive configuration

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 agmarknet_scraper:app
```

## Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all prerequisites are installed
3. Test the API endpoints individually
4. Check network connectivity to AGMARKNET
5. Ensure Chrome browser is up to date

For more help, refer to the error messages in the console output which provide detailed debugging information.