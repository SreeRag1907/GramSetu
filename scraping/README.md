# AGMARKNET Scraping Service

This directory contains the Flask-based web scraping service for getting real-time market prices from AGMARKNET.

## Setup

### Prerequisites
- Python 3.8+
- Chrome browser
- ChromeDriver (will be auto-managed by webdriver-manager)

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Service

```bash
python agmarknet_scraper.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Single Market Data Request
```
GET /request?state=Maharashtra&commodity=Wheat&market=Pune
```

Parameters:
- `state` (required): State name (e.g., "Maharashtra", "Punjab")
- `commodity` (required): Commodity name (e.g., "Wheat", "Rice", "Cotton")
- `market` (optional): Market name (if not provided, uses first available market)

### 3. Batch Market Data Request
```
POST /batch
Content-Type: application/json

[
  {
    "state": "Maharashtra",
    "commodity": "Wheat",
    "market": "Pune"
  },
  {
    "state": "Punjab", 
    "commodity": "Rice"
  }
]
```

### 4. Get Available Markets
```
GET /markets?state=Maharashtra&commodity=Wheat
```

## Response Format

```json
{
  "success": true,
  "data": [
    {
      "S.No": "1",
      "State": "Maharashtra",
      "District": "Pune",
      "Market": "Pune",
      "Commodity": "Wheat",
      "Variety": "Lokvan",
      "Grade": "FAQ",
      "Min Price": "2400",
      "Max Price": "2500", 
      "Modal Price": "2450",
      "Date": "19-Oct-2025",
      "Scraped At": "2025-10-26T10:30:00",
      "Unit": "Quintal"
    }
  ],
  "count": 1,
  "timestamp": "2025-10-26T10:30:00"
}
```

## Supported States and Commodities

### States
- Andhra Pradesh, Assam, Bihar, Chhattisgarh
- Gujarat, Haryana, Karnataka, Kerala
- Madhya Pradesh, Maharashtra, Odisha, Punjab
- Rajasthan, Tamil Nadu, Telangana, Uttar Pradesh, West Bengal

### Commodities
- Cereals: Rice, Wheat, Maize, Bajra, Jowar, Barley
- Pulses: Gram, Tur, Moong, Urad
- Oilseeds: Mustard, Groundnut, Soybean, Sunflower, Cotton
- Vegetables: Tomato, Onion, Potato
- Cash Crops: Sugarcane, Cotton

## Error Handling

The service includes comprehensive error handling for:
- Network timeouts
- Missing data
- Invalid parameters  
- Chrome driver issues
- Page loading problems

## Performance Notes

- Each request takes 10-15 seconds due to page loading times
- Batch requests include delays between calls to be respectful to the server
- The service runs headless Chrome for better performance
- Results are cached briefly to avoid duplicate requests

## Environment Variables

Set these in your environment or `.env` file:

```
CHROME_DRIVER_PATH=/path/to/chromedriver  # Optional, auto-detected
FLASK_ENV=production                      # For production deployment
```

## Deployment

For production deployment:

1. Use a production WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn agmarknet_scraper:app --bind 0.0.0.0:5000
```

2. Set up reverse proxy with Nginx
3. Use Docker for containerization
4. Set up monitoring and logging

## Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY agmarknet_scraper.py .

EXPOSE 5000

CMD ["python", "agmarknet_scraper.py"]
```

Build and run:
```bash
docker build -t agmarknet-scraper .
docker run -p 5000:5000 agmarknet-scraper
```