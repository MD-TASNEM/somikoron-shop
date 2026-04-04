# Netlify Deployment Guide

## Prerequisites
- Netlify account
- GitHub repository (optional but recommended)

## Environment Variables
Set these in your Netlify dashboard under Site Settings > Build & Deploy > Environment:

```
VITE_API_URL=https://somikoron-shop-server.vercel.app
```

## Deployment Steps

### Option 1: Drag and Drop
1. Run `npm run build` locally
2. Drag the `dist` folder to Netlify

### Option 2: Git Integration
1. Push your code to GitHub
2. Connect your GitHub account to Netlify
3. Select the repository
4. Netlify will automatically detect and deploy

### Option 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
npm run build
netlify deploy --prod --dir=dist
```

## Build Configuration
The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- SPA routing redirects

## Important Notes
- The client is configured to use the Vercel server at `https://somikoron-shop-server.vercel.app`
- All API calls will automatically route to the server
- Make sure the server is deployed and accessible before deploying the client
- The build process creates optimized static files for production

## Troubleshooting
- If API calls fail, verify the server URL is correct
- Check Netlify build logs for any errors
- Ensure all environment variables are set correctly
