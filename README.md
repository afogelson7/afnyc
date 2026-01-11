# Beauty Sales & Forecast Tracker

A comprehensive sales performance and forecast tracking application designed specifically for beauty companies selling multiple brands across various retailers.

## Overview

This application helps beauty companies track sales performance across multiple dimensions (brands, retailers, categories, subcategories), compare actual results to forecasts and prior year, and analyze profit margins. The key feature is **Excel file upload** for easy sales data import.

## Core Features

### Sales Performance Tracking
- Track sales by **Brand**, **Retailer**, **Category**, **Subcategory**, and **SKU**
- Import sales data via **Excel file upload**
- View total revenue, units sold, and number of SKUs sold
- Compare performance: **Actual vs Forecast vs Prior Year**
- Monthly, quarterly, and seasonal performance tracking

### Margin Analysis
- Track **COGS** (Cost of Goods Sold), **Wholesale Cost**, and **Retailer SRP**
- Analyze gross margins by:
  - Brand/License
  - Retailer
  - Category
  - Subcategory
- Calculate margin percentages across all dimensions

### Excel Integration
- Upload sales data from Excel files
- Automatic product and retailer matching
- Upload history tracking
- Error reporting for failed imports
- Download sample template

### Multi-Brand Management
- Manage multiple brands/licenses
- Track performance by brand
- Brand-level forecasting

### Data Management
- **Brands/Licenses**: Manage your product brands
- **Retailers**: Track all retailers you sell to
- **Products**: Complete product catalog with SKU, brand, category, subcategory, and pricing
- **Forecasts**: Create forecasts by period, category, brand, or retailer

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- Modern CSS with responsive design
- File upload with drag-and-drop support

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** database for data persistence
- **xlsx** library for Excel file parsing
- **multer** for file uploads
- RESTful API design

## Getting Started

### Prerequisites
- Node.js 16+ and npm installed

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development environment:
```bash
npm run dev
```

This will start both the backend API server (port 3001) and the frontend development server (port 3000).

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Project Structure

```
beauty-sales-tracker/
├── server/                 # Backend API
│   ├── database.ts        # Database setup and schema
│   ├── index.ts           # Express server
│   └── routes/            # API route handlers
│       ├── brands.ts
│       ├── retailers.ts
│       ├── products.ts
│       ├── sales.ts
│       ├── forecasts.ts
│       └── analytics.ts
├── src/                   # Frontend React app
│   ├── components/        # React components
│   │   ├── SalesDashboard.tsx
│   │   ├── SalesUpload.tsx
│   │   └── Setup.tsx
│   ├── api.ts            # API client functions
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── uploads/              # Temporary upload directory
└── package.json          # Dependencies and scripts
```

## Usage Guide

### 1. Initial Setup

First, set up your data in the **Setup** section:

#### Brands
1. Navigate to **Setup > Brands**
2. Add all your brands/licenses
3. Example: "L'Oréal", "Maybelline", "NYX"

#### Retailers
1. Navigate to **Setup > Retailers**
2. Add all retailers you sell to
3. Example: "Target", "Walmart", "Ulta", "Sephora"

#### Products
1. Navigate to **Setup > Products**
2. Add your product catalog with:
   - **SKU**: Unique product identifier
   - **Name**: Product name
   - **Brand**: Select from your brands
   - **Category**: e.g., "Makeup", "Skincare", "Haircare"
   - **Subcategory**: e.g., "Lipstick", "Foundation", "Moisturizer"
   - **COGS**: Cost of goods sold
   - **Wholesale Cost**: What you sell to retailers for
   - **Retailer SRP**: Suggested retail price

### 2. Upload Sales Data

1. Navigate to **Upload Sales**
2. Prepare an Excel file with these columns:
   - **SKU**: Product SKU (must exist in your catalog)
   - **Retailer**: Retailer name (will be created if doesn't exist)
   - **Date**: Sale date (YYYY-MM-DD or Excel date format)
   - **Units**: Number of units sold
   - **Revenue**: Total revenue
3. Click **Choose File** and select your Excel file
4. Click **Upload Sales Data**
5. Review the upload results

#### Excel File Example

| SKU | Retailer | Date | Units | Revenue |
|-----|----------|------|-------|---------|
| LIP001 | Target | 2026-01-15 | 100 | 2500.00 |
| FON002 | Walmart | 2026-01-15 | 50 | 1200.00 |
| MOS003 | Ulta | 2026-01-16 | 75 | 1875.00 |

### 3. View Dashboard

The **Dashboard** shows:
- **Total Revenue**: Year-to-date revenue and units sold
- **Gross Margin**: Total margin and margin percentage
- **vs Forecast**: Performance compared to forecast
- **vs Prior Year**: Year-over-year growth
- **Sales by Brand**: Revenue and units by brand
- **Sales by Retailer**: Revenue and SKU count by retailer

Use the **Year** selector to view different years.

## API Endpoints

### Brands
- `GET /api/brands` - Get all brands
- `POST /api/brands` - Create brand
- `PUT /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

### Retailers
- `GET /api/retailers` - Get all retailers
- `POST /api/retailers` - Create retailer
- `PUT /api/retailers/:id` - Update retailer
- `DELETE /api/retailers/:id` - Delete retailer

### Products
- `GET /api/products` - Get all products with brand info
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales?start_date=&end_date=&retailer_id=&product_id=` - Get sales data
- `POST /api/sales/upload` - Upload Excel file with sales data
- `GET /api/sales/upload-history` - Get upload history
- `DELETE /api/sales?start_date=&end_date=` - Delete sales in date range

### Forecasts
- `GET /api/forecasts?year=&period_type=&brand_id=&category=` - Get forecasts
- `POST /api/forecasts` - Create forecast
- `PUT /api/forecasts/:id` - Update forecast
- `DELETE /api/forecasts/:id` - Delete forecast

### Analytics
- `GET /api/analytics/dashboard?year=` - Dashboard overview
- `GET /api/analytics/by-category?year=` - Sales by category/subcategory
- `GET /api/analytics/margins?year=&dimension=` - Margin analysis
- `GET /api/analytics/performance?year=&period_type=` - Actual vs forecast vs prior year

## Database

The application uses SQLite with the following tables:

- **brands**: Product brands/licenses
- **retailers**: Retail partners
- **products**: Product catalog (SKU, brand, category, subcategory, costs)
- **sales**: Sales transactions (uploaded from Excel)
- **forecasts**: Budget/forecast data
- **seasonal_periods**: Seasonal period definitions
- **upload_history**: Tracking of Excel uploads

## Key Workflows

### Monthly Sales Review
1. Upload last month's sales data from Excel
2. View Dashboard to see performance vs forecast and prior year
3. Analyze margins by retailer and brand
4. Identify top-performing SKUs and categories

### Seasonal Planning
1. Define seasonal periods (Christmas, Easter, Halloween)
2. Create forecasts for seasonal periods
3. Track actual performance against seasonal forecasts
4. Compare to prior year seasonal performance

### Retailer Analysis
1. View sales by retailer on Dashboard
2. Check number of SKUs sold per retailer
3. Analyze margin performance by retailer
4. Identify opportunities for growth

## Customization

### Adding Custom Categories

Update the category options in `/src/components/Setup.tsx` for the Products tab to add your specific product categories and subcategories.

### Seasonal Periods

Add seasonal period definitions through the API:

```javascript
POST /api/seasonal-periods
{
  "name": "Christmas 2026",
  "start_date": "2026-11-01",
  "end_date": "2026-12-31",
  "year": 2026
}
```

## Troubleshooting

### Excel Upload Fails
- Ensure column names match exactly: SKU, Retailer, Date, Units, Revenue
- Verify all SKUs exist in your product catalog
- Check date format (YYYY-MM-DD or Excel date number)
- Review upload history for error messages

### Missing Data on Dashboard
- Confirm sales data has been uploaded
- Check year selector is set to correct year
- Verify products have brand and category assigned

## License

MIT

## Support

For issues or questions, please check the upload history for error details or review the browser console for frontend errors.
