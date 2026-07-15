import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';

interface PaystackPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCallback: () => void;
}

export default function PaystackPaymentModal({ isOpen, onClose, onSuccessCallback }: PaystackPaymentModalProps) {
  const { token } = useAuth();
  const { user } = useAuth();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  
  const [paystackKey, setPaystackKey] = useState('');
  const [paystackCurrency, setPaystackCurrency] = useState('KES');
  
  useEffect(() => {
    
    const envKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || import.meta.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    const envCurrency = import.meta.env.VITE_PAYSTACK_CURRENCY || 'KES';
    
    if (envKey) {
        setPaystackKey(envKey);
        setPaystackCurrency(envCurrency);
    }
    
    fetch('/api/config').then(async res => {
      if (!res.ok) {
          const text = await res.text();
          throw new Error('Failed to fetch config: ' + text);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Expected JSON but received HTML/Text.\n${text.substring(0, 150)}`);
      }
      return res.json();
    }).then(data => {
      if (data.paystackPublicKey) {
          setPaystackKey(data.paystackPublicKey);
      }
      if (data.paystackCurrency) {
          setPaystackCurrency(data.paystackCurrency);
      }
    }).catch(err => {
      console.error("Config fetch error:", err);
      // We don't overwrite if envKey was set
    });

  }, []);

  useEffect(() => {
    if (isOpen) {
      setPaymentAmount('');
      setPhoneNumber(user?.phone || '07');
      setPaymentStatus('idle');
      setPaymentMessage('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const onSuccess = async (reference: any) => {
      setPaymentStatus('loading');
      setPaymentMessage('Verifying payment...');
      try {
        const res = await fetch('/api/payments/paystack/verify', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify({ reference: reference.reference })
        });
        
        if (!res.ok) {
           const text = await res.text();
           console.error("Paystack verify error:", res.status, text);
           throw new Error(text.substring(0, 100));
        }
        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error('Invalid server response');
        }
        if (data.success) {
           setPaymentStatus('success');
           setPaymentMessage(`Success! KES ${data.payment.amount} received.`);
           onSuccessCallback();
           setTimeout(() => onClose(), 3000);
        } else {
           setPaymentStatus('error');
           setPaymentMessage(data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setPaymentStatus('error');
        setPaymentMessage('Payment verification failed.');
      }
  };

  const initiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paystackKey) {
       setPaymentStatus('error');
       setPaymentMessage('Payment gateway configuration missing.');
       return;
    }
    
    setPaymentStatus('loading');
    setPaymentMessage('Initializing payment...');
    try {
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseInt(paymentAmount),
          currency: paystackCurrency,
          email: user?.email || ''
        })
      });
      
      if (!res.ok) {
         let errMsg = 'Failed to initialize payment';
         try {
           const errData = await res.json();
           errMsg = errData.error || errMsg;
         } catch(e) {
           errMsg = 'Invalid server response: ' + res.status;
         }
         setPaymentStatus('error');
         setPaymentMessage(errMsg);
         return;
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        setPaymentStatus('error');
        setPaymentMessage('Invalid server response: ' + res.status);
        return;
      }
      
      setPaymentStatus('idle');
      setPaymentMessage('');
      
      const handler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: user?.email || 'guest@example.com',
        amount: parseInt(paymentAmount) * 100,
        currency: paystackCurrency,
        access_code: data.access_code,
        callback: (tx: any) => onSuccess(tx),
        onClose: () => onClose()
      });
      handler.openIframe();
    } catch (err: any) {
      setPaymentStatus('error');
      setPaymentMessage('Payment initialization failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Make a Contribution</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={initiatePayment} className="p-6 space-y-4">
          {paymentStatus === 'success' && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium border border-emerald-100 flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
              {paymentMessage}
            </div>
          )}
          
          {paymentStatus === 'error' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {paymentMessage}
            </div>
          )}

          {paymentStatus === 'loading' && (
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-sm font-medium border border-blue-100 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              {paymentMessage}
            </div>
          )}

          {paymentStatus !== 'success' && paymentStatus !== 'loading' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input 
                  type="text" 
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-[10px] text-slate-400 mt-1">Registered phone number.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (KES)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-3 mt-2 shadow-lg shadow-emerald-500/30 transition-all"
              >
                Pay Now
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
