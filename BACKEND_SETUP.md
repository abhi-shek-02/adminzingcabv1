# ZingCab Backend API Setup Guide

This guide will help you set up the ZingCab backend API server that powers the admin panel.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://ddpbdfxbqjydjptchvbm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGJkZnhicWp5ZGpwdGNodmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTg3NTgsImV4cCI6MjA2NDg5NDc1OH0.tr-4BUPKwM2n57ekZ43-nM6ZhKSxIQTjS_rotN0_bc8

# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Schema

The backend uses Supabase with the following tables:

### 1. bookingtable

```sql
CREATE TABLE bookingtable (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR UNIQUE NOT NULL,
  user_name VARCHAR NOT NULL,
  user_email VARCHAR NOT NULL,
  mobile_number VARCHAR NOT NULL,
  service_type VARCHAR NOT NULL CHECK (service_type IN ('oneway', 'airport', 'roundtrip', 'rental')),
  pick_up_location VARCHAR NOT NULL,
  pick_up_time VARCHAR NOT NULL,
  journey_date DATE NOT NULL,
  booking_date DATE NOT NULL,
  car_type VARCHAR NOT NULL CHECK (car_type IN ('hatchback', 'sedan', 'suv', 'crysta', 'scorpio')),
  drop_location VARCHAR,
  estimated_fare DECIMAL(10,2) NOT NULL,
  booking_source VARCHAR NOT NULL,
  return_date DATE,
  rental_booking_type VARCHAR,
  driver_name VARCHAR,
  driver_mobile VARCHAR,
  vehicle_number VARCHAR,
  amount_paid_to_driver DECIMAL(10,2),
  advance_amount_paid DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR,
  payment_status VARCHAR CHECK (payment_status IN ('paid', 'pending', 'failed')),
  payment_method VARCHAR CHECK (payment_method IN ('upi', 'card', 'cash', 'wallet')),
  payment_date TIMESTAMP,
  refund_status VARCHAR CHECK (refund_status IN ('initiated', 'completed', 'failed')),
  refund_amount DECIMAL(10,2),
  cancellation_reason VARCHAR,
  ride_status VARCHAR NOT NULL DEFAULT 'pending' CHECK (ride_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  km_limit INTEGER NOT NULL,
  discount_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. contactustable

```sql
CREATE TABLE contactustable (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Installation Steps

1. **Create Backend Directory**
   ```bash
   mkdir zingcab-backend
   cd zingcab-backend
   ```

2. **Initialize Node.js Project**
   ```bash
   npm init -y
   ```

3. **Install Dependencies**
   ```bash
   npm install express cors helmet morgan dotenv @supabase/supabase-js express-rate-limit
   npm install --save-dev nodemon @types/node @types/express
   ```

4. **Create Package.json Scripts**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js",
       "build": "echo 'No build step required'"
     }
   }
   ```

5. **Create Server File (server.js)**
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const helmet = require('helmet');
   const morgan = require('morgan');
   const rateLimit = require('express-rate-limit');
   require('dotenv').config();

   const app = express();
   const PORT = process.env.PORT || 3001;

   // Middleware
   app.use(helmet());
   app.use(morgan('combined'));
   app.use(cors({
     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
     credentials: true
   }));
   app.use(express.json());

   // Rate limiting
   const limiter = rateLimit({
     windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
     max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
   });
   app.use(limiter);

   // Health check
   app.get('/health', (req, res) => {
     res.json({
       status: 'OK',
       timestamp: new Date().toISOString(),
       environment: process.env.NODE_ENV || 'development'
     });
   });

   // API Routes
   app.use('/api', require('./routes'));

   // Error handling
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({
       success: false,
       message: 'Internal server error'
     });
   });

   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

6. **Create Routes Directory and Files**
   ```bash
   mkdir routes
   touch routes/index.js
   touch routes/bookings.js
   touch routes/contacts.js
   touch routes/fare.js
   ```

7. **Create Database Connection (db.js)**
   ```javascript
   const { createClient } = require('@supabase/supabase-js');

   const supabaseUrl = process.env.SUPABASE_URL;
   const supabaseKey = process.env.SUPABASE_ANON_KEY;

   if (!supabaseUrl || !supabaseKey) {
     throw new Error('Missing Supabase environment variables');
   }

   const supabase = createClient(supabaseUrl, supabaseKey);

   module.exports = supabase;
   ```

## API Endpoints Implementation

### 1. Bookings Routes (routes/bookings.js)

```javascript
const express = require('express');
const router = express.Router();
const supabase = require('../db');

// Get all bookings
router.get('/booking', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookingtable')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Get booking by ID
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const { data, error } = await supabase
      .from('bookingtable')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// Create booking
router.post('/booking', async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Generate booking ID
    const bookingId = `ZC${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const { data, error } = await supabase
      .from('bookingtable')
      .insert([{
        ...bookingData,
        booking_id: bookingId,
        booking_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking_id: data.booking_id,
        estimated_fare: data.estimated_fare,
        advance_amount: data.advance_amount_paid,
        status: data.ride_status,
        pickup_date: data.journey_date,
        pickup_time: data.pick_up_time,
        service_type: data.service_type,
        car_type: data.car_type,
        km_limit: data.km_limit,
        booking_date: data.booking_date
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// Update booking
router.put('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('bookingtable')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('booking_id', bookingId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
});

module.exports = router;
```

### 2. Contacts Routes (routes/contacts.js)

```javascript
const express = require('express');
const router = express.Router();
const supabase = require('../db');

// Get all contacts
router.get('/contact', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contactustable')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
});

module.exports = router;
```

### 3. Fare Estimation Routes (routes/fare.js)

```javascript
const express = require('express');
const router = express.Router();

// Calculate fare estimate
router.post('/fare/estimate', async (req, res) => {
  try {
    const {
      km_limit,
      car_type,
      service_type,
      pick_up_location,
      drop_location,
      journey_date,
      pick_up_time,
      return_date,
      rental_booking_type
    } = req.body;

    // Base fare calculation (per km)
    const baseFarePerKm = {
      hatchback: 15,
      sedan: 18,
      suv: 22,
      crysta: 25,
      scorpio: 28
    };

    const baseFare = baseFarePerKm[car_type] || 18;
    const distance = km_limit;
    const estimatedFare = Math.round(baseFare * distance);

    const breakdown = {
      base_fare: Math.round(estimatedFare * 0.7),
      toll_charges: Math.round(estimatedFare * 0.1),
      state_tax: Math.round(estimatedFare * 0.05),
      gst: Math.round(estimatedFare * 0.12),
      driver_allowance: Math.round(estimatedFare * 0.03)
    };

    const allCarFares = {};
    Object.keys(baseFarePerKm).forEach(car => {
      allCarFares[car] = {
        estimated_fare: Math.round(baseFarePerKm[car] * distance),
        km_limit: distance,
        breakdown
      };
    });

    res.json({
      success: true,
      data: {
        selected_car: {
          car_type,
          estimated_fare: allCarFares[car_type].estimated_fare,
          km_limit: distance,
          breakdown
        },
        all_car_fares: allCarFares,
        service_details: {
          service_type,
          pick_up_location,
          drop_location,
          journey_date,
          pick_up_time,
          return_date,
          rental_duration: rental_booking_type,
          distance
        }
      }
    });
  } catch (error) {
    console.error('Error calculating fare:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fare'
    });
  }
});

module.exports = router;
```

### 4. Main Routes Index (routes/index.js)

```javascript
const express = require('express');
const router = express.Router();

const bookingsRoutes = require('./bookings');
const contactsRoutes = require('./contacts');
const fareRoutes = require('./fare');

router.use(bookingsRoutes);
router.use(contactsRoutes);
router.use(fareRoutes);

module.exports = router;
```

## Running the Server

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Production Mode**
   ```bash
   npm start
   ```

## Testing the API

Once the server is running, you can test the endpoints:

1. **Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Get Bookings**
   ```bash
   curl http://localhost:3001/api/booking
   ```

3. **Get Contacts**
   ```bash
   curl http://localhost:3001/api/contact
   ```

4. **Calculate Fare**
   ```bash
   curl -X POST http://localhost:3001/api/fare/estimate \
     -H "Content-Type: application/json" \
     -d '{
       "km_limit": 150,
       "mobile_number": "9876543210",
       "service_type": "oneway",
       "pick_up_location": "Mumbai",
       "pick_up_time": "09:00",
       "journey_date": "2024-01-15",
       "car_type": "sedan",
       "drop_location": "Pune",
       "booking_source": "admin"
     }'
   ```

## Frontend Integration

The frontend is already configured to connect to this backend. The API service will automatically fall back to mock data if the backend is not available.

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **Rate Limiting**: Implemented to prevent abuse
3. **CORS**: Configured for specific origins
4. **Input Validation**: Add validation middleware for all endpoints
5. **Authentication**: Consider implementing JWT authentication for admin access

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Use environment-specific Supabase credentials
4. Set up proper logging and monitoring
5. Use a process manager like PM2
6. Set up SSL/TLS certificates

## Troubleshooting

1. **CORS Issues**: Check CORS_ORIGIN environment variable
2. **Database Connection**: Verify Supabase credentials
3. **Port Conflicts**: Change PORT environment variable
4. **Rate Limiting**: Adjust rate limit settings if needed 