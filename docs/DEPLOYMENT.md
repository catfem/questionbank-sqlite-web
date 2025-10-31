# Deployment Guide

## Production Deployment

### Backend Deployment

#### Option 1: Using Gunicorn (Recommended for production)

1. Install production dependencies:
```bash
pip install gunicorn
```

2. Set environment variables:
```bash
export DATABASE_URL="postgresql://user:password@localhost/dbname"
export SECRET_KEY="your-production-secret-key"
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

3. Run with Gunicorn:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Option 2: Docker Deployment

Create `Dockerfile` for backend:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### Frontend Deployment

#### Build for Production:
```bash
cd frontend
npm run build
```

#### Option 1: Serve with Nginx

Create Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Option 2: Deploy to Vercel/Netlify

1. Build the frontend:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting platform
3. Configure API proxy to your backend URL

### Database Setup

#### Production with PostgreSQL

1. Install PostgreSQL adapter:
```bash
pip install psycopg2-binary
```

2. Update DATABASE_URL in environment:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
```

3. Run migrations:
```bash
alembic upgrade head
```

### Environment Variables for Production

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Strong random secret key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `ALLOWED_ORIGINS`: Your frontend domain(s)
- `FRONTEND_URL`: Your frontend URL for OAuth redirect

### SSL/HTTPS Configuration

1. Obtain SSL certificate (Let's Encrypt recommended)
2. Update Google OAuth redirect URI to use HTTPS
3. Configure Nginx/Apache with SSL

### Monitoring and Logging

#### Application Logging

Configure logging in backend:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/app.log'),
        logging.StreamHandler()
    ]
)
```

#### Health Checks

Add health check endpoint:
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Scaling Considerations

#### Horizontal Scaling

- Use load balancer (Nginx, HAProxy)
- Deploy multiple app instances
- Use external database (PostgreSQL, MySQL)
- Implement Redis for session storage

#### Vertical Scaling

- Increase worker processes: `gunicorn -w 8`
- Add more RAM/CPU as needed
- Optimize database queries

### Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **Database Security**: Use strong passwords, limit connections
3. **HTTPS**: Always use SSL in production
4. **CORS**: Configure only allowed origins
5. **Rate Limiting**: Implement API rate limiting
6. **Input Validation**: Validate all user inputs
7. **Dependencies**: Keep packages updated

### CI/CD Pipeline

#### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        pytest
    
    - name: Deploy to production
      run: |
        # Your deployment script here
```

### Backup Strategy

1. **Database Backups**: Daily automated backups
2. **File Backups**: Backup uploaded files
3. **Code Backups**: Use Git for version control
4. **Recovery Plan**: Document recovery procedures

### Performance Optimization

#### Backend

1. **Database Indexing**: Add indexes to frequently queried columns
2. **Caching**: Implement Redis caching
3. **Connection Pooling**: Use database connection pools
4. **Async Operations**: Use async/await for I/O operations

#### Frontend

1. **Code Splitting**: Implement lazy loading
2. **Image Optimization**: Compress and optimize images
3. **Bundle Size**: Minimize JavaScript bundle
4. **CDN**: Use CDN for static assets

### Troubleshooting Production Issues

#### Common Problems

1. **Database Connection Errors**
   - Check connection string
   - Verify database server is running
   - Check firewall settings

2. **OAuth Redirect Errors**
   - Verify redirect URI in Google Console
   - Check CORS configuration
   - Ensure HTTPS is used

3. **File Upload Issues**
   - Check file permissions
   - Verify upload directory exists
   - Check file size limits

4. **Performance Issues**
   - Monitor database queries
   - Check server resources
   - Analyze slow requests

#### Monitoring Tools

- **Application Monitoring**: Sentry, New Relic
- **Server Monitoring**: Prometheus, Grafana
- **Log Analysis**: ELK Stack, Splunk
- **Error Tracking**: Bugsnag, Rollbar