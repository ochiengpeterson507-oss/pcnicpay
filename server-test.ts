// @ts-nocheck
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import cors from 'cors';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing. Please provide NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const app = express();
app.use(cors());
app.use(express.json());

let io = null;
const emitEvent = (event, data) => {
  if (io) {
    emitEvent(event, data);
  }
};

async function startServer() {
  const PORT = 3000;
  const httpServer = createHttpServer(app);
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
    }
  });

  // Socket.IO
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const JWT_SECRET = process.env.JWT_SECRET || 'picnicpay_super_secret_key_change_me_in_production';

  // API Routes
  const apiRouter = express.Router();

  apiRouter.post('/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const { data: existingUser } = await getSupabase().from('User').select('*').eq('email', email).maybeSingle();
      if (existingUser) return res.status(400).json({ error: 'Email already exists' });
      
      const passwordHash = await bcrypt.hash(password, 10);
      const { count } = await getSupabase().from('User').select('*', { count: 'exact', head: true });
      const isFirstUser = count === 0;
      
      const { data: user, error: createError }: any = await getSupabase().from('User').insert({
        id: crypto.randomUUID(),
        email,
        passwordHash,
        name,
        role: isFirstUser ? 'ADMIN' : 'MEMBER',
        updatedAt: new Date().toISOString()
      }).select().single();
      
      if (createError || !user) throw createError || new Error('Failed to create user');
      
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Server error', details: error });
    }
  });

  apiRouter.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const { data: user } = await getSupabase().from('User').select('*').eq('email', email).maybeSingle();
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Server error', details: error });
    }
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };


  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.sendStatus(403);
    }
  };

  apiRouter.get('/user/me', authenticateToken, async (req: any, res: any) => {
    try {
      const { data: user } = await getSupabase().from('User').select('*').eq('id', req.user.id).maybeSingle();
      if (!user) return res.sendStatus(404);
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, phone: user.phone });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  apiRouter.get('/payments', async (req: any, res: any) => {
    try {
      const { data: payments } = await getSupabase().from('Payment')
        .select('*, user:User(name, avatarUrl)')
        .order('date', { ascending: false });
      res.json(payments || []);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });
  
  apiRouter.post('/payments/simulate', async (req, res) => {
    // Webhook simulation for a payment
    try {
      const { amount, userId } = req.body;
      const { data: payment, error: insertError } = await getSupabase().from('Payment').insert({
        amount: parseFloat(amount),
        reference: `REF-${Math.floor(Math.random() * 1000000)}`,
        userId,
        status: 'COMPLETED'
      }).select('*, user:User(name, avatarUrl)').single();
      
      emitEvent('new-payment', payment);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create payment' });
    }
  });
  
  apiRouter.get('/stats', async (req: any, res: any) => {
    try {
      const [{ count: totalMembers }, { data: paymentsData }, { data: expensesData }] = await Promise.all([
        getSupabase().from('User').select('*', { count: 'exact', head: true }),
        getSupabase().from('Payment').select('amount'),
        getSupabase().from('Expense').select('amount')
      ]);
      
      const totalPaymentsAmount = paymentsData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
      const totalExpensesAmount = expensesData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
      const balance = totalPaymentsAmount - totalExpensesAmount;
      
      res.json({
        members: totalMembers || 0,
        collected: totalPaymentsAmount,
        expenses: totalExpensesAmount,
        balance
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // Get Daraja Token
  
  
  

  
  apiRouter.post('/payments/paystack/initialize', authenticateToken, async (req: any, res: any) => {
    try {
      const { amount, currency = 'KES' } = req.body;
      if (!process.env.PAYSTACK_SECRET_KEY) {
        return res.status(400).json({ error: 'Paystack Secret Key is missing. Please configure it in settings.' });
      }
      let email = req.body.email || req.user?.email;
      if (!email || email.trim() === '') {
         try {
             const { data: dbUser } = await getSupabase().from('User').select('email').eq('id', req.user.id).single();
             if (dbUser && dbUser.email) email = dbUser.email;
         } catch (e) {
             console.error("Failed to get email", e);
         }
      }
      if (!email || email.trim() === '') {
         email = 'guest@example.com'; // Ultimate fallback to prevent Paystack crash
      }
      if (!email) {
         const { data: dbUser } = await getSupabase().from('User').select('email').eq('id', req.user.id).single();
         if (dbUser) email = dbUser.email;
      }
      if (!email) {
         return res.status(400).json({ error: 'Email Address is required. body_email: ' + req.body.email + ', user_id: ' + req.user.id });
      }
      
      const SUPPORTED_CURRENCIES = ['NGN', 'GHS', 'ZAR', 'USD', 'KES', 'RWF', 'XOF', 'EGP'];
      if (!SUPPORTED_CURRENCIES.includes(currency)) {
        return res.status(400).json({ error: `Currency ${currency} is not supported by Paystack.` });
      }

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount * 100,
          email,
          currency,
          reference: new Date().getTime().toString()
        })
      });
      const data = await response.json();
      
      if (!data.status) {
        if (data.message && data.message.toLowerCase().includes('currency not supported')) {
          return res.status(400).json({ error: `This Paystack account is not enabled for ${currency}. Please use a supported currency.` });
        }
        if (data.message && data.message.toLowerCase() === 'invalid key') {
          return res.status(400).json({ error: 'Invalid Paystack API key. Please check your settings.' });
        }
        return res.status(400).json({ error: data.message });
      }
      
      res.json(data.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post('/payments/paystack/verify', authenticateToken, async (req, res) => {
    try {
      const { reference } = req.body;
      const userId = req.user.id;
      
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      });
      
      const data = await response.json();
      
      if (data.status && data.data.status === 'success') {
        const amount = data.data.amount / 100;
        
        const { data: existing } = await getSupabase().from('Payment')
          .select('*')
          .eq('payment_reference', reference)
          .maybeSingle();
          
        if (!existing) {
          const { data: payment } = await getSupabase().from('Payment').insert({
            amount,
            currency: data.data.currency || 'KES',
            payment_reference: reference,
            user_id: userId,
            payment_status: 'COMPLETED',
            paystack_transaction_id: data.data.id.toString(),
            payment_method: data.data.channel,
            payment_channel: data.data.channel,
            paid_at: data.data.paid_at || new Date().toISOString()
          }).select('*, user:User(name, avatarUrl)').single();
          
          emitEvent('new-payment', payment);
          
          await getSupabase().from('Notification').insert({
             title: 'Payment Received',
             message: `Your contribution of ${data.data.currency || 'KES'} ${amount} was received successfully.`,
             userId: userId
          });
          
          if (insertError) { console.error('Insert error:', insertError); return res.status(500).json({ error: insertError }); }
          return res.json({ success: true, payment });
        } else {
          return res.json({ success: true, payment: existing, message: 'Already verified' });
        }
      } else {
        res.status(400).json({ error: 'Payment verification failed' });
      }
    } catch (error) {
      console.error('Verify error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  apiRouter.post('/payments/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      const hash = require('crypto').createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      
      if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;
        
        await getSupabase().from('payment_webhooks').insert({
          event_type: event.event,
          event_data: event
        });
        
        if (event.event === 'charge.success') {
          const reference = event.data.reference;
          const amount = event.data.amount / 100;
          const email = event.data.customer.email;
          
          const { data: user } = await getSupabase().from('User').select('id').eq('email', email).maybeSingle();
          
          if (user) {
            const { data: existing } = await getSupabase().from('Payment')
              .select('*')
              .eq('payment_reference', reference)
              .maybeSingle();
              
            if (!existing) {
              const { data: payment } = await getSupabase().from('Payment').insert({
                amount,
                currency: event.data.currency || 'KES',
                payment_reference: reference,
                user_id: user.id,
                payment_status: 'COMPLETED',
                paystack_transaction_id: event.data.id.toString(),
                payment_method: event.data.channel,
                payment_channel: event.data.channel,
                paid_at: event.data.paid_at || new Date().toISOString()
              }).select('*, user:User(name, avatarUrl)').single();
              
              emitEvent('new-payment', payment);
              
              await getSupabase().from('Notification').insert({
                 title: 'Payment Received',
                 message: `Your contribution of ${event.data.currency || 'KES'} ${amount} was received successfully.`,
                 userId: user.id
              });
            }
          }
        }
      }
      res.sendStatus(200);
    } catch (error) {
      console.error('Webhook error:', error);
      res.sendStatus(500);
    }
  });

  apiRouter.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { data: users, error } = await getSupabase().from('User').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const { data, error } = await getSupabase().from('User').update({ role }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  apiRouter.post('/expenses', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { title, amount, category, date } = req.body;
      const { data, error } = await getSupabase().from('Expense').insert({
        title, amount, category, date, recordedById: req.user.id
      }).select().single();
      if (error) throw error;
      emitEvent('new-expense', data);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.get('/expenses', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await getSupabase().from('Expense').select('*, user:User(name)').order('createdAt', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  
  apiRouter.get('/config', (req, res) => {
    res.json({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY,
      paystackCurrency: process.env.PAYSTACK_CURRENCY || 'KES'
    });
  });

  
  apiRouter.get('/notifications', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await getSupabase().from('Notification')
        .select('*')
        .eq('userId', req.user.id)
        .order('createdAt', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put('/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await getSupabase().from('Notification')
        .update({ read: true })
        .eq('id', req.params.id)
        .eq('userId', req.user.id)
        .select();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  
  // Admin CRUD for Expenses
  apiRouter.put('/expenses/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { title, amount, category, date } = req.body;
      const { data, error } = await getSupabase().from('Expense')
        .update({ title, amount, category, date })
        .eq('id', req.params.id)
        .select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete('/expenses/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { error } = await getSupabase().from('Expense').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin CRUD for Payments
  apiRouter.put('/payments/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { amount, reference, date, status } = req.body;
      const { data, error } = await getSupabase().from('Payment')
        .update({ amount, reference, date, status })
        .eq('id', req.params.id)
        .select().single();
      if (error) throw error;
      emitEvent('payment-updated', data);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete('/payments/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { error } = await getSupabase().from('Payment').delete().eq('id', req.params.id);
      if (error) throw error;
      emitEvent('payment-deleted', { id: req.params.id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Manual Payment (Cash/Transfer)
  apiRouter.post('/payments/manual', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { userId, amount, reference, date, status } = req.body;
      const { data, error } = await getSupabase().from('Payment').insert({
        userId, amount, reference, date, status, phoneNumber: 'Manual'
      }).select('*, user:User(name, avatarUrl)').single();
      if (error) throw error;
      emitEvent('new-payment', data);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin CRUD for Users
  apiRouter.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      const { data, error } = await getSupabase().from('User')
        .update({ name, email, phone })
        .eq('id', req.params.id)
        .select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.use('/api', apiRouter);

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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
