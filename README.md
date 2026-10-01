
# NexaPOS 🧾

### Smart Multi-Branch Point of Sale & Business Management System

NexaPOS is a modern, scalable Point of Sale (POS) and business management system designed for retail businesses.

The system provides fast manual billing, product and inventory management, customer management, loyalty points, purchasing, sales tracking, expenses, reporting, and multi-branch management.

The project is being developed using **React + TypeScript** for the frontend and **C# ASP.NET Core Web API** for the backend.

---

## 🚀 Project Status

> **Status: 🚧 In Development**

The project is being developed step-by-step, starting with the frontend UI and POS billing workflow.

### Current Progress

- [x] Project repository created
- [x] React + TypeScript + Vite setup
- [x] ESLint configured
- [x] React Router installed
- [x] Axios installed
- [x] Lucide React installed
- [x] Recharts installed
- [x] Tailwind CSS installed
- [ ] Application layout
- [ ] Authentication
- [ ] Dashboard
- [ ] POS billing
- [ ] Manual item entry
- [ ] Cash payment & change calculation
- [ ] Receipt printing
- [ ] Customer management
- [ ] Loyalty points
- [ ] Product management
- [ ] Inventory management
- [ ] Purchase management
- [ ] Supplier management
- [ ] Sales management
- [ ] Expense management
- [ ] Employee management
- [ ] Multi-branch management
- [ ] Reports & analytics
- [ ] ASP.NET Core backend
- [ ] SQL Server database
- [ ] API integration
- [ ] Testing
- [ ] Deployment

---

# 🎯 Main Features

## 🧾 POS Billing

NexaPOS provides a fast and user-friendly cashier billing system.

Features include:

- Manual product entry
- Product search
- Barcode/SKU support
- Quantity management
- Unit price calculation
- Item discounts
- Bill-level discounts
- Tax calculation
- Subtotal calculation
- Grand total calculation
- Cash payment
- Card payment
- Bank transfer
- Split payments
- Cash received
- Automatic change calculation
- Hold and resume bills
- Invoice generation
- Receipt printing
- PDF invoice generation
- Bill reprinting
- Refund processing

---

## 👥 Customer Management

Manage customer information and purchase history.

Features:

- Customer registration
- Customer profiles
- Phone number search
- Purchase history
- Customer spending statistics
- Refund history
- Loyalty points
- Membership levels

---

## ⭐ Loyalty Program

NexaPOS includes a configurable customer loyalty system.

Example:

```text
Rs. 100 spent = 1 loyalty point
```

The system can track:

- Previous points
- Points earned
- Points redeemed
- Current balance
- Membership level
- Reward history

---

## 📦 Inventory Management

Manage products and stock across multiple branches.

Features:

- Product management
- Categories
- Brands
- SKU
- Barcode
- Stock levels
- Minimum stock levels
- Low-stock alerts
- Out-of-stock tracking
- Stock adjustments
- Stock transfers
- Inventory history
- Stock valuation

---

## 🛒 Purchasing

Manage suppliers and purchases.

Features:

- Supplier management
- Purchase orders
- Purchase items
- Goods receiving
- Supplier payments
- Purchase history
- Stock updates

---

## 🏪 Multi-Branch Management

NexaPOS supports businesses with multiple branches.

Each branch can have:

- Employees
- POS terminals
- Inventory
- Sales
- Expenses
- Customers
- Branch reports

Administrators can view overall business performance.

---

## 💰 Expense Management

Track business expenses such as:

- Rent
- Electricity
- Salaries
- Transport
- Maintenance
- Marketing
- Other expenses

---

## 📊 Reports & Analytics

The system will provide business intelligence dashboards and reports.

Reports include:

- Daily sales
- Weekly sales
- Monthly sales
- Product performance
- Best-selling products
- Slow-moving products
- Inventory reports
- Expense reports
- Profit reports
- Branch performance
- Cashier performance
- Customer analytics

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Recharts

## Backend

- C#
- ASP.NET Core Web API
- Entity Framework Core
- JWT Authentication
- REST API
- SignalR

## Database

- Microsoft SQL Server

## Development Tools

- Visual Studio Code
- Visual Studio
- Git
- GitHub
- Swagger / OpenAPI

---

# 🏗️ System Architecture

The planned architecture is:

```text
                    ┌─────────────────────────┐
                    │     React Frontend      │
                    │                         │
                    │ React + TypeScript      │
                    │ Tailwind CSS            │
                    │ React Router            │
                    │ Axios                   │
                    └────────────┬────────────┘
                                 │
                              REST API
                                 │
                    ┌────────────▼────────────┐
                    │   ASP.NET Core Web API  │
                    │                         │
                    │ Authentication          │
                    │ Business Logic           │
                    │ Authorization            │
                    │ Validation               │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Entity Framework     │
                    │          Core           │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      SQL Server         │
                    └─────────────────────────┘
```

---

# 📁 Planned Project Structure

```text
NexaPOS/
│
├── NexaPOS.Frontend/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── pos/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── customers/
│   │   │   ├── sales/
│   │   │   └── reports/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
├── NexaPOS.Backend/
│   │
│   ├── NexaPOS.API/
│   ├── NexaPOS.Application/
│   ├── NexaPOS.Domain/
│   └── NexaPOS.Infrastructure/
│
├── README.md
└── .gitignore
```

---

# 👤 User Roles

The system will support role-based access control.

| Role              | Description                    |
| ----------------- | ------------------------------ |
| Super Admin       | Full system access             |
| Business Owner    | Business-wide management       |
| Branch Manager    | Manage assigned branch         |
| Cashier           | POS and billing                |
| Inventory Manager | Inventory and products         |
| Accountant        | Finance and reports            |
| Auditor           | View audit records and reports |

---

# 🧾 Billing Workflow

```text
New Bill
   ↓
Enter / Search Product
   ↓
Enter Quantity
   ↓
Calculate Item Total
   ↓
Add More Items
   ↓
Apply Discount
   ↓
Calculate Grand Total
   ↓
Select Customer
   ↓
Calculate Loyalty Points
   ↓
Enter Payment
   ↓
Calculate Change
   ↓
Complete Payment
   ↓
Generate Invoice
   ↓
Print Receipt
   ↓
Update Loyalty Points
   ↓
New Bill
```

---

# 🔐 Security

The backend will implement:

- JWT authentication
- Role-based authorization
- Password hashing
- Input validation
- API authorization
- Secure database access
- Audit logging
- Global exception handling

---

# 📈 Future Improvements

Planned future features include:

- 📱 Mobile/PWA support
- 🔔 Real-time notifications
- 📡 Real-time inventory updates
- 📊 Advanced business analytics
- 🤖 AI-based demand forecasting
- 🧠 Smart stock recommendations
- 📍 Branch performance comparison
- ☁️ Cloud deployment
- 🐳 Docker support
- 🔄 CI/CD pipeline
- 📦 Automated database backups

---

# 💻 Getting Started

## Frontend

Navigate to the frontend directory:

```bash
cd NexaPOS.Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

# 🔧 Development Roadmap

### Phase 1 — Frontend Foundation

- [x] React setup
- [x] TypeScript setup
- [x] Tailwind CSS
- [ ] Design system
- [ ] Application layout
- [ ] Navigation

### Phase 2 — Authentication

- [ ] Login
- [ ] Registration
- [ ] JWT authentication
- [ ] Role-based access

### Phase 3 — POS

- [ ] Manual billing
- [ ] Product search
- [ ] Cart
- [ ] Discounts
- [ ] Payment
- [ ] Change calculation
- [ ] Loyalty points
- [ ] Receipt printing

### Phase 4 — Business Management

- [ ] Products
- [ ] Inventory
- [ ] Suppliers
- [ ] Purchases
- [ ] Customers
- [ ] Employees
- [ ] Expenses
- [ ] Branches

### Phase 5 — Backend

- [ ] ASP.NET Core API
- [ ] SQL Server
- [ ] Entity Framework Core
- [ ] Authentication
- [ ] API endpoints
- [ ] Business logic

### Phase 6 — Integration

- [ ] React API integration
- [ ] Authentication integration
- [ ] POS integration
- [ ] Inventory synchronization
- [ ] Reports

### Phase 7 — Production

- [ ] Testing
- [ ] Security review
- [ ] Docker
- [ ] CI/CD
- [ ] Deployment
- [ ] Documentation

---

# 📜 License

This project is currently developed as a learning and portfolio project.

License details will be added when the project reaches its production stage.

---

## 👨‍💻 NexaPOS

**NexaPOS — Smart Retail Billing & Business Management System**

Built with ❤️ using **React + TypeScript + C# + ASP.NET Core + SQL Server**.
