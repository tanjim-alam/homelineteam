# Admin Panel - HomeLine Team

A modern, feature-rich admin panel built with React, Redux Toolkit, and Tailwind CSS for managing the HomeLine Team e-commerce platform.

## 🚀 Features

### 📊 Dashboard
- **Real-time Statistics**: Total products, categories, orders, and revenue
- **Order Analytics**: Pending, completed, and low stock indicators
- **Recent Activity**: Latest orders and top-performing categories
- **Quick Actions**: Fast access to common admin tasks

### 🏷️ Categories Management
- **Full CRUD Operations**: Create, read, update, and delete categories
- **Custom Fields**: Dynamic field system for category-specific attributes
- **Image Upload**: Support for category images
- **SEO Metadata**: Title, description, and keywords management
- **Field Types**: Text, number, dropdown, and boolean fields

### 📦 Products Management
- **Complete Product Lifecycle**: Add, edit, delete, and manage products
- **Dynamic Fields**: Category-based custom attributes
- **Image Management**: Multiple image uploads (up to 8 images)
- **Pricing System**: Price, MRP, and discount management
- **Stock Tracking**: Inventory management with low stock alerts
- **SEO Optimization**: Meta titles and descriptions

### 🛒 Orders Management
- **Order Tracking**: Complete order lifecycle management
- **Status Updates**: Real-time status changes (pending → processing → shipped → completed)
- **Customer Information**: Detailed customer and shipping details
- **Order Analytics**: Revenue tracking and order statistics
- **Filtering System**: Status-based order filtering

### 🔐 Authentication & Security
- **Secure Login**: Protected admin access
- **Session Management**: Automatic authentication checks
- **Error Handling**: Comprehensive error management with auto-dismiss
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Technology Stack

- **Frontend**: React 19, Redux Toolkit, React Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: Redux Toolkit with async thunks
- **HTTP Client**: Axios for API communication
- **Build Tool**: Vite for fast development and building

## 📁 Project Structure

```
admin/
├── src/
│   ├── api/
│   │   └── client.js          # API client configuration
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Main page components
│   │   ├── DashboardPage.jsx   # Dashboard with statistics
│   │   ├── CategoriesPage.jsx  # Category management
│   │   ├── ProductsPage.jsx    # Product management
│   │   ├── OrdersPage.jsx      # Order management
│   │   └── LoginPage.jsx       # Authentication
│   ├── store/                  # Redux store configuration
│   │   ├── slices/             # Redux slices
│   │   │   ├── authSlice.js    # Authentication state
│   │   │   ├── categorySlice.js # Category state
│   │   │   ├── productSlice.js  # Product state
│   │   │   └── orderSlice.js    # Order state
│   │   └── store.js            # Store configuration
│   ├── App.jsx                 # Main application component
│   └── main.jsx                # Application entry point
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API server running
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd homelineteam/admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Update the API base URL in `src/api/client.js` to match your backend server.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🔧 Configuration

### API Configuration
The admin panel connects to your backend API. Ensure the following endpoints are available:

- **Authentication**: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Categories**: `/api/categories` (CRUD operations)
- **Products**: `/api/products` (CRUD operations with image upload)
- **Orders**: `/api/orders` (CRUD operations)

### Environment Variables
Create a `.env` file in the admin directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=HomeLine Admin
```

## 📱 Features in Detail

### Dashboard Analytics
- **Real-time Metrics**: Live updates of business metrics
- **Visual Indicators**: Color-coded status indicators
- **Quick Actions**: One-click access to common tasks
- **Responsive Charts**: Mobile-optimized data visualization

### Category Management
- **Hierarchical Structure**: Support for nested categories
- **Custom Fields**: Dynamic attribute system
- **Bulk Operations**: Efficient management of multiple categories
- **SEO Tools**: Built-in SEO optimization features

### Product Management
- **Advanced Forms**: Dynamic forms based on category selection
- **Image Gallery**: Multiple image support with preview
- **Inventory Control**: Stock tracking and alerts
- **Pricing Tools**: Flexible pricing and discount system

### Order Management
- **Workflow Management**: Complete order lifecycle
- **Customer Insights**: Detailed customer information
- **Shipping Details**: Address and delivery management
- **Status Tracking**: Real-time order status updates

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on all device sizes
- **Dark Mode Ready**: Prepared for future dark theme support
- **Accessibility**: WCAG compliant design patterns
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **Protected Routes**: Authentication-required access
- **Session Management**: Secure session handling
- **Input Validation**: Client-side and server-side validation
- **CSRF Protection**: Built-in CSRF token handling
- **Secure Headers**: Security-focused HTTP headers

## 🚀 Performance Features

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: On-demand component loading
- **Optimized Bundles**: Efficient build optimization
- **Caching Strategy**: Smart caching for better performance
- **Image Optimization**: Optimized image handling

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment
1. Build the project: `npm run build`
2. Upload `dist/` contents to your web server
3. Configure your web server to serve the SPA
4. Set up proper routing for client-side routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release with full CRUD operations
- Modern React 19 implementation
- Complete admin panel functionality
- Responsive design and modern UI/UX

---

**Built with ❤️ by the HomeLine Team**
