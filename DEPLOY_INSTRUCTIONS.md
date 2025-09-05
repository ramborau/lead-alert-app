# 🚀 DigitalOcean Deployment Instructions

## Prerequisites
- DigitalOcean account
- GitHub repository with the code pushed
- Facebook Developer App configured

## Deployment Steps

### 1. Create GitHub Repository
```bash
# Create a new repository on GitHub named 'lead-alert-app'
# Then run these commands in your project directory:
git remote add origin https://github.com/YOUR_USERNAME/lead-alert-app.git
git push -u origin main
```

### 2. Deploy to DigitalOcean Apps

#### Option A: Using Web Console (Recommended for first deployment)

1. **Go to DigitalOcean Apps**: https://cloud.digitalocean.com/apps
2. **Create App**: Click "Create App"
3. **Connect GitHub**: 
   - Choose "GitHub" as source
   - Authorize DigitalOcean to access your repositories
   - Select your `lead-alert-app` repository
   - Choose `main` branch

4. **Configure App Settings**:
   - **Name**: `lead-alert-app`
   - **Region**: Choose closest to your users (e.g., NYC, SFO, AMS)
   - **Plan**: Basic ($5/month) - sufficient for testing
   - **Auto Deploy**: Enable (deploys on every push to main)

5. **Add Database**:
   - Click "Add Component" → "Database"
   - **Engine**: PostgreSQL
   - **Name**: `lead-alert-db`
   - **Version**: 14
   - **Plan**: Basic ($15/month)

6. **Environment Variables**:
   Set these in the App settings:
   ```
   NODE_ENV=production
   NEXTAUTH_URL=${APP_URL}
   NEXTAUTH_SECRET=your-secure-secret-32-chars-minimum
   DATABASE_URL=${lead-alert-db.DATABASE_URL}
   FACEBOOK_APP_ID=2198791380632171
   FACEBOOK_APP_SECRET=a64f04aa753414f538b3d9bc02cafcb8
   FACEBOOK_REDIRECT_URI=${APP_URL}/api/auth/facebook/callback
   ```

7. **Build & Run Commands**:
   - **Build Command**: `npm run build:production`
   - **Run Command**: `npm start`

#### Option B: Using CLI (Advanced)

```bash
# Install DigitalOcean CLI
brew install doctl  # macOS
# or
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Update the repo path in .do/app.yaml
# Change: repo: rahul/lead-alert-app
# To: repo: YOUR_USERNAME/lead-alert-app

# Deploy
doctl apps create --spec .do/app.yaml

# Monitor deployment
doctl apps list
doctl apps logs YOUR_APP_ID --follow
```

### 3. Configure Facebook App for Production

Once deployed, update your Facebook app settings:

1. **App Settings → Basic**:
   - Add your production domain to App Domains
   - Update Privacy Policy URL and Terms of Service URL

2. **Facebook Login → Settings**:
   - Add Valid OAuth Redirect URIs:
     ```
     https://your-app-name-xxxxx.ondigitalocean.app/api/auth/facebook/callback
     ```

3. **Webhooks**:
   - Callback URL: `https://your-app-name-xxxxx.ondigitalocean.app/api/webhooks/facebook`
   - Verify Token: Set a secure token and add it to your environment variables

### 4. Test Your Deployment

1. **Visit your app**: `https://your-app-name-xxxxx.ondigitalocean.app`
2. **Create account**: Register and test auto-login
3. **Test webhook**: Use the built-in webhook testing functionality
4. **Connect Facebook**: Test the OAuth flow

### 5. Environment Variables Reference

**Required Variables**:
```env
NODE_ENV=production
NEXTAUTH_URL=${APP_URL}
NEXTAUTH_SECRET=generate-secure-32-char-secret
DATABASE_URL=${lead-alert-db.DATABASE_URL}
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=${APP_URL}/api/auth/facebook/callback
```

**Optional Variables**:
```env
EMAIL_FROM=noreply@yourapp.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
```

### 6. Post-Deployment Checklist

- [ ] App builds and starts successfully
- [ ] Database connection works
- [ ] User registration/login works
- [ ] Facebook OAuth flow works
- [ ] Webhook testing functionality works
- [ ] All pages load correctly
- [ ] Environment variables are set correctly

### 7. Troubleshooting

**Common Issues**:

1. **Build failures**: 
   - Check build logs in DigitalOcean console
   - Ensure all dependencies are in `dependencies`, not `devDependencies`

2. **Database connection errors**:
   - Verify `DATABASE_URL` is set correctly
   - Check if database component is running

3. **Facebook OAuth errors**:
   - Verify redirect URI matches exactly
   - Check Facebook app permissions

**Useful Commands**:
```bash
# Get app info
doctl apps get YOUR_APP_ID

# View logs
doctl apps logs YOUR_APP_ID --type=build
doctl apps logs YOUR_APP_ID --type=run

# Update app
doctl apps update YOUR_APP_ID --spec .do/app.yaml
```

### 8. Scaling & Production Considerations

- **Database backups**: Enabled automatically
- **SSL certificates**: Provided automatically
- **Custom domains**: Available in DigitalOcean console
- **Monitoring**: Built-in metrics and alerting
- **Horizontal scaling**: Increase instance count for high traffic

## 🎉 Your Lead Alert App is now live!

After successful deployment, you'll have:
- ✅ Live application with custom domain
- ✅ Automatic HTTPS/SSL
- ✅ PostgreSQL database with backups
- ✅ Facebook lead capture capability
- ✅ Real-time webhook testing
- ✅ Auto-deployment on code changes

**Total monthly cost**: ~$20 ($5 app + $15 database)

For support or issues, check the DigitalOcean documentation or app logs.