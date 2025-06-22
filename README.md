# ZingCab Admin Panel

A modern, responsive admin panel for managing cab booking operations built with React, TypeScript, and Tailwind CSS.

![ZingCab Admin Panel](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite)

## 🚀 Features

### 📊 Dashboard
- **Real-time Statistics**: Total bookings, revenue, pending trips, and contact inquiries
- **Recent Bookings**: Quick overview of latest bookings with status indicators
- **Quick Actions**: Direct access to create bookings, manage existing ones, and view contacts
- **Responsive Design**: Beautiful gradient cards with hover animations

### 📅 Booking Management
- **Comprehensive Booking List**: View all bookings with advanced filtering and search
- **Booking Details**: Detailed view of each booking with all information
- **Create New Bookings**: Two-step process with fare estimation and booking creation
- **Status Management**: Update booking status (pending, confirmed, in progress, completed, cancelled)
- **Export Functionality**: Export bookings to CSV for analysis

### 💬 Contact Management
- **Contact Inquiries**: View and manage customer messages
- **Search & Filter**: Find specific contacts quickly
- **Contact Details**: Complete customer information with action buttons
- **Statistics**: Track total inquiries, monthly counts, and unique customers

### 🎨 Modern UI/UX
- **Gradient Design**: Beautiful gradient backgrounds and cards
- **Smooth Animations**: Hover effects and transitions
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode Ready**: Easy to implement theme switching
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Styling**: Tailwind CSS 3.4.1
- **Build Tool**: Vite 5.4.2
- **Routing**: React Router DOM 6.26.1
- **Icons**: Lucide React 0.344.0
- **Charts**: Recharts 2.12.7
- **Date Handling**: date-fns 3.6.0
- **Notifications**: react-hot-toast 2.4.1

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adminzingcabv1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=ZingCab Admin
```

### Backend Setup

The admin panel is designed to work with the ZingCab API. See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for complete backend setup instructions.

**Note**: The frontend includes a mock API service that provides sample data when the backend is not available, making it perfect for development and testing.

## 📱 Usage

### Dashboard
- View key metrics and statistics
- Access recent bookings
- Quick navigation to main features

### Bookings
- **View All**: Browse all bookings with filters
- **Create New**: Add new bookings with fare calculation
- **Details**: View and edit booking information
- **Export**: Download booking data as CSV

### Contacts
- **View Inquiries**: Manage customer messages
- **Search**: Find specific contacts
- **Actions**: Reply to emails or call customers

### Analytics
- **Charts**: Visual representation of booking trends
- **Reports**: Revenue and performance metrics

### Settings
- **Configuration**: System settings and preferences
- **Fare Management**: Update pricing and rates

## 🎯 Key Features

### Booking Management
- ✅ Create new bookings with fare estimation
- ✅ View and filter all bookings
- ✅ Update booking status and details
- ✅ Assign driver information
- ✅ Manage payment details
- ✅ Export booking data

### Contact Management
- ✅ View all contact inquiries
- ✅ Search and filter contacts
- ✅ Reply to customer messages
- ✅ Track inquiry statistics

### User Experience
- ✅ Responsive design for all devices
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation
- ✅ Real-time data updates
- ✅ Error handling and notifications

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

## 🔒 Security Features

- **CORS Protection**: Configured for specific origins
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Graceful error handling and user feedback
- **Rate Limiting**: Backend rate limiting (when connected)

## 📊 Performance

- **Fast Loading**: Optimized with Vite
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Lazy Loading**: Components loaded on demand

## 🧪 Testing

The application includes:
- **Mock API Service**: For development and testing
- **TypeScript**: Type safety and better development experience
- **Error Boundaries**: Graceful error handling
- **Responsive Testing**: Works on all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [BACKEND_SETUP.md](./BACKEND_SETUP.md) for backend setup
- Review the API documentation in the backend setup guide

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update color schemes in the component files
- Add custom CSS in `src/index.css`

### Features
- Add new pages in `src/pages/`
- Create new components in `src/components/`
- Update API service in `src/services/api.ts`

## 📈 Roadmap

- [ ] Authentication and user management
- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced booking filters
- [ ] Driver management system
- [ ] Payment gateway integration
- [ ] SMS notifications

---

**Built with ❤️ for ZingCab**
