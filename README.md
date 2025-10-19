# Dr. M. Babar Imran Thyroid Specialist Website

**Frontend-Only Version** - A professional medical website built with Bootstrap, featuring patient feedback, appointment scheduling, and admin panel. All data is stored locally in the browser using localStorage.

## Features

- **Responsive Design**: Mobile-first Bootstrap 5 design
- **Patient Feedback System**: Patients can leave reviews and ratings
- **Contact Forms**: Easy contact and message system
- **Admin Panel**: Complete admin interface for managing:
  - Patient feedback and reviews
  - Messages from contact forms
  - Doctor availability settings
  - Hospital schedules (PINUM & Maqsooda Zia Hospital)
- **Multi-language Support**: English and Urdu content
- **Professional Layout**: Clean, medical-themed design
- **No Server Required**: Runs entirely in the browser

## Tech Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Data Storage**: Browser localStorage
- **Icons**: Bootstrap Icons, Font Awesome
- **Responsive**: Mobile-first design

## Quick Start

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd doctor-bootstrap-project
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local web server for best experience:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Access the website**
   - Main website: `index.html` or `http://localhost:8000`
   - Admin panel: `admin/index.html` or `http://localhost:8000/admin`



## Project Structure

```
├── index.html          # Main website
├── admin/
│   ├── index.html      # Admin dashboard
│   └── login.html      # Admin login
├── css/
│   ├── style.css       # Main styles
│   └── admin.css       # Admin panel styles
├── js/
│   └── data.js         # Data management system
├── images/             # Website images
└── README.md           # This file
```

## Features Overview

### Main Website (`index.html`)
- **Home Section**: Introduction and contact info
- **About Section**: Doctor's credentials and achievements
- **Services**: Medical services offered
- **Availability**: Hospital schedules and timings
- **Feedback**: Patient testimonials with ratings
- **Contact Form**: Message submission system

### Admin Panel (`admin/index.html`)
- **Dashboard**: Overview statistics
- **Messages**: View and manage contact messages
- **Feedback**: Manage patient reviews and visibility
- **Availability**: Set doctor availability status
- **Hospital Management**: Configure schedules for both hospitals

## Data Storage

The application uses browser localStorage with the following structure:

```json
{
  "feedback": [],     # Patient reviews
  "messages": [],     # Contact messages  
  "availability": {}, # Doctor availability
  "hospitals": {},    # Hospital schedules
  "admin": {}         # Admin credentials
}
```

**Note**: Data is stored locally in the user's browser. To backup or transfer data:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Find localStorage > your domain
4. Copy the `doctorAppData` value

## Customization

### Styling
- Main styles: `css/style.css`
- Admin styles: `css/admin.css`
- Bootstrap 5 classes used throughout

### Content
- Update doctor information in `index.html`
- Modify services in the services section
- Change contact details and social links
- Update default data in `js/data.js`

### Admin Credentials
- Default: `123@gmail.com` / `123`
- Change in `js/data.js` in the `admin` section

## Deployment

Since this is a frontend-only application, you can deploy it to any static hosting service:

### Free Options:
- **GitHub Pages**: Push to GitHub and enable Pages
- **Netlify**: Drag and drop deployment
- **Vercel**: Simple git-based deployment
- **Firebase Hosting**: Google's hosting service

### Steps for GitHub Pages:
1. Push code to GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (main/master)
4. Your site will be available at `https://username.github.io/repository-name`

## Advantages of Frontend-Only Version

- **No Server Required**: Runs on any web server or even locally
- **Fast Loading**: No database queries or server processing
- **Easy Deployment**: Deploy to any static hosting service
- **Cost Effective**: No server costs, free hosting options available
- **Reliable**: No server downtime issues
- **Simple Maintenance**: No database or server maintenance needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers
- Any browser with localStorage support

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.
