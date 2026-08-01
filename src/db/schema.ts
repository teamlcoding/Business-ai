import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID or internal UID
  username: text('username').notNull().unique(),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role').notNull(), // Super Admin, Business Owner, Branch Manager, Cashier, Employee, Accountant
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  status: text('status').default('Active'), // Active, Suspended, Pending
  refreshToken: text('refresh_token'),
  otpCode: text('otp_code'),
  otpExpiresAt: timestamp('otp_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Organizations Table
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(), // e.g. ORG-1001
  name: text('name').notNull(),
  ownerName: text('owner_name'),
  email: text('email'),
  phone: text('phone'),
  whatsappNumber: text('whatsapp_number'),
  address: text('address'),
  gstin: text('gstin'),
  plan: text('plan').notNull().default('Free'), // Free, Starter, Growth, Business, Enterprise
  businessType: text('business_type').notNull(),
  companySize: text('company_size').default('Medium'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  invoiceLogoUrl: text('invoice_logo_url'),
  receiptLogoUrl: text('receipt_logo_url'),
  primaryColor: text('primary_color').default('#2563eb'),
  secondaryColor: text('secondary_color').default('#4f46e5'),
  status: text('status').default('Active'), // Active, Pending Approval, Suspended, Rejected
  assignedStorageMb: integer('assigned_storage_mb').default(5000),
  assignedModulesJson: text('assigned_modules_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Registration Requests / Pending Approvals Table
export const registration_requests = pgTable('registration_requests', {
  id: text('id').primaryKey(),
  businessName: text('business_name').notNull(),
  ownerName: text('owner_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  businessType: text('business_type').notNull(),
  gstin: text('gstin'),
  address: text('address'),
  logoUrl: text('logo_url'),
  selectedPlan: text('selected_plan').notNull(),
  status: text('status').default('Pending'), // Pending, Approved, Rejected
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Branches Table
export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  code: text('code').notNull(),
  isMain: boolean('is_main').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Roles Table
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  name: text('name').notNull(),
  permissions: text('permissions'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Permissions Table
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  roleId: text('role_id').notNull(),
  module: text('module').notNull(),
  action: text('action').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Customers Table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email'),
  phone: text('phone'),
  gstin: text('gstin'),
  address: text('address'),
  totalSpent: integer('total_spent').default(0),
  outstandingBalance: integer('outstanding_balance').default(0),
  status: text('status').default('Active'),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Vendors Table
export const vendors = pgTable('vendors', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  name: text('name').notNull(),
  company: text('company'),
  phone: text('phone'),
  email: text('email'),
  category: text('category'),
  outstandingBalance: integer('outstanding_balance').default(0),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Products Table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  cost: integer('cost').notNull(),
  stock: integer('stock').notNull().default(0),
  minStockAlert: integer('min_stock_alert').default(10),
  unit: text('unit').default('Pcs'),
  barcode: text('barcode'),
  gstRate: integer('gst_rate').default(18),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Inventory Table
export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  productId: text('product_id').notNull(),
  location: text('location'),
  quantity: integer('quantity').default(0),
  minAlert: integer('min_alert').default(10),
  lastStockTake: text('last_stock_take'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. Invoices / Sales Table
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  docNumber: text('doc_number').notNull(),
  type: text('type').notNull(),
  clientName: text('client_name').notNull(),
  amount: integer('amount').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull(),
  itemsCount: integer('items_count').default(1),
  itemsJson: text('items_json'),
  pdfUrl: text('pdf_url'),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. Purchases Table
export const purchases = pgTable('purchases', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  poNumber: text('po_number').notNull(),
  vendorName: text('vendor_name').notNull(),
  amount: integer('amount').notNull(),
  date: text('date').notNull(),
  status: text('status').default('Pending'),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 12. Payments Table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  invoiceId: text('invoice_id'),
  amount: integer('amount').notNull(),
  paymentMode: text('payment_mode').notNull(),
  referenceNo: text('reference_no'),
  status: text('status').default('Completed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. Employees Table
export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  code: text('code').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  department: text('department').notNull(),
  salary: integer('salary').notNull(),
  attendanceToday: text('attendance_today').default('Present'),
  joinDate: text('join_date').notNull(),
  status: text('status').default('Active'),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 14. Attendance Table
export const attendance = pgTable('attendance', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  employeeId: text('employee_id').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull(),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 15. Payroll Table
export const payroll = pgTable('payroll', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  employeeId: text('employee_id').notNull(),
  month: text('month').notNull(),
  basicSalary: integer('basic_salary').notNull(),
  allowances: integer('allowances').default(0),
  deductions: integer('deductions').default(0),
  netSalary: integer('net_salary').notNull(),
  status: text('status').default('Processed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 16. Documents Table
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  docNumber: text('doc_number').notNull(),
  type: text('type').notNull(),
  clientName: text('client_name').notNull(),
  amount: integer('amount').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull(),
  itemsCount: integer('items_count').default(1),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 17. Projects Table
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  title: text('title').notNull(),
  client: text('client').notNull(),
  budget: integer('budget').notNull(),
  progress: integer('progress').default(0),
  dueDate: text('due_date').notNull(),
  status: text('status').default('In Progress'),
  teamMembers: text('team_members'),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 18. Tasks Table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  branch_id: text('branch_id'),
  projectId: text('project_id'),
  title: text('title').notNull(),
  assignedTo: text('assigned_to'),
  status: text('status').default('Pending'),
  priority: text('priority').default('Medium'),
  dueDate: text('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 19. Subscriptions Table
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  plan: text('plan').notNull(),
  status: text('status').default('Active'),
  validUntil: text('valid_until'),
  paymentHistory: text('payment_history'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 20. Audit Logs Table
export const audit_logs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  organization_id: text('organization_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(),
  module: text('module').notNull(),
  ipAddress: text('ip_address'),
  timestamp: text('timestamp').notNull(),
});

// 21. Dynamic Pricing Plans Table
export const plans = pgTable('plans', {
  id: text('id').primaryKey(), // free, starter, growth, business, enterprise
  name: text('name').notNull(),
  priceMonthly: integer('price_monthly').notNull().default(0),
  priceYearly: integer('price_yearly').notNull().default(0),
  description: text('description').notNull(),
  featuresJson: text('features_json').notNull(),
  isPopular: boolean('is_popular').default(false),
  buttonText: text('button_text').default('Choose Plan'),
  isActive: boolean('is_active').default(true),
});

// 22. Dynamic Landing Page Settings Table
export const landing_settings = pgTable('landing_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

