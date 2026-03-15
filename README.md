# IvyPi Consulting Website

A modern, high-performance static website for IvyPi Consulting - Your trusted partner in college and high school admissions consulting.

## 🎓 About IvyPi Consulting

IvyPi Consulting provides expert guidance for students navigating the competitive landscape of college and high school applications. Our team of experienced consultants offers personalized strategies to help students achieve their educational goals.

## 🚀 Technical Overview

This is a fully static website optimized for performance, security, and maintainability. Originally migrated from WordPress, it now runs as pure HTML/CSS/JavaScript with no server-side dependencies, ensuring fast load times and simplified hosting.

### Key Features

- **⚡ Lightning Fast**: Static architecture with optimized assets and CDN caching
- **📱 Fully Responsive**: Mobile-first design that works seamlessly across all devices
- **🔒 Secure by Design**: No database or backend vulnerabilities, enhanced with security headers
- **📧 Smart Contact Forms**: Powered by Web3Forms for reliable, spam-free communication
- **🔍 SEO Optimized**: Custom sitemap, robots.txt, and structured metadata
- **🌍 Multi-language Support**: Google Translate integration for global accessibility
- **♿ Accessibility First**: WCAG-compliant design for inclusive user experience

## 📂 Project Structure

```
ivypi-website/
├── 📄 Core Pages
│   ├── index.html                    # Homepage with hero, services overview
│   ├── about-us/                     # Team information and company mission
│   ├── college-consulting/           # College counseling services
│   ├── college-application/          # College application assistance
│   ├── high-school-application/      # High school admission services
│   └── seminars/                     # Educational seminars and workshops
│
├── 🎨 Assets
│   ├── assets/
│   │   ├── css/                      # Compiled stylesheets
│   │   ├── js/                       # JavaScript modules
│   │   │   └── site.js              # Core functionality (navigation, tabs, FAQ)
│   │   ├── fonts/                   # Web fonts
│   │   └── uploads/                 # Media files and images
│   │
├── ⚙️ Configuration
│   ├── _headers                      # Cloudflare security and caching headers
│   ├── robots.txt                    # Search engine crawler directives
│   ├── sitemap.xml                   # XML sitemap for search engines
│   └── 404.html                      # Custom error page
│
├── 🛠️ Scripts
│   ├── deploy.sh                     # Deployment automation script
│   └── cache-bust.py                 # Cache busting utility
│
└── 📚 Documentation
    └── README.md                      # This file
```

## 🛠️ Technologies

### Frontend Stack
- **HTML5**: Semantic, accessible markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: Vanilla JS for lightweight interactivity
- **jQuery**: Limited use for Google Translate widget

### External Services
- **Web3Forms**: Contact form processing (support@ivypi.org)
- **Google Translate**: Multi-language support
- **Cloudflare Pages**: Hosting and CDN

## 🚀 Deployment Guide

### Prerequisites

- Cloudflare account (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)
- Domain name (optional, can use Cloudflare subdomain)

### Quick Deploy to Cloudflare Pages

1. **Fork or Clone Repository**
   ```bash
   git clone https://github.com/your-org/ivypi-website.git
   cd ivypi-website
   ```

2. **Connect to Cloudflare Pages**
   - Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to Pages → Create a project
   - Select "Connect to Git"
   - Choose your repository

3. **Configure Build Settings**
   - **Framework preset**: None
   - **Build command**: (leave empty - no build required)
   - **Build output directory**: `/`
   - **Root directory**: `/`

4. **Environment Variables** (if needed)
   - No environment variables required for basic setup

5. **Deploy**
   - Click "Save and Deploy"
   - Initial deployment typically completes in 1-2 minutes

### Custom Domain Setup

1. In Cloudflare Pages, go to your project
2. Navigate to "Custom domains"
3. Add your domain (e.g., ivypi.org)
4. Follow DNS configuration instructions

## 📧 Contact Form Configuration

The website uses Web3Forms for contact form processing:

- **Service**: [Web3Forms](https://web3forms.com/)
- **Recipient**: support@ivypi.org
- **Features**:
  - No backend server required
  - Built-in spam protection
  - Email notifications
  - Form data backup

To modify the recipient email:
1. Update the access key in contact form HTML
2. Generate new key at [web3forms.com](https://web3forms.com/)

## 🔧 Development

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ivypi-website.git
   cd ivypi-website
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx http-server

   # Using VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

3. **Access the site**
   ```
   http://localhost:8000
   ```

### Making Changes

1. **Content Updates**: Edit HTML files directly
2. **Styling Changes**: Modify CSS in `/assets/css/`
3. **JavaScript**: Update `/assets/js/site.js` for functionality
4. **Images**: Add to `/assets/uploads/` and reference in HTML

### Best Practices

- Optimize images before uploading (use WebP format when possible)
- Minify CSS/JS for production
- Test responsive design on multiple devices
- Validate HTML with [W3C Validator](https://validator.w3.org/)
- Check accessibility with browser DevTools

## 🏗️ Architecture Decisions

### Why Static?
- **Performance**: No server processing, instant page loads
- **Security**: No database, no server-side vulnerabilities
- **Scalability**: CDN handles traffic spikes automatically
- **Cost**: Minimal hosting costs, no server maintenance
- **Simplicity**: Easy to understand, modify, and deploy

### Migration from WordPress
- Extracted all content to static HTML
- Consolidated theme assets into versioned directories
- Removed all WordPress dependencies and plugins
- Implemented lightweight vanilla JavaScript replacements
- Preserved SEO value with proper redirects and sitemap


## Automated Testing

This website has comprehensive automated testing coverage through a dedicated testing repository.

### Testing Repository
- **Repository**: [ivypi-website-tests](https://github.com/IvyPi-College-Consulting/ivypi-website-tests)
- **Coverage**: 358+ test cases across all pages
- **Devices**: Desktop, Mobile (iPhone 13), Tablet (iPad Pro)
- **Features**: Link validation, form testing, accessibility checks, performance monitoring

### Continuous Testing
- Tests run automatically every 6 hours
- Failed tests create issues in this repository automatically
- Manual test triggers available via GitHub Actions

### Trigger Testing from Development
To trigger tests after deployment:
```bash
# Using GitHub CLI
gh workflow run test.yml --repo IvyPi-College-Consulting/ivypi-website-tests

# Using repository dispatch
curl -X POST \
  -H "Authorization: token YOUR_PAT" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/IvyPi-College-Consulting/ivypi-website-tests/dispatches \
  -d '{"event_type":"deployment-complete"}'
```

### Test Reports
View the latest test results:
- [GitHub Actions](https://github.com/IvyPi-College-Consulting/ivypi-website-tests/actions)
- [Test Dashboard](https://github.com/IvyPi-College-Consulting/ivypi-website-tests#-understanding-reports)


## License

Copyright © 2025 IvyPi Consulting. All rights reserved.
