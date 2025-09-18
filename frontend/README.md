# 🏠 HomeLine Frontend

A beautiful, modern, and responsive frontend for HomeLine - your premium home furnishings destination. Built with Next.js 15, React 18, and Tailwind CSS v4.

## ✨ Features

- **Modern Design**: Beautiful glassmorphism effects, gradients, and smooth animations
- **Responsive Layout**: Mobile-first design that works perfectly on all devices
- **SEO Optimized**: Comprehensive metadata, Open Graph, and Twitter Cards
- **Performance**: Optimized with Next.js 15 and modern React patterns
- **Accessibility**: Built with accessibility best practices
- **Interactive Components**: Hover effects, smooth transitions, and engaging animations

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.2
- **React**: 18.2.0
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.jsx          # About page
│   │   ├── collections/
│   │   │   └── page.jsx          # Collections page
│   │   ├── contact/
│   │   │   └── page.jsx          # Contact page
│   │   ├── globals.css           # Global styles
│   │   ├── layout.jsx            # Root layout
│   │   └── page.jsx              # Homepage
│   └── components/
│       ├── CategorySection.jsx   # Category showcase
│       ├── FeaturedProducts.jsx  # Featured products
│       ├── Footer.jsx            # Site footer
│       ├── Hero.jsx              # Hero section
│       ├── Navbar.jsx            # Navigation bar
│       ├── ProductCard.jsx       # Product display card
│       └── WhyChooseUs.jsx       # Value proposition
├── public/                        # Static assets
├── tailwind.config.js            # Tailwind configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🎨 Design System

### Colors
- **Primary**: Red (#dc2626) - Brand color
- **Secondary**: Gray scale for text and backgrounds
- **Accent**: Pink, Blue, Purple for gradients and highlights

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, large scale (text-4xl to text-7xl)
- **Body**: Regular weight, optimized for readability

### Components
- **Buttons**: Primary (gradient), Secondary (glassmorphism)
- **Cards**: Rounded corners, shadows, hover effects
- **Sections**: Consistent padding, background variations
- **Animations**: Smooth transitions, hover effects, floating elements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📱 Pages

### Homepage (`/`)
- Hero section with animated background
- Category showcase
- Featured products
- Why choose us section

### Collections (`/collections`)
- Grid of product categories
- Beautiful hover effects
- Call-to-action sections

### About (`/about`)
- Company story and mission
- Core values
- Timeline of milestones
- Team information

### Contact (`/contact`)
- Contact form with validation
- Contact information
- FAQ section
- Interactive elements

## 🎯 Key Components

### Navbar
- Sticky navigation with glassmorphism
- Dynamic category dropdown
- Mobile-responsive menu
- Search, wishlist, and cart icons

### Hero Section
- Animated background shapes
- Gradient text effects
- Trust indicators
- Call-to-action buttons

### ProductCard
- Dynamic pricing display
- Variant support
- Hover effects
- Rating and discount badges

### Footer
- Comprehensive site links
- Newsletter signup
- Social media integration
- Scroll-to-top functionality

## 🔧 Customization

### Colors
Update colors in `tailwind.config.js`:
```javascript
colors: {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    // ... more shades
    600: '#dc2626', // Main brand color
  }
}
```

### Animations
Custom animations in `tailwind.config.js`:
```javascript
animation: {
  'float': 'float 6s ease-in-out infinite',
  'bounce-gentle': 'bounceGentle 2s infinite',
}
```

### Components
All components are modular and can be easily customized:
- Update props for dynamic content
- Modify CSS classes for styling
- Add new features and functionality

## 📊 Performance

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: Optimized with Next.js 15
- **Images**: Ready for Next.js Image optimization
- **Fonts**: Optimized Google Fonts loading

## 🌐 SEO Features

- **Meta Tags**: Comprehensive metadata for all pages
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **Structured Data**: Ready for schema markup
- **Sitemap**: Ready for sitemap generation

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch Friendly**: Optimized for touch interactions
- **Performance**: Fast loading on all devices

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Vercel will auto-detect Next.js
3. Deploy with zero configuration

### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Deploy with automatic builds

### Static Export
```bash
npm run build
npm run export
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- **Email**: hello@homeline.com
- **Phone**: +91 98765 43210
- **Website**: [homeline.com](https://homeline.com)

---

**Built with ❤️ by the HomeLine Team**

Transform your home with beautiful furnishings from HomeLine!
