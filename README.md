# Beauty Merchandise Planner

A comprehensive financial planning application designed specifically for beauty companies to manage merchandise, budgets, and purchase orders.

## Features

### Product Catalog Management
- Add, edit, and delete products with SKU tracking
- Track cost price, retail price, and profit margins
- Organize products by category (Skincare, Makeup, Haircare, Fragrance, Tools)
- Manage supplier information

### Budget Planning
- Create budgets by category and time period
- Track allocated vs. spent amounts
- Visual progress indicators
- Budget utilization tracking
- Over-budget alerts

### Purchase Order Management
- Create and manage purchase orders
- Track PO status (Pending, Ordered, Received, Cancelled)
- Link products to purchase orders with quantities and unit costs
- Expected delivery date tracking
- Automatic total cost calculation

### Financial Dashboard
- Overview of key metrics
- Product statistics and average margins
- Budget allocation and spending summary
- Purchase order analytics
- Budget breakdown by category
- Recent purchase order activity

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- Modern CSS with CSS variables
- Responsive design for mobile and desktop

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** database for data persistence
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
beauty-merch-planner/
├── server/                 # Backend API
│   ├── database.ts        # Database setup and schema
│   ├── index.ts           # Express server
│   └── routes/            # API route handlers
│       ├── products.ts
│       ├── budgets.ts
│       ├── purchase-orders.ts
│       └── analytics.ts
├── src/                   # Frontend React app
│   ├── components/        # React components
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Budgets.tsx
│   │   └── PurchaseOrders.tsx
│   ├── api.ts            # API client functions
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
└── package.json          # Dependencies and scripts
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get single budget
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `GET /api/purchase-orders/:id` - Get single purchase order
- `POST /api/purchase-orders` - Create purchase order
- `PUT /api/purchase-orders/:id` - Update purchase order
- `DELETE /api/purchase-orders/:id` - Delete purchase order

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics

## Usage Guide

### Managing Products

1. Navigate to the **Products** section
2. Click **+ Add Product**
3. Fill in product details:
   - SKU (unique identifier)
   - Product name
   - Category
   - Cost price and retail price
   - Supplier information
4. Click **Create Product**

The product list shows profit margins automatically calculated from cost and retail prices.

### Planning Budgets

1. Navigate to the **Budgets** section
2. Click **+ Add Budget**
3. Select category and time period
4. Set allocated amount
5. Track spending by updating the spent amount
6. Visual indicators show budget utilization

### Creating Purchase Orders

1. Navigate to the **Purchase Orders** section
2. Click **+ New Purchase Order**
3. Enter PO details (number, supplier, dates)
4. Add line items by selecting products and quantities
5. The total cost is automatically calculated
6. Track order status through its lifecycle

### Dashboard Overview

The dashboard provides at-a-glance insights:
- Total products and average margins
- Budget allocation and spending
- Purchase order statistics
- Category-wise budget breakdown
- Recent order activity

## Database

The application uses SQLite for data storage. The database file `beauty-planner.db` is created automatically on first run.

### Tables
- `products` - Product catalog
- `budgets` - Budget allocations
- `purchase_orders` - Purchase order headers
- `po_items` - Purchase order line items

## Customization

### Adding Categories

To add custom product categories, update the category dropdown options in:
- `src/components/Products.tsx`
- `src/components/Budgets.tsx`

### Styling

The app uses CSS variables for theming. Customize colors in `src/index.css`:

```css
:root {
  --primary: #d946ef;
  --secondary: #8b5cf6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
}
```

## License

MIT
