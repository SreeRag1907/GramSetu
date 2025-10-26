from flask import Flask, request, jsonify
import json
import time
import requests
import os
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_chrome_driver():
    """Setup Chrome driver with appropriate options for Railway deployment"""
    chrome_options = Options()
    
    # Essential options for Railway/Linux environment
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-software-rasterizer")
    chrome_options.add_argument("--disable-background-timer-throttling")
    chrome_options.add_argument("--disable-backgrounding-occluded-windows")
    chrome_options.add_argument("--disable-renderer-backgrounding")
    chrome_options.add_argument("--disable-features=TranslateUI")
    chrome_options.add_argument("--disable-ipc-flooding-protection")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # Memory and performance optimizations
    chrome_options.add_argument("--memory-pressure-off")
    chrome_options.add_argument("--max_old_space_size=4096")
    chrome_options.add_argument("--single-process")
    
    # Additional stability options
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-plugins")
    chrome_options.add_argument("--disable-images")
    chrome_options.add_argument("--disable-javascript")
    
    try:
        # Use webdriver-manager to automatically handle ChromeDriver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        
        logger.info("ChromeDriver setup successful")
        return driver
        
    except Exception as e:
        logger.error(f"Failed to setup Chrome driver: {e}")
        
        # Fallback: try without service (for local development)
        try:
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(30)
            driver.implicitly_wait(10)
            logger.info("ChromeDriver setup successful (fallback)")
            return driver
        except Exception as fallback_error:
            logger.error(f"Fallback ChromeDriver setup also failed: {fallback_error}")
            raise Exception(f"Could not setup ChromeDriver: {e}, Fallback: {fallback_error}")

def close_popup(driver):
    """Close any popup that might appear on the page"""
    try:
        # Wait for popup to appear and close it
        popup = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'popup-onload'))
        )
        close_button = popup.find_element(By.CLASS_NAME, 'close')
        close_button.click()
        logger.info("Popup closed")
        time.sleep(1)
    except (NoSuchElementException, TimeoutException):
        logger.info("No popup found")

def get_available_markets(driver, state, commodity):
    """Get available markets for the given state and commodity"""
    try:
        # Select commodity first
        commodity_dropdown = Select(driver.find_element(By.ID, 'ddlCommodity'))
        commodity_dropdown.select_by_visible_text(commodity)
        time.sleep(2)
        
        # Select state
        state_dropdown = Select(driver.find_element(By.ID, 'ddlState'))
        state_dropdown.select_by_visible_text(state)
        time.sleep(2)
        
        # Set date to 7 days ago
        today = datetime.now()
        desired_date = today - timedelta(days=7)
        date_input = driver.find_element(By.ID, "txtDate")
        date_input.clear()
        date_input.send_keys(desired_date.strftime('%d-%b-%Y'))
        
        # Click Go to load markets
        go_button = driver.find_element(By.ID, 'btnGo')
        go_button.click()
        time.sleep(3)
        
        # Get available markets
        market_dropdown = Select(driver.find_element(By.ID, 'ddlMarket'))
        markets = [option.text for option in market_dropdown.options if option.text.strip()]
        
        return markets[1:] if len(markets) > 1 else []  # Skip first empty option
        
    except Exception as e:
        logger.error(f"Error getting markets: {e}")
        return []

def scrape_market_data(state, commodity, market=None):
    """Main scraping function"""
    logger.info(f"Starting scrape for State: {state}, Commodity: {commodity}, Market: {market}")
    
    initial_url = "https://agmarknet.gov.in/SearchCmmMkt.aspx"
    driver = None
    
    try:
        driver = setup_chrome_driver()
        driver.get(initial_url)
        
        # Close popup if present
        close_popup(driver)
        
        # If no specific market provided, get the first available market
        if not market:
            available_markets = get_available_markets(driver, state, commodity)
            if not available_markets:
                raise Exception("No markets available for the given state and commodity")
            market = available_markets[0]
            logger.info(f"Using market: {market}")
        
        # Start fresh - reload page
        driver.get(initial_url)
        close_popup(driver)
        
        # Select commodity
        logger.info("Selecting commodity...")
        commodity_dropdown = Select(driver.find_element(By.ID, 'ddlCommodity'))
        commodity_dropdown.select_by_visible_text(commodity)
        time.sleep(2)

        # Select state
        logger.info("Selecting state...")
        state_dropdown = Select(driver.find_element(By.ID, 'ddlState'))
        state_dropdown.select_by_visible_text(state)
        time.sleep(2)

        # Set date
        logger.info("Setting date...")
        today = datetime.now()
        desired_date = today - timedelta(days=7)
        date_input = driver.find_element(By.ID, "txtDate")
        date_input.clear()
        date_input.send_keys(desired_date.strftime('%d-%b-%Y'))

        # First Go click
        logger.info("First Go click...")
        go_button = driver.find_element(By.ID, 'btnGo')
        go_button.click()
        time.sleep(3)

        # Select market
        logger.info(f"Selecting market: {market}")
        market_dropdown = Select(driver.find_element(By.ID, 'ddlMarket'))
        market_dropdown.select_by_visible_text(market)

        # Second Go click
        logger.info("Second Go click...")
        go_button = driver.find_element(By.ID, 'btnGo')
        go_button.click()

        # Wait for table to load
        logger.info("Waiting for data table...")
        table = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, 'cphBody_GridPriceData'))
        )

        # Parse the page
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Extract data from table
        data_list = []
        table_rows = soup.find_all("tr")
        
        if len(table_rows) < 5:
            logger.warning("No data rows found in table")
            return []
        
        for row in table_rows:
            row_data = row.text.replace("\n", "_").replace("  ", "").split("__")
            if len(row_data) > 1:  # Filter out empty rows
                data_list.append(row_data)

        # Convert to JSON format
        json_list = []
        for i, row_data in enumerate(data_list[4:len(data_list) - 1]):  # Skip header and footer
            if len(row_data) >= 11:  # Ensure we have enough columns
                try:
                    price_data = {
                        "S.No": row_data[1] if len(row_data) > 1 else str(i+1),
                        "State": state,
                        "District": row_data[2] if len(row_data) > 2 else "",
                        "Market": market,
                        "Commodity": row_data[4] if len(row_data) > 4 else commodity,
                        "Variety": row_data[5] if len(row_data) > 5 else "",
                        "Grade": row_data[6] if len(row_data) > 6 else "",
                        "Min Price": clean_price(row_data[7]) if len(row_data) > 7 else "0",
                        "Max Price": clean_price(row_data[8]) if len(row_data) > 8 else "0", 
                        "Modal Price": clean_price(row_data[9]) if len(row_data) > 9 else "0",
                        "Date": row_data[10] if len(row_data) > 10 else desired_date.strftime('%d-%b-%Y'),
                        "Scraped At": datetime.now().isoformat(),
                        "Unit": "Quintal"
                    }
                    
                    # Only add if we have valid price data
                    if float(price_data["Modal Price"] or 0) > 0:
                        json_list.append(price_data)
                        
                except (ValueError, IndexError) as e:
                    logger.warning(f"Error parsing row {i}: {e}")
                    continue

        logger.info(f"Successfully scraped {len(json_list)} records")
        return json_list

    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        raise
    finally:
        if driver:
            driver.quit()

def clean_price(price_str):
    """Clean and validate price strings"""
    if not price_str:
        return "0"
    
    # Remove non-numeric characters except decimal points
    cleaned = ''.join(c for c in str(price_str) if c.isdigit() or c == '.')
    
    try:
        return str(float(cleaned)) if cleaned else "0"
    except ValueError:
        return "0"

def get_batch_market_data(requests_data):
    """Get market data for multiple requests"""
    all_results = []
    
    for req in requests_data:
        try:
            state = req.get('state')
            commodity = req.get('commodity') 
            market = req.get('market')
            
            if not state or not commodity:
                continue
                
            result = scrape_market_data(state, commodity, market)
            all_results.extend(result)
            
            # Add delay between requests to be respectful
            time.sleep(3)
            
        except Exception as e:
            logger.error(f"Error processing request {req}: {e}")
            continue
    
    return all_results

# Flask app
app = Flask(__name__)

@app.route('/', methods=['GET'])
def home_page():
    """Home page with API documentation"""
    documentation = {
        "service": "AGMARKNET Market Price Scraper",
        "version": "1.0.0",
        "endpoints": {
            "/": "This documentation",
            "/health": "Health check",
            "/request": "Get market data for single commodity",
            "/batch": "Get market data for multiple commodities",
            "/markets": "Get available markets for state and commodity"
        },
        "usage": {
            "single_request": "/request?state=Maharashtra&commodity=Wheat&market=Pune",
            "batch_request": "/batch (POST with JSON array)",
            "get_markets": "/markets?state=Maharashtra&commodity=Wheat"
        },
        "timestamp": datetime.now().isoformat()
    }
    return jsonify(documentation)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AGMARKNET Scraper",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/request', methods=['GET'])
def single_request():
    """Handle single market data request"""
    commodity = request.args.get('commodity')
    state = request.args.get('state')
    market = request.args.get('market')

    if not commodity or not state:
        return jsonify({
            "error": "Missing required parameters",
            "required": ["state", "commodity"],
            "optional": ["market"]
        }), 400

    try:
        json_data = scrape_market_data(state, commodity, market)
        
        response = {
            "success": True,
            "data": json_data,
            "count": len(json_data),
            "timestamp": datetime.now().isoformat(),
            "request": {
                "state": state,
                "commodity": commodity,
                "market": market
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/batch', methods=['POST'])
def batch_request():
    """Handle batch market data requests"""
    try:
        requests_data = request.get_json()
        
        if not requests_data or not isinstance(requests_data, list):
            return jsonify({
                "error": "Invalid request format. Expected JSON array of requests."
            }), 400
        
        results = get_batch_market_data(requests_data)
        
        return jsonify({
            "success": True,
            "data": results,
            "count": len(results),
            "requests_processed": len(requests_data),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/markets', methods=['GET'])
def get_markets():
    """Get available markets for a state and commodity"""
    state = request.args.get('state')
    commodity = request.args.get('commodity')
    
    if not state or not commodity:
        return jsonify({
            "error": "Missing required parameters: state and commodity"
        }), 400
    
    driver = None
    try:
        driver = setup_chrome_driver()
        driver.get("https://agmarknet.gov.in/SearchCmmMkt.aspx")
        close_popup(driver)
        
        markets = get_available_markets(driver, state, commodity)
        
        return jsonify({
            "success": True,
            "state": state,
            "commodity": commodity,
            "markets": markets,
            "count": len(markets),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500
    finally:
        if driver:
            driver.quit()

if __name__ == '__main__':
    logger.info("Starting AGMARKNET Scraping Service...")
    
    # Get port from environment variable (for cloud deployment)
    port = int(os.environ.get('PORT', 5000))
    
    # Set debug mode based on environment
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    
    # Run the app
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=port,
        debug=debug_mode,
        threaded=True  # Enable threading for better performance
    )