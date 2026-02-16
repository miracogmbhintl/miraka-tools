# Video Downloader Backend Setup Guide

## 🎯 Overview

The Video Downloader frontend is ready, but requires a separate backend service to actually download videos. This is because:

- **yt-dlp** is a Python application requiring system binaries
- **Cloudflare Workers** only support JavaScript/WebAssembly
- Video processing requires more resources than Workers can provide

---

## 🚀 Quick Start (Railway.app - Recommended)

Railway offers the easiest deployment with a free tier.

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"

### Step 2: Deploy yt-dlp Backend

**Option A: Use Pre-built Docker Image**
```bash
# Create new project
# Select "Deploy Docker Image"
# Use: ghcr.io/marcopeocchi/yt-dlp-web-ui:latest
```

**Option B: Deploy Custom Backend**
1. Fork this repository: https://github.com/marcopeocchi/yt-dlp-web-ui
2. Connect it to Railway
3. Railway will auto-detect and deploy

### Step 3: Get Your API URL
1. After deployment, go to your Railway project
2. Click on "Settings" → "Domains"
3. Copy the generated URL (e.g., `https://your-app.up.railway.app`)

### Step 4: Configure Environment Variable
Add to your `.env` file:
```env
YTDLP_API_URL=https://your-app.up.railway.app
```

### Step 5: Enable Backend Integration
1. Open `src/pages/api/download-video.ts`
2. Uncomment the backend integration code (lines marked)
3. Deploy your changes

---

## 🔧 Alternative: Render.com (Free Tier)

### Step 1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Deploy as Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub account
3. Select the yt-dlp-web-ui repository
4. Configure:
   - **Name**: `yt-dlp-backend`
   - **Environment**: `Docker`
   - **Plan**: `Free`

### Step 3: Get Service URL
After deployment, copy your service URL (e.g., `https://yt-dlp-backend.onrender.com`)

### Step 4: Configure
```env
YTDLP_API_URL=https://yt-dlp-backend.onrender.com
```

**Note**: Free tier sleeps after 15min of inactivity (first request may be slow)

---

## 💰 Alternative: DigitalOcean App Platform ($5/month)

### Step 1: Create DigitalOcean Account
1. Go to [DigitalOcean.com](https://www.digitalocean.com)
2. Create an account

### Step 2: Create App
1. Click "Create" → "Apps"
2. Connect GitHub
3. Select yt-dlp repository
4. Choose **Basic** plan ($5/month)

### Step 3: Configure
```env
YTDLP_API_URL=https://your-app.ondigitalocean.app
```

---

## 🛠️ Custom Backend Setup (Advanced)

If you want to build your own backend from scratch:

### Simple Python Backend with Flask

**1. Create `backend/app.py`:**
```python
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
import uuid

app = Flask(__name__)
CORS(app)

DOWNLOAD_DIR = '/tmp/downloads'
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.route('/download', methods=['POST'])
def download_video():
    try:
        data = request.json
        url = data.get('url')
        format_type = data.get('format', 'mp4')
        quality = data.get('quality', 'best')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        
        # Configure yt-dlp options
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best' if format_type == 'mp4' else 'bestaudio',
            'outtmpl': f'{DOWNLOAD_DIR}/{file_id}.%(ext)s',
            'quiet': True,
        }
        
        if format_type == 'mp3':
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }]
        
        if quality != 'best' and format_type == 'mp4':
            ydl_opts['format'] = f'bestvideo[height<={quality}]+bestaudio/best[height<={quality}]'
        
        # Download video
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            # For mp3, update filename
            if format_type == 'mp3':
                filename = filename.rsplit('.', 1)[0] + '.mp3'
        
        return jsonify({
            'success': True,
            'downloadUrl': f'/files/{os.path.basename(filename)}',
            'filename': os.path.basename(filename)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/files/<filename>', methods=['GET'])
def serve_file(filename):
    try:
        file_path = os.path.join(DOWNLOAD_DIR, filename)
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**2. Create `backend/requirements.txt`:**
```txt
flask==3.0.0
flask-cors==4.0.0
yt-dlp==2024.1.1
```

**3. Create `backend/Dockerfile`:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

**4. Deploy to your platform of choice**

---

## 🔐 Security Considerations

### Rate Limiting
Add rate limiting to prevent abuse:
```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["10 per minute"]
)
```

### Authentication (Optional)
Add API key authentication:
```python
@app.before_request
def check_api_key():
    api_key = request.headers.get('X-API-Key')
    if api_key != os.environ.get('API_KEY'):
        return jsonify({'error': 'Unauthorized'}), 401
```

Then update your frontend API call to include the key.

---

## 🧪 Testing Your Backend

### Test with cURL:
```bash
curl -X POST https://your-backend-url/download \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format": "mp4",
    "quality": "720"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "downloadUrl": "/files/abc123.mp4",
  "filename": "video.mp4"
}
```

---

## 📊 Platform Comparison

| Platform | Cost | Setup Time | Performance | Auto-sleep |
|----------|------|------------|-------------|------------|
| **Railway.app** | Free tier available | 5 minutes | Fast | No |
| **Render.com** | Free tier available | 10 minutes | Medium | Yes (15min) |
| **DigitalOcean** | $5/month | 15 minutes | Fast | No |
| **Custom VPS** | $5-20/month | 30+ minutes | Variable | No |

---

## ✅ Final Checklist

- [ ] Backend deployed and running
- [ ] YTDLP_API_URL added to `.env`
- [ ] Backend integration code uncommented in `download-video.ts`
- [ ] Tested with a sample video URL
- [ ] Added to GitHub and deployed to Cloudflare

---

## 🆘 Troubleshooting

### "Backend not configured" error
- Make sure `YTDLP_API_URL` is in your `.env` file
- Rebuild and redeploy your Cloudflare app

### Downloads fail
- Check backend logs for errors
- Verify yt-dlp is installed correctly
- Ensure ffmpeg is installed (required for format conversion)

### Slow downloads
- Check your backend service plan
- Consider upgrading to paid tier for better performance

### CORS errors
- Ensure your backend has CORS enabled
- Add your Cloudflare domain to allowed origins

---

## 📚 Additional Resources

- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)
- [yt-dlp Web UI](https://github.com/marcopeocchi/yt-dlp-web-ui)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

---

**Need help?** Check the backend logs or contact support.
