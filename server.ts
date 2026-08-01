import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './src/db/index.ts';
import * as schema from './src/db/schema.ts';
import { eq, or, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'businessos_jwt_secret_key_2026_x99';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'businessos_refresh_secret_key_2026_z88';

async function seedInitialData() {
  try {
    const existingUsers = await db.select().from(schema.users);
    if (existingUsers.length === 0) {
      console.log('Seeding initial PostgreSQL Organizations and Users...');
      
      // 1. Seed Organizations
      const defaultOrgs = [
        {
          id: 'ORG-SYSTEM',
          name: 'BusinessOS AI Headquarters',
          ownerName: 'Super Administrator',
          email: 'admin@businessos.ai',
          phone: '+91 98765 43210',
          whatsappNumber: '+91 98765 43210',
          plan: 'Enterprise',
          businessType: 'SaaS Platform',
          companySize: 'Enterprise',
          status: 'Active',
          primaryColor: '#2563eb',
          secondaryColor: '#1d4ed8',
        },
        {
          id: 'ORG-1001',
          name: 'Vanguard Retail Chain Ltd',
          ownerName: 'Rohan Deshmukh',
          email: 'rohan@vanguardretail.in',
          phone: '+91 98200 11223',
          whatsappNumber: '+91 98200 11223',
          gstin: '27AABCV8912A1Z5',
          plan: 'Growth',
          businessType: 'Retail',
          companySize: 'Medium',
          status: 'Active',
          primaryColor: '#059669',
          secondaryColor: '#047857',
        },
        {
          id: 'ORG-1002',
          name: 'Apollo Care Hospital & Medical Center',
          ownerName: 'Dr. Ananya Joshi',
          email: 'dr.ananya@apollocare.org',
          phone: '+91 98111 22334',
          whatsappNumber: '+91 98111 22334',
          gstin: '24AAACD1109B1Z2',
          plan: 'Business',
          businessType: 'Hospital / Clinic',
          companySize: 'Enterprise',
          status: 'Active',
          primaryColor: '#2563eb',
          secondaryColor: '#1d4ed8',
        },
        {
          id: 'ORG-1003',
          name: 'Skyline Heavy Construction & Infra',
          ownerName: 'Vikram Rajput',
          email: 'vikram@skylineinfra.com',
          phone: '+91 98990 88776',
          whatsappNumber: '+91 98990 88776',
          gstin: '07AAACS4412K1Z9',
          plan: 'Enterprise',
          businessType: 'Construction',
          companySize: 'Enterprise',
          status: 'Active',
          primaryColor: '#d97706',
          secondaryColor: '#b45309',
        }
      ];

      for (const org of defaultOrgs) {
        await db.insert(schema.organizations).values(org).onConflictDoNothing();
      }

      // 2. Seed Users with Bcrypt Hashing
      const hashedAdminPass = bcrypt.hashSync('ajayr96k', 10);

      const defaultUsers = [
        {
          username: 'ajayrpatil96k@gmail.com',
          email: 'ajayrpatil96k@gmail.com',
          passwordHash: hashedAdminPass,
          name: 'Super Admin',
          phone: '+91 98765 43210',
          role: 'Super Admin',
          organization_id: 'ORG-SYSTEM',
          status: 'Active',
        },
      ];

      for (const user of defaultUsers) {
        await db.insert(schema.users).values(user).onConflictDoNothing();
      }

      // 3. Seed Branches
      const defaultBranches = [
        { id: 'BR-101', organization_id: 'ORG-1001', name: 'Bandra Retail Store', city: 'Mumbai', code: 'BND-01', isMain: true },
        { id: 'BR-102', organization_id: 'ORG-1001', name: 'Andheri Outlet', city: 'Mumbai', code: 'AND-02', isMain: false },
        { id: 'BR-201', organization_id: 'ORG-1002', name: 'Central ICU & Hospital', city: 'Pune', code: 'PUN-01', isMain: true },
        { id: 'BR-301', organization_id: 'ORG-1003', name: 'Metro Flyover Site 4', city: 'Delhi', code: 'DEL-01', isMain: true },
      ];
      for (const br of defaultBranches) {
        await db.insert(schema.branches).values(br).onConflictDoNothing();
      }

      // 4. Seed Products
      const defaultProducts = [
        // Vanguard Retail
        { id: 'PROD-101', organization_id: 'ORG-1001', sku: 'EAR-PRO-01', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2999, cost: 1800, stock: 45, minStockAlert: 10, unit: 'Pcs', gstRate: 18 },
        { id: 'PROD-102', organization_id: 'ORG-1001', sku: 'TEA-GRN-25', name: 'Organic Green Tea 250g', category: 'Groceries', price: 450, cost: 220, stock: 120, minStockAlert: 20, unit: 'Pack', gstRate: 5 },
        { id: 'PROD-103', organization_id: 'ORG-1001', sku: 'WLT-LTR-09', name: 'Premium Leather Wallet', category: 'Fashion', price: 1299, cost: 650, stock: 15, minStockAlert: 5, unit: 'Pcs', gstRate: 12 },
        // Apollo Hospital
        { id: 'PROD-201', organization_id: 'ORG-1002', sku: 'MED-BP-01', name: 'Digital Blood Pressure Monitor', category: 'Medical Devices', price: 1850, cost: 1100, stock: 30, minStockAlert: 10, unit: 'Unit', gstRate: 12 },
        { id: 'PROD-202', organization_id: 'ORG-1002', sku: 'MED-MSK-50', name: 'Surgical Face Masks Box 50', category: 'Consumables', price: 250, cost: 110, stock: 500, minStockAlert: 100, unit: 'Box', gstRate: 5 },
        // Skyline Construction
        { id: 'PROD-301', organization_id: 'ORG-1003', sku: 'CON-CMT-50', name: 'Portland Cement 50kg Bag', category: 'Materials', price: 380, cost: 290, stock: 1500, minStockAlert: 200, unit: 'Bag', gstRate: 28 },
        { id: 'PROD-302', organization_id: 'ORG-1003', sku: 'CON-STL-12', name: 'TMT Steel Rebar 12mm Ton', category: 'Materials', price: 58000, cost: 48000, stock: 25, minStockAlert: 5, unit: 'Ton', gstRate: 18 },
      ];
      for (const prod of defaultProducts) {
        await db.insert(schema.products).values(prod).onConflictDoNothing();
      }

      // 5. Seed Customers
      const defaultCustomers = [
        { id: 'CUST-101', organization_id: 'ORG-1001', name: 'Aarav Sharma', company: 'Sharma Enterprises', email: 'aarav@sharma.in', phone: '+91 98333 44555', totalSpent: 45000, outstandingBalance: 0, status: 'Active' },
        { id: 'CUST-102', organization_id: 'ORG-1001', name: 'Priya Mehta', company: 'Mehta Retail', email: 'priya@mehta.com', phone: '+91 98444 55666', totalSpent: 18500, outstandingBalance: 2500, status: 'Active' },
        { id: 'CUST-201', organization_id: 'ORG-1002', name: 'Max Bupa Health Insurance', company: 'Max Bupa Corp', email: 'claims@maxbupa.org', phone: '+91 98111 99887', totalSpent: 125000, outstandingBalance: 15000, status: 'Active' },
        { id: 'CUST-301', organization_id: 'ORG-1003', name: 'Municipal Infrastructure Board', company: 'Govt of Maharashtra', email: 'projects@mib.gov.in', phone: '+91 98222 11000', totalSpent: 2450000, outstandingBalance: 420000, status: 'Active' },
      ];
      for (const cust of defaultCustomers) {
        await db.insert(schema.customers).values(cust).onConflictDoNothing();
      }

      // 6. Seed Invoices
      const defaultInvoices = [
        { id: 'INV-1001', organization_id: 'ORG-1001', docNumber: 'INV-2026-001', type: 'GST Invoice', clientName: 'Aarav Sharma', amount: 14995, date: '2026-07-28', status: 'Paid', itemsCount: 3 },
        { id: 'INV-1002', organization_id: 'ORG-1001', docNumber: 'INV-2026-002', type: 'GST Invoice', clientName: 'Priya Mehta', amount: 3450, date: '2026-07-30', status: 'Pending', itemsCount: 2 },
        { id: 'INV-2001', organization_id: 'ORG-1002', docNumber: 'INV-MED-101', type: 'Hospital Bill', clientName: 'Max Bupa Health Insurance', amount: 85000, date: '2026-07-29', status: 'Paid', itemsCount: 5 },
        { id: 'INV-3001', organization_id: 'ORG-1003', docNumber: 'INV-INFRA-801', type: 'RA Bill', clientName: 'Municipal Infrastructure Board', amount: 1450000, date: '2026-07-25', status: 'Paid', itemsCount: 12 },
        { id: 'INV-3002', organization_id: 'ORG-1003', docNumber: 'INV-INFRA-802', type: 'RA Bill', clientName: 'Municipal Infrastructure Board', amount: 420000, date: '2026-07-31', status: 'Pending', itemsCount: 4 },
      ];
      for (const inv of defaultInvoices) {
        await db.insert(schema.invoices).values(inv).onConflictDoNothing();
      }

      // 7. Seed Employees
      const defaultEmployees = [
        { id: 'EMP-101', organization_id: 'ORG-1001', code: 'EMP-001', name: 'Rahul Verma', email: 'rahul@vanguardretail.in', role: 'Store Manager', department: 'Retail Operations', salary: 45000, joinDate: '2024-01-15' },
        { id: 'EMP-201', organization_id: 'ORG-1002', code: 'EMP-101', name: 'Dr. Siddharth Nair', email: 'siddharth@apollocare.org', role: 'Senior Surgeon', department: 'Surgery', salary: 180000, joinDate: '2022-06-01' },
        { id: 'EMP-301', organization_id: 'ORG-1003', code: 'EMP-201', name: 'Er. Amit Deshpande', email: 'amit@skylineinfra.com', role: 'Site Director', department: 'Engineering', salary: 120000, joinDate: '2023-03-10' },
      ];
      for (const emp of defaultEmployees) {
        await db.insert(schema.employees).values(emp).onConflictDoNothing();
      }

      console.log('Initial PostgreSQL multi-tenant seeding completed successfully!');
    }

    // Seed Default Plans if empty
    const existingPlans = await db.select().from(schema.plans);
    if (existingPlans.length === 0) {
      console.log('Seeding default membership plans...');
      const defaultPlansList = [
        {
          id: 'free',
          name: 'Free Plan',
          priceMonthly: 0,
          priceYearly: 0,
          description: 'For small shops & single locations',
          featuresJson: JSON.stringify([
            'Cloud POS Billing',
            'Basic Inventory Management',
            'Single User Account',
            'Standard Email Support',
            'Community Knowledge Base'
          ]),
          isPopular: false,
          buttonText: 'Activate Free Plan',
          isActive: true,
        },
        {
          id: 'starter',
          name: 'Starter Plan',
          priceMonthly: 1999,
          priceYearly: 19990,
          description: 'For growing retail stores & single branches',
          featuresJson: JSON.stringify([
            'Multi-Branch POS & Inventory',
            'GST & Tax Compliance Invoicing',
            '3 User Logins & Permissions',
            'Customer CRM & Leads Engine',
            'WhatsApp & Email Notifications'
          ]),
          isPopular: false,
          buttonText: 'Request Starter Plan',
          isActive: true,
        },
        {
          id: 'growth',
          name: 'Growth Plan',
          priceMonthly: 4999,
          priceYearly: 49990,
          description: 'For scaling businesses with team workflows',
          featuresJson: JSON.stringify([
            'All Core Modules (CRM, HR, Finance, Inventory)',
            'Unlimited Invoices & Transactions',
            '10 Multi-Role User Accounts',
            'WhatsApp Marketing Automation',
            'AI Assistant Commands & Insights',
            '24/7 Priority Support'
          ]),
          isPopular: true,
          buttonText: 'Request Growth Plan',
          isActive: true,
        },
        {
          id: 'business',
          name: 'Business Plan',
          priceMonthly: 9999,
          priceYearly: 99990,
          description: 'For multi-location enterprises & healthcare',
          featuresJson: JSON.stringify([
            'Full Enterprise Module Suite',
            'Multi-Branch Audits & Stock Transfers',
            '25 User Logins with RBAC Rules',
            'Custom Domain & Invoice Branding',
            'Dedicated Account Manager',
            'Custom AI Workflows'
          ]),
          isPopular: false,
          buttonText: 'Request Business Plan',
          isActive: true,
        },
        {
          id: 'enterprise',
          name: 'Custom Enterprise',
          priceMonthly: 0,
          priceYearly: 0,
          description: 'Tailored for large corporations & government infra',
          featuresJson: JSON.stringify([
            'Dedicated Private Cloud / On-Premise Instance',
            'Unlimited Users, Branches & Storage',
            'Custom Module & API Integrations',
            'Custom SLA, 99.99% Uptime Guarantee',
            'Onsite Staff Training & Onboarding'
          ]),
          isPopular: false,
          buttonText: 'Contact Sales',
          isActive: true,
        }
      ];

      for (const p of defaultPlansList) {
        await db.insert(schema.plans).values(p).onConflictDoNothing();
      }
    }

    // Seed Default Landing Page Settings if empty
    const existingLanding = await db.select().from(schema.landing_settings);
    if (existingLanding.length === 0) {
      console.log('Seeding default landing page settings...');
      const defaultLandingSettings = [
        { key: 'hero_title', value: 'The AI Executive Operating System for Modern Enterprises' },
        { key: 'hero_subtitle', value: 'Consolidate POS, CRM, HR, Inventory, Finance, and AI Analytics into a single multi-tenant cloud platform.' },
        { key: 'hero_banner_url', value: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80' },
        { key: 'contact_phone', value: '+91 98765 43210' },
        { key: 'contact_email', value: 'sales@businessos.ai' },
        { key: 'whatsapp_number', value: '919876543210' },
      ];

      for (const l of defaultLandingSettings) {
        await db.insert(schema.landing_settings).values(l).onConflictDoNothing();
      }
    }

  } catch (err) {
    console.error('Error during initial database seed:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Run initial seed check
  await seedInitialData();

  // Lazy initialize Gemini AI client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Gemini API features will fall back to simulated response.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // AUTHENTICATION & SUBSCRIPTION ENDPOINTS
  // ==========================================

  // 1. Login Endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required' });
      }

      // Search user by username or email
      const userList = await db.select().from(schema.users).where(
        or(eq(schema.users.username, username), eq(schema.users.email, username))
      );

      if (userList.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = userList[0];

      // Check Password Hash
      if (!user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Check Account Status
      if (user.status === 'Pending') {
        return res.status(403).json({ error: 'Your account is waiting for approval.' });
      }
      if (user.status === 'Suspended') {
        return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
      }

      // Check Organization Status
      let organization = null;
      if (user.organization_id && user.organization_id !== 'ORG-SYSTEM') {
        const orgList = await db.select().from(schema.organizations).where(eq(schema.organizations.id, user.organization_id));
        if (orgList.length > 0) {
          organization = orgList[0];
          if (organization.status === 'Pending Approval') {
            return res.status(403).json({ error: 'Your account is waiting for approval.' });
          }
          if (organization.status === 'Suspended' || organization.status === 'Rejected') {
            return res.status(403).json({ error: `Your business account is ${organization.status.toLowerCase()}. Please contact support.` });
          }
        }
      }

      // Generate JWT Access Token & Refresh Token
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        organization_id: user.organization_id,
        branch_id: user.branch_id,
        status: user.status,
      };

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
      const refreshToken = jwt.sign({ id: user.id, username: user.username }, REFRESH_SECRET, { expiresIn: '7d' });

      // Store refresh token in DB
      await db.update(schema.users).set({ refreshToken }).where(eq(schema.users.id, user.id));

      return res.json({
        accessToken,
        refreshToken,
        user: tokenPayload,
        organization,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  // 2. Business Registration Endpoint
  app.post('/api/auth/register-business', async (req, res) => {
    try {
      const {
        businessName,
        ownerName,
        phone,
        email,
        businessType,
        gstin,
        address,
        logoUrl,
        selectedPlan, // 'Free' | 'Starter' | 'Growth' | 'Business' | 'Enterprise'
      } = req.body;

      if (!businessName || !ownerName || !email || !phone || !selectedPlan) {
        return res.status(400).json({ error: 'Please provide all required business details and select a plan.' });
      }

      const isFreePlan = selectedPlan === 'Free';

      if (isFreePlan) {
        // FREE PLAN: Automatic immediate activation
        const orgId = `ORG-FREE-${Math.floor(1000 + Math.random() * 9000)}`;
        const generatedUsername = `user_${email.split('@')[0].replace(/[^a-z0-9]/g, '')}_${Math.floor(100 + Math.random() * 900)}`;
        const defaultPassword = `Free@${Math.floor(1000 + Math.random() * 9000)}`;
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

        // 1. Create Organization
        const [org] = await db.insert(schema.organizations).values({
          id: orgId,
          name: businessName,
          ownerName,
          email,
          phone,
          whatsappNumber: phone,
          address: address || '',
          gstin: gstin || '',
          plan: 'Free',
          businessType: businessType || 'Retail',
          companySize: 'Small',
          logoUrl: logoUrl || '',
          status: 'Active',
          assignedStorageMb: 1000,
        }).returning();

        // 2. Create Main Branch
        const branchId = `BR-${Math.floor(100 + Math.random() * 900)}`;
        await db.insert(schema.branches).values({
          id: branchId,
          organization_id: orgId,
          name: `${businessName} Main Branch`,
          city: address ? address.split(',')[0] : 'Main City',
          code: 'MAIN-01',
          isMain: true,
        });

        // 3. Create Owner User
        const [newUser] = await db.insert(schema.users).values({
          username: generatedUsername,
          email,
          passwordHash: hashedPassword,
          name: ownerName,
          phone,
          role: 'Business Owner',
          organization_id: orgId,
          branch_id: branchId,
          status: 'Active',
        }).returning();

        // Sign Tokens
        const tokenPayload = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          organization_id: orgId,
          branch_id: branchId,
          status: 'Active',
        };

        const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
        const refreshToken = jwt.sign({ id: newUser.id, username: newUser.username }, REFRESH_SECRET, { expiresIn: '7d' });

        return res.json({
          autoActivated: true,
          message: 'Free account activated immediately!',
          accessToken,
          refreshToken,
          generatedUsername,
          generatedPassword: defaultPassword,
          user: tokenPayload,
          organization: org,
        });
      } else {
        // PAID PLAN: Create Pending Registration Request & Redirect to WhatsApp
        const requestId = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
        
        await db.insert(schema.registration_requests).values({
          id: requestId,
          businessName,
          ownerName,
          email,
          phone,
          businessType: businessType || 'Retail',
          gstin: gstin || '',
          address: address || '',
          logoUrl: logoUrl || '',
          selectedPlan,
          status: 'Pending',
        });

        // Pre-fill WhatsApp message text
        const waText = `Hi BusinessOS AI Team,\nI have submitted a new business registration for approval.\n\n` +
          `*Business Name:* ${businessName}\n` +
          `*Owner Name:* ${ownerName}\n` +
          `*Phone:* ${phone}\n` +
          `*Email:* ${email}\n` +
          `*Business Type:* ${businessType}\n` +
          `*Selected Plan:* ${selectedPlan}\n` +
          `*Request ID:* ${requestId}\n\n` +
          `Please approve my account so I can start using BusinessOS AI.`;

        const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(waText)}`;

        return res.json({
          autoActivated: false,
          status: 'Pending Approval',
          message: 'Registration submitted! Opening WhatsApp to contact BusinessOS AI team for manual approval.',
          whatsappUrl,
          requestId,
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  // 3. Forgot Password Endpoint (WhatsApp Verification to Super Admin)
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { businessName, email, phone } = req.body;
      if (!businessName || !email) {
        return res.status(400).json({ error: 'Business Name and Email ID are required.' });
      }

      // Check user record
      const usersList = await db.select().from(schema.users).where(
        or(eq(schema.users.email, email), eq(schema.users.username, email))
      );

      const user = usersList.length > 0 ? usersList[0] : null;
      let orgName = businessName;

      if (user && user.organization_id) {
        const orgs = await db.select().from(schema.organizations).where(eq(schema.organizations.id, user.organization_id));
        if (orgs.length > 0) {
          orgName = orgs[0].name;
        }
      }

      // Generate pre-filled WhatsApp message for Super Admin verification
      const waText = `Hi Super Admin,\n\nPASSWORD RESET REQUEST:\n` +
        `*Business Name:* ${orgName}\n` +
        `*Registered Email:* ${email}\n` +
        `*Contact Phone:* ${phone || user?.phone || 'N/A'}\n` +
        `*User Role:* ${user?.role || 'User / Business Owner'}\n\n` +
        `Please verify this business identity and issue a temporary password.`;

      const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(waText)}`;

      return res.json({
        success: true,
        message: 'Password reset request prepared! Redirecting to WhatsApp to send request to Super Admin for verification.',
        whatsappUrl,
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      res.status(500).json({ error: err.message || 'Failed to process forgot password request' });
    }
  });

  // 4. Verify OTP & Reset Password Endpoint
  app.post('/api/auth/verify-otp-reset-password', async (req, res) => {
    try {
      const { emailOrUsername, otpCode, newPassword } = req.body;
      if (!emailOrUsername || !otpCode || !newPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      const usersList = await db.select().from(schema.users).where(
        or(eq(schema.users.username, emailOrUsername), eq(schema.users.email, emailOrUsername))
      );

      if (usersList.length === 0) {
        return res.status(400).json({ error: 'Account not found.' });
      }

      const user = usersList[0];
      if (!user.otpCode || user.otpCode !== otpCode) {
        return res.status(400).json({ error: 'Invalid verification OTP code.' });
      }

      const passwordHash = bcrypt.hashSync(newPassword, 10);
      await db.update(schema.users)
        .set({ passwordHash, otpCode: null, otpExpiresAt: null })
        .where(eq(schema.users.id, user.id));

      return res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
    } catch (err: any) {
      console.error('OTP reset error:', err);
      res.status(500).json({ error: err.message || 'OTP reset failed' });
    }
  });

  // ==========================================
  // PUBLIC DYNAMIC DATA ENDPOINTS
  // ==========================================

  // Public Plans
  app.get('/api/public/plans', async (_req, res) => {
    try {
      const activePlans = await db.select().from(schema.plans);
      res.json(activePlans);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public Landing Settings
  app.get('/api/public/landing-settings', async (_req, res) => {
    try {
      const settings = await db.select().from(schema.landing_settings);
      const settingsMap: Record<string, string> = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      res.json(settingsMap);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // SUPER ADMIN MANAGEMENT ENDPOINTS
  // ==========================================

  // Update Plan Pricing / Features (Super Admin)
  app.put('/api/admin/plans', async (req, res) => {
    try {
      const { id, name, priceMonthly, priceYearly, description, featuresJson, isPopular, buttonText, isActive } = req.body;
      if (!id) return res.status(400).json({ error: 'Plan id is required' });

      const updated = await db.update(schema.plans)
        .set({
          name,
          priceMonthly: Number(priceMonthly) || 0,
          priceYearly: Number(priceYearly) || 0,
          description,
          featuresJson: Array.isArray(featuresJson) ? JSON.stringify(featuresJson) : featuresJson,
          isPopular: Boolean(isPopular),
          buttonText,
          isActive: Boolean(isActive),
        })
        .where(eq(schema.plans.id, id))
        .returning();

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create New Plan (Super Admin)
  app.post('/api/admin/plans', async (req, res) => {
    try {
      const { id, name, priceMonthly, priceYearly, description, featuresJson, isPopular, buttonText, isActive } = req.body;
      const planId = id || `plan-${Date.now()}`;
      const created = await db.insert(schema.plans).values({
        id: planId,
        name: name || 'Custom Plan',
        priceMonthly: Number(priceMonthly) || 0,
        priceYearly: Number(priceYearly) || 0,
        description: description || 'Custom membership plan',
        featuresJson: Array.isArray(featuresJson) ? JSON.stringify(featuresJson) : (featuresJson || '[]'),
        isPopular: Boolean(isPopular),
        buttonText: buttonText || 'Choose Plan',
        isActive: isActive !== false,
      }).returning();

      res.json(created[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Landing Settings (Super Admin)
  app.put('/api/admin/landing-settings', async (req, res) => {
    try {
      const { settings } = req.body; // e.g. { hero_title: '...', hero_subtitle: '...' }
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'settings object is required' });
      }

      for (const [key, value] of Object.entries(settings)) {
        await db.insert(schema.landing_settings)
          .values({ key, value: String(value) })
          .onConflictDoUpdate({ target: schema.landing_settings.key, set: { value: String(value) } });
      }

      res.json({ success: true, message: 'Landing settings updated successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Change Organization Status (Approve / Reject / Suspend / Activate)
  app.put('/api/admin/organizations/status', async (req, res) => {
    try {
      const { orgId, status } = req.body;
      if (!orgId || !status) return res.status(400).json({ error: 'orgId and status are required' });

      const updated = await db.update(schema.organizations)
        .set({ status })
        .where(eq(schema.organizations.id, orgId))
        .returning();

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Change Organization Modules (Super Admin)
  app.put('/api/admin/organizations/modules', async (req, res) => {
    try {
      const { orgId, modules } = req.body;
      if (!orgId || !Array.isArray(modules)) return res.status(400).json({ error: 'orgId and modules array are required' });

      const updated = await db.update(schema.organizations)
        .set({ assignedModulesJson: JSON.stringify(modules) })
        .where(eq(schema.organizations.id, orgId))
        .returning();

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Get Pending Registration Requests

  app.get('/api/admin/pending-requests', async (_req, res) => {
    try {
      const requests = await db.select().from(schema.registration_requests);
      res.json(requests);
    } catch (err: any) {
      console.error('Error fetching registration requests:', err);
      res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
  });

  // 6. Approve Registration Request
  app.post('/api/admin/approve-request', async (req, res) => {
    try {
      const { requestId, assignedStorageMb, assignedModules } = req.body;
      if (!requestId) {
        return res.status(400).json({ error: 'requestId is required' });
      }

      const reqList = await db.select().from(schema.registration_requests).where(eq(schema.registration_requests.id, requestId));
      if (reqList.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }

      const request = reqList[0];
      const orgId = `ORG-${Math.floor(1000 + Math.random() * 9000)}`;
      const branchId = `BR-${Math.floor(100 + Math.random() * 900)}`;
      const tempUsername = `user_${request.ownerName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(100 + Math.random() * 900)}`;
      const tempPassword = `Pass@${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = bcrypt.hashSync(tempPassword, 10);

      // 1. Create Organization in Active status
      await db.insert(schema.organizations).values({
        id: orgId,
        name: request.businessName,
        ownerName: request.ownerName,
        email: request.email,
        phone: request.phone,
        whatsappNumber: request.phone,
        address: request.address || '',
        gstin: request.gstin || '',
        plan: request.selectedPlan,
        businessType: request.businessType,
        status: 'Active',
        assignedStorageMb: assignedStorageMb || 5000,
        assignedModulesJson: JSON.stringify(assignedModules || ['POS', 'CRM', 'Inventory', 'Finance', 'HR']),
      });

      // 2. Create Branch
      await db.insert(schema.branches).values({
        id: branchId,
        organization_id: orgId,
        name: `${request.businessName} Main Headquarter`,
        city: request.address ? request.address.split(',')[0] : 'Main City',
        code: 'HQ-01',
        isMain: true,
      });

      // 3. Create Owner User
      await db.insert(schema.users).values({
        username: tempUsername,
        email: request.email,
        passwordHash,
        name: request.ownerName,
        phone: request.phone,
        role: 'Business Owner',
        organization_id: orgId,
        branch_id: branchId,
        status: 'Active',
      });

      // 4. Update Registration Request Status
      await db.update(schema.registration_requests)
        .set({ status: 'Approved' })
        .where(eq(schema.registration_requests.id, requestId));

      // 5. Pre-fill WhatsApp notification message for dispatching credentials
      const waText = `Dear ${request.ownerName},\nYour BusinessOS AI account for *${request.businessName}* has been APPROVED!\n\n` +
        `*Organization ID:* ${orgId}\n` +
        `*Membership Plan:* ${request.selectedPlan}\n` +
        `*Username:* ${tempUsername}\n` +
        `*Temporary Password:* ${tempPassword}\n\n` +
        `You can now log in at: https://ais-dev-qiulobj3duzr4xqpkesrjg-306236073531.asia-southeast1.run.app\n\n` +
        `Welcome to BusinessOS AI!`;

      const whatsappUrl = `https://wa.me/${request.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;

      return res.json({
        success: true,
        message: 'Account approved successfully! Credentials created.',
        orgId,
        tempUsername,
        tempPassword,
        whatsappUrl,
      });
    } catch (err: any) {
      console.error('Approve request error:', err);
      res.status(500).json({ error: err.message || 'Failed to approve request' });
    }
  });

  // 7. Reject Registration Request
  app.post('/api/admin/reject-request', async (req, res) => {
    try {
      const { requestId, notes } = req.body;
      await db.update(schema.registration_requests)
        .set({ status: 'Rejected', notes: notes || 'Rejected by super admin' })
        .where(eq(schema.registration_requests.id, requestId));
      res.json({ success: true, message: 'Request rejected' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // BRANDING & TENANT SETTINGS ENDPOINTS
  // ==========================================

  // Middleware for JWT Authentication and Tenant Extraction
  app.use((req: any, _res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        // Token invalid or expired
      }
    }
    next();
  });

  const getTargetOrgId = (req: any): string | null => {
    // If authenticated non-admin user, restrict strictly to their assigned organization_id
    if (req.user && req.user.role !== 'Super Admin' && req.user.organization_id && req.user.organization_id !== 'ORG-SYSTEM') {
      return req.user.organization_id;
    }
    // Otherwise allow explicit header, query or body organization_id
    return (req.headers['x-organization-id'] as string) || (req.query.organization_id as string) || (req.body.organization_id as string) || null;
  };

  // ==========================================
  // BRANDING & TENANT SETTINGS ENDPOINTS
  // ==========================================

  // Get Branding Settings
  app.get('/api/tenant/branding', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });

      const orgList = await db.select().from(schema.organizations).where(eq(schema.organizations.id, orgId));
      if (orgList.length === 0) return res.status(404).json({ error: 'Organization not found' });

      res.json(orgList[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Branding Settings
  app.put('/api/tenant/branding', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });

      const {
        logoUrl,
        faviconUrl,
        invoiceLogoUrl,
        receiptLogoUrl,
        primaryColor,
        secondaryColor,
        name,
        address,
        gstin,
        phone,
        whatsappNumber,
      } = req.body;

      const updated = await db.update(schema.organizations)
        .set({
          logoUrl,
          faviconUrl,
          invoiceLogoUrl,
          receiptLogoUrl,
          primaryColor,
          secondaryColor,
          name,
          address,
          gstin,
          phone,
          whatsappNumber,
        })
        .where(eq(schema.organizations.id, orgId))
        .returning();

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dynamic Live Summary Endpoint for Active Tenant Dashboard
  app.get('/api/tenant/summary', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });

      const [orgList, productsList, invoicesList, customersList, employeesList, branchesList] = await Promise.all([
        db.select().from(schema.organizations).where(eq(schema.organizations.id, orgId)),
        db.select().from(schema.products).where(eq(schema.products.organization_id, orgId)),
        db.select().from(schema.invoices).where(eq(schema.invoices.organization_id, orgId)),
        db.select().from(schema.customers).where(eq(schema.customers.organization_id, orgId)),
        db.select().from(schema.employees).where(eq(schema.employees.organization_id, orgId)),
        db.select().from(schema.branches).where(eq(schema.branches.organization_id, orgId)),
      ]);

      const totalRevenue = invoicesList
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);

      const pendingAmount = invoicesList
        .filter(inv => inv.status === 'Pending' || inv.status === 'Unpaid')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);

      const lowStockCount = productsList
        .filter(p => (p.stock || 0) <= (p.minStockAlert || 10)).length;

      res.json({
        organization: orgList[0] || null,
        totalRevenue,
        pendingAmount,
        productsCount: productsList.length,
        invoicesCount: invoicesList.length,
        customersCount: customersList.length,
        employeesCount: employeesList.length,
        branchesCount: branchesList.length,
        lowStockCount,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Tenant Organizations List (Super Admin only or logged in user's org)
  app.get('/api/tenant/organizations', async (req: any, res) => {
    try {
      if (req.user && req.user.role !== 'Super Admin' && req.user.organization_id !== 'ORG-SYSTEM') {
        const orgs = await db.select().from(schema.organizations).where(eq(schema.organizations.id, req.user.organization_id));
        return res.json(orgs);
      }
      const orgs = await db.select().from(schema.organizations);
      res.json(orgs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Products CRUD
  app.get('/api/tenant/products', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const productsList = await db.select().from(schema.products).where(eq(schema.products.organization_id, orgId));
      res.json(productsList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/products', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const p = req.body;
      const result = await db.insert(schema.products).values({
        id: p.id || `PROD-${Date.now()}`,
        organization_id: orgId,
        branch_id: p.branch_id || null,
        sku: p.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
        name: p.name,
        category: p.category || 'General',
        price: Number(p.price) || 0,
        cost: Number(p.cost) || 0,
        stock: Number(p.stock) || 0,
        minStockAlert: Number(p.minStockAlert) || 10,
        unit: p.unit || 'Pcs',
        barcode: p.barcode || '',
        gstRate: Number(p.gstRate) || 18,
      }).returning();
      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Invoices CRUD
  app.get('/api/tenant/invoices', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const invList = await db.select().from(schema.invoices).where(eq(schema.invoices.organization_id, orgId));
      res.json(invList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/invoices', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const inv = req.body;
      const result = await db.insert(schema.invoices).values({
        id: inv.id || `INV-${Date.now()}`,
        organization_id: orgId,
        branch_id: inv.branch_id || null,
        docNumber: inv.docNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        type: inv.type || 'GST Invoice',
        clientName: inv.clientName || 'Walk-in Customer',
        amount: Number(inv.amount) || 0,
        date: inv.date || new Date().toISOString().split('T')[0],
        status: inv.status || 'Paid',
        itemsCount: Number(inv.itemsCount) || 1,
        itemsJson: inv.itemsJson ? JSON.stringify(inv.itemsJson) : null,
      }).returning();
      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Customers CRUD
  app.get('/api/tenant/customers', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const list = await db.select().from(schema.customers).where(eq(schema.customers.organization_id, orgId));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/customers', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const c = req.body;
      const result = await db.insert(schema.customers).values({
        id: c.id || `CUST-${Date.now()}`,
        organization_id: orgId,
        branch_id: c.branch_id || null,
        name: c.name,
        company: c.company || '',
        email: c.email || '',
        phone: c.phone || '',
        gstin: c.gstin || '',
        address: c.address || '',
        totalSpent: Number(c.totalSpent) || 0,
        outstandingBalance: Number(c.outstandingBalance) || 0,
        status: c.status || 'Active',
      }).returning();
      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vendors CRUD
  app.get('/api/tenant/vendors', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const list = await db.select().from(schema.vendors).where(eq(schema.vendors.organization_id, orgId));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/vendors', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const v = req.body;
      const result = await db.insert(schema.vendors).values({
        id: v.id || `VEND-${Date.now()}`,
        organization_id: orgId,
        branch_id: v.branch_id || null,
        name: v.name,
        company: v.company || '',
        email: v.email || '',
        phone: v.phone || '',
        category: v.category || 'General',
        outstandingBalance: Number(v.outstandingBalance) || 0,
      }).returning();
      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Employees CRUD
  app.get('/api/tenant/employees', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const list = await db.select().from(schema.employees).where(eq(schema.employees.organization_id, orgId));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/employees', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const e = req.body;
      const result = await db.insert(schema.employees).values({
        id: e.id || `EMP-${Date.now()}`,
        organization_id: orgId,
        branch_id: e.branch_id || null,
        code: e.code || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        name: e.name,
        email: e.email || '',
        role: e.role || 'Staff',
        department: e.department || 'Operations',
        salary: Number(e.salary) || 30000,
        joinDate: e.joinDate || new Date().toISOString().split('T')[0],
        status: e.status || 'Active',
      }).returning();
      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Branches CRUD
  app.get('/api/tenant/branches', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const list = await db.select().from(schema.branches).where(eq(schema.branches.organization_id, orgId));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/branches', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const b = req.body;
      const result = await db.insert(schema.branches).values({
        id: b.id || `BR-${Date.now()}`,
        organization_id: orgId,
        name: b.name,
        city: b.city || 'Main City',
        code: b.code || `BR-${Math.floor(10 + Math.random() * 90)}`,
        isMain: Boolean(b.isMain),
      }).returning();
      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Users Management CRUD (Tenant Isolation)
  app.get('/api/tenant/users', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });

      // If super admin, return all or filtered by query orgId
      if (req.user?.role === 'Super Admin' && !req.query.organization_id) {
        const allUsers = await db.select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          name: schema.users.name,
          phone: schema.users.phone,
          role: schema.users.role,
          organization_id: schema.users.organization_id,
          branch_id: schema.users.branch_id,
          status: schema.users.status,
          createdAt: schema.users.createdAt,
        }).from(schema.users);
        return res.json(allUsers);
      }

      const usersList = await db.select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        name: schema.users.name,
        phone: schema.users.phone,
        role: schema.users.role,
        organization_id: schema.users.organization_id,
        branch_id: schema.users.branch_id,
        status: schema.users.status,
        createdAt: schema.users.createdAt,
      }).from(schema.users).where(eq(schema.users.organization_id, orgId));

      res.json(usersList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/users', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });

      const { username, name, email, phone, role, password, branch_id } = req.body;
      if (!username || !name || !email || !role || !password) {
        return res.status(400).json({ error: 'username, name, email, role, and password are required' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const result = await db.insert(schema.users).values({
        username,
        email,
        passwordHash,
        name,
        phone: phone || '',
        role, // Business Owner, Manager, HR, Accountant, Sales, Inventory, Cashier, Employee, Customer Portal, Vendor Portal
        organization_id: orgId,
        branch_id: branch_id || null,
        status: 'Active',
      }).returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        name: schema.users.name,
        role: schema.users.role,
        organization_id: schema.users.organization_id,
        status: schema.users.status,
      });

      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/users/reset-password', async (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) return res.status(400).json({ error: 'userId and newPassword are required' });

      const passwordHash = bcrypt.hashSync(newPassword, 10);
      await db.update(schema.users)
        .set({ passwordHash })
        .where(eq(schema.users.id, Number(userId)));

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Documents CRUD
  app.get('/api/tenant/documents', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const docs = await db.select().from(schema.documents).where(eq(schema.documents.organization_id, orgId));
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/documents', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const d = req.body;
      const result = await db.insert(schema.documents).values({
        id: d.id || `DOC-${Date.now()}`,
        organization_id: orgId,
        branch_id: d.branch_id || null,
        docNumber: d.docNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        type: d.type || 'Document',
        clientName: d.clientName || 'General Client',
        amount: Number(d.amount) || 0,
        date: d.date || new Date().toISOString().split('T')[0],
        status: d.status || 'Active',
        itemsCount: Number(d.itemsCount) || 1,
      }).returning();
      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Projects CRUD
  app.get('/api/tenant/projects', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const prjs = await db.select().from(schema.projects).where(eq(schema.projects.organization_id, orgId));
      res.json(prjs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tenant/projects', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });
      const p = req.body;
      const result = await db.insert(schema.projects).values({
        id: p.id || `PRJ-${Date.now()}`,
        organization_id: orgId,
        branch_id: p.branch_id || null,
        title: p.title,
        client: p.client || 'Internal',
        budget: Number(p.budget) || 0,
        progress: Number(p.progress) || 0,
        dueDate: p.dueDate || new Date().toISOString().split('T')[0],
        status: p.status || 'In Progress',
        teamMembers: p.teamMembers || '',
      }).returning();
      res.json(result[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Audit Logs API
  app.get('/api/tenant/audit-logs', async (req, res) => {
    try {
      const orgId = getTargetOrgId(req);
      if (!orgId) return res.status(400).json({ error: 'organization_id is required' });

      if (req.user?.role === 'Super Admin' && !req.query.organization_id) {
        const logs = await db.select().from(schema.audit_logs);
        return res.json(logs);
      }

      const logs = await db.select().from(schema.audit_logs).where(eq(schema.audit_logs.organization_id, orgId));
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // AI Natural Language Command Execution Proxy Endpoint
  app.post('/api/ai/command', async (req, res) => {
    try {
      const { prompt, businessType, activeRole } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.json({
          response: `Executing OS Command: "${prompt}". (Simulated preview mode)`,
          action: 'NAVIGATE_OR_FILTER',
          targetModule: 'dashboard',
          data: { query: prompt }
        });
      }

      const systemInstruction = `You are BusinessOS AI, an intelligent executive operating system assistant for a business of type "${businessType || 'General Enterprise'}" operating under user role "${activeRole || 'Business Owner'}".
Your job is to parse the user's natural language command and decide on the best OS action.

Respond ONLY with valid JSON in the following format:
{
  "response": "Short friendly executive reply explaining what action was taken",
  "action": "NAVIGATE" | "CREATE_INVOICE" | "SEND_WHATSAPP" | "SHOW_REPORT" | "FILTER_INVENTORY" | "GENERATE_SALARY",
  "targetModule": "dashboard" | "pos" | "documents" | "whatsapp" | "crm" | "hr" | "inventory" | "finance" | "projects" | "support" | "reports" | "settings",
  "highlights": ["Key insight 1", "Key insight 2"],
  "payload": {}
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        }
      });

      const jsonText = response.text || '{}';
      try {
        const parsed = JSON.parse(jsonText);
        return res.json(parsed);
      } catch {
        return res.json({
          response: response.text || 'Command processed successfully.',
          action: 'NAVIGATE',
          targetModule: 'dashboard',
          highlights: ['Command processed via BusinessOS AI engine']
        });
      }
    } catch (err: any) {
      console.error('AI command error:', err);
      res.status(500).json({ error: err.message || 'Error processing AI command' });
    }
  });

  // AI Executive Business Insights Endpoint
  app.post('/api/ai/insights', async (req, res) => {
    try {
      const { sales, expenses, pendingPayments, lowStockCount, businessType } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          healthScore: 92,
          grade: 'A+',
          summary: 'Business operations are performing healthily with stable revenue and manageable expenses.',
          recommendations: [
            'Follow up on ₹12,450 in pending customer invoices before month-end.',
            'Restock 3 low-stock items in Primary Warehouse to prevent order fulfillment delay.',
            'Consider launching a WhatsApp promotional campaign for loyal CRM contacts.'
          ]
        });
      }

      const prompt = `Analyze this business status for a ${businessType || 'Retail/Enterprise'} business:
- Sales: ₹${sales || 148500}
- Expenses: ₹${expenses || 42100}
- Pending Customer Payments: ₹${pendingPayments || 32000}
- Low Stock Items Count: ${lowStockCount || 3}

Provide an executive summary and 3 high-impact actionable recommendations in JSON:
{
  "healthScore": 88,
  "grade": "A" | "A+" | "B" | "C",
  "summary": "Executive summary text...",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('AI insights error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate AI insights' });
    }
  });

  // AI Resume Screening Endpoint for HR
  app.post('/api/ai/resume-screen', async (req, res) => {
    try {
      const { resumeText, targetRole } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          matchScore: 88,
          fitLevel: 'High Match',
          keyStrengths: ['5+ years relevant domain experience', 'Strong leadership and technical execution', 'Proven track record in cross-functional delivery'],
          concerns: ['Notice period is 60 days'],
          recommendation: 'Recommend proceeding to technical interview round.'
        });
      }

      const prompt = `Screen this candidate resume for the role of "${targetRole || 'Software Engineer'}":
Resume Content: "${resumeText || 'Experienced professional with background in full-stack architecture, project management, and customer operations.'}"

Return JSON evaluation:
{
  "matchScore": 85,
  "fitLevel": "High Match" | "Moderate Match" | "Low Match",
  "keyStrengths": ["Strength 1", "Strength 2"],
  "concerns": ["Concern 1"],
  "recommendation": "Executive hiring recommendation statement"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('AI resume screening error:', err);
      res.status(500).json({ error: err.message || 'Failed to screen resume' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BusinessOS AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
