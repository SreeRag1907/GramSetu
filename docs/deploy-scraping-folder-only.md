# Railway Deployment - Scraping Folder Only

## Method 1: Create Separate Repository (Recommended)

### Step 1: Create New Repository for Scraper
```bash
# Create new directory
mkdir GramSetu-Scraper
cd GramSetu-Scraper

# Copy scraping files
cp -r ../GramSetu/scraping/* .

# Initialize git
git init
git add .
git commit -m "Initial scraper commit"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/GramSetu-Scraper.git
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to https://railway.app
2. Create new project
3. Connect the new scraper repository
4. Railway will detect Python and deploy automatically

## Method 2: Deploy from Subfolder (Current Repo)

### Update railway.toml for subfolder deployment:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python agmarknet_scraper.py"
healthcheckPath = "/health"

[env]
FLASK_ENV = "production"
CHROME_HEADLESS = "true"
```

### In Railway Dashboard:
1. Connect your main repository
2. Set **Root Directory** to: `scraping`
3. Set **Build Command** to: `pip install -r requirements.txt`
4. Set **Start Command** to: `python agmarknet_scraper.py`

## Method 3: Docker Deployment (Advanced)
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Copy only scraping folder
COPY scraping/ .

# Install requirements
RUN pip install -r requirements.txt

# Expose port
EXPOSE 5000

# Run the app
CMD ["python", "agmarknet_scraper.py"]
```