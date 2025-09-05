# Lead Alert App - DigitalOcean Deployment Guide

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **DigitalOcean Account**: Sign up at digitalocean.com
3. **Facebook Developer App**: Ensure your Facebook app is configured for production

## Deployment Steps

### 1. Prepare Environment Variables

Set up the following environment variables in DigitalOcean Apps:

```bash
# Core App Configuration
NODE_ENV=production
NEXTAUTH_URL=${APP_URL}
NEXTAUTH_SECRET=your-secure-nextauth-secret-min-32-characters

# Database (Provided by DigitalOcean)
DATABASE_URL=${lead-alert-db.DATABASE_URL}

# Facebook Integration
FACEBOOK_APP_ID=2198791380632171
FACEBOOK_APP_SECRET=a64f04aa753414f538b3d9bc02cafcb8
FACEBOOK_REDIRECT_URI=${APP_URL}/api/auth/facebook/callback

# Optional Email Configuration
EMAIL_FROM=noreply@yourapp.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Deploy Using DigitalOcean CLI (Recommended)

```bash
# Install DigitalOcean CLI
brew install doctl  # macOS
# or
snap install doctl  # Ubuntu

# Authenticate
doctl auth init

# Deploy using app spec
doctl apps create --spec .do/app.yaml

# Monitor deployment
doctl apps list
doctl apps logs <app-id> --follow
```

### 3. Deploy Using Web Console

1. **Create New App**:
   - Go to Apps section in DigitalOcean
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - Build Command: `npm run build:production`
   - Run Command: `npm start`
   - Environment: Node.js

3. **Add Database**:
   - Add PostgreSQL database component
   - Name: `lead-alert-db`
   - Version: 14

4. **Set Environment Variables**:
   - Add all required environment variables listed above
   - Use `${APP_URL}` for app URL references
   - Use `${lead-alert-db.DATABASE_URL}` for database connection

### 4. Configure Facebook App for Production

Update your Facebook app settings:

1. **Valid OAuth Redirect URIs**:
   ```
   https://your-app-domain.ondigitalocean.app/api/auth/facebook/callback
   ```

2. **Webhook Settings**:
   ```
   Callback URL: https://your-app-domain.ondigitalocean.app/api/webhooks/facebook
   Verify Token: your-webhook-verify-token
   ```

3. **App Review**:
   - Submit for review to access live data
   - Required permissions: `pages_manage_metadata`, `email`, `public_profile`

### 5. Post-Deployment Setup

1. **Database Migration**:
   ```bash
   # Migrations run automatically via postinstall script
   # If needed manually:
   doctl apps run <app-id> --command "npm run db:migrate"
   ```

2. **Test Webhook**:
   - Navigate to your app's dashboard
   - Use the "Test Webhook" button to verify functionality
   - Check logs: `doctl apps logs <app-id> --type=run`

3. **SSL Certificate**:
   - Automatically provided by DigitalOcean Apps
   - Custom domain setup available in console

### 6. Monitoring and Maintenance

1. **Application Logs**:
   ```bash
   doctl apps logs <app-id> --follow --type=run
   ```

2. **Health Checks**:
   - Automatic health checks on root path `/`
   - Manual health check: `curl https://your-app.ondigitalocean.app/api/test/webhook`

3. **Database Backups**:
   - Automatic daily backups enabled
   - Manual backup: Available in DigitalOcean console

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs: `doctl apps logs <app-id> --type=build`
   - Ensure all dependencies are in `dependencies` not `devDependencies`

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` environment variable
   - Check database component is running

3. **Facebook Integration Issues**:
   - Verify redirect URI matches exactly
   - Check app permissions are approved
   - Ensure webhook URL is accessible from Facebook

### Useful Commands

```bash
# App management
doctl apps list
doctl apps get <app-id>
doctl apps update <app-id> --spec .do/app.yaml

# Logs and debugging
doctl apps logs <app-id> --type=build --follow
doctl apps logs <app-id> --type=run --follow

# Database access
doctl databases list
doctl databases connection <db-id>
```

## Cost Estimation

- **Basic App**: $5/month (512MB RAM, 1GB storage)
- **Database**: $15/month (PostgreSQL, 1GB RAM, 10GB storage)
- **Total**: ~$20/month for production deployment

## Security Considerations

1. **Environment Variables**: All secrets properly configured
2. **HTTPS**: Enforced by default on DigitalOcean Apps
3. **Database**: Private networking between app and database
4. **Facebook**: Webhook signature verification implemented

## Support

- **DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
- **App Logs**: Available in DigitalOcean console
- **Community**: DigitalOcean Community Forums