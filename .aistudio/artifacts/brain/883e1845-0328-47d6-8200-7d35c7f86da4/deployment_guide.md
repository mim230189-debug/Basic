# WINK NETWORK ISP — Production Hosting Deployment Guide (AmarHoster Webuzo)

This guide accompanies the generated production package **`wink-isp-deployment.zip`** for deploying your WINK NETWORK ISP application to **AmarHoster Webuzo / cPanel shared hosting**.

---

## 1. Deployment Package Information

- **Package Name**: `wink-isp-deployment.zip`
- **File Size**: ~604 KB
- **Contents**:
  - `index.html`: Optimized HTML entry point.
  - `.htaccess`: Production Apache configuration (HTTPS redirect, client-side SPA routing, GZIP compression, security headers).
  - `assets/index-CjfV6ffu.js`: Main bundled and tree-shaken JavaScript application.
  - `assets/index-CIu23Non.css`: Minified Tailwind CSS v4 styling.
  - `assets/purify.es-Dqk5qvad.js`: Security DOM sanitizer.
  - `assets/index.es-4tJqrkdo.js` & `assets/html2canvas-D1IoRYl0.js`: PDF invoice & receipt generator.

---

## 2. Step-by-Step Webuzo Deployment

### Step 1: Download the ZIP File
The ZIP archive `wink-isp-deployment.zip` is available in:
1. The project root: `/wink-isp-deployment.zip`
2. Directly downloadable from your browser via your website: `[YOUR_APP_URL]/wink-isp-deployment.zip`
3. In the Admin Panel under **কোম্পানি সেটিংস (Settings) → ওয়েবুজো ডিপ্লয়মেন্ট**.

### Step 2: Upload to Webuzo File Manager
1. Log in to your **Webuzo Control Panel**.
2. Open **File Manager** from the dashboard.
3. Open your document root folder:
   - For primary domain: **`public_html/`**
   - For subdomain (e.g. `billing.winkisp.com`): **`public_html/billing/`**
4. Click **Upload** and upload `wink-isp-deployment.zip`.

### Step 3: Extract the Archive
1. Right-click `wink-isp-deployment.zip` in File Manager and select **Extract**.
2. Confirm the extraction location is `public_html/`.
3. Verify that `index.html`, `.htaccess`, and `assets/` are present directly inside `public_html/`.
4. Delete `wink-isp-deployment.zip` from `public_html/` to keep your hosting clean.

---

## 3. Important Apache `.htaccess` Verification

The included `.htaccess` file ensures:
1. **HTTPS Enforcement**: Automatically redirects all insecure `http://` traffic to `https://`.
2. **SPA URL Routing**: Routes browser page reloads directly to `index.html` without returning an Apache 404 error.
3. **Speed Optimization**: Enables GZIP compression and browser caching for `.js`, `.css`, and `.svg` files.

---

## 4. Firebase Authorized Domain Configuration

Your Firebase database, user accounts, and security rules will continue working seamlessly over HTTPS.
Before going live on your domain:

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`operating-scheduler-0lvvl`**.
3. In the left sidebar, click **Authentication** → select the **Settings** tab.
4. Click **Authorized domains** → click **Add domain**.
5. Enter your AmarHoster domain or subdomain (e.g. `winkisp.com` or `billing.winkisp.com`).
6. Click **Done**.

Your WINK NETWORK ISP billing system is now 100% production-ready on your shared hosting!
