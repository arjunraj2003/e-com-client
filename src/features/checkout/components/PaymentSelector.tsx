import { CreditCard, Wallet, Landmark, Banknote, HelpCircle } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', icon: Wallet, desc: 'Instant & Zero fees' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: Landmark, desc: 'All major Indian banks' },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive' },
] as const;

export default function PaymentSelector() {
  const { paymentMethod, setPaymentMethod } = useCheckoutStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Select Payment Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = paymentMethod === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected 
                  ? 'bg-[#534AB7]/10 border-[#534AB7] shadow-[0_0_15px_rgba(83,74,183,0.15)] ring-1 ring-[#534AB7]' 
                  : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
              }`}
            >
              <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#534AB7]/20 text-[#534AB7]' : 'bg-white/5 text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{method.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{method.desc}</p>
              </div>

              {/* Custom Radio Button */}
              <div className={`ml-auto shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                isSelected ? 'border-[#534AB7] bg-[#534AB7]' : 'border-slate-600 bg-transparent'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {paymentMethod === 'cod' && (
        <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3 animate-fade-in">
          <HelpCircle className="text-orange-400 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-orange-200/90 leading-relaxed">
            Please keep exact change ready. A small convenience fee of ₹40 may be added to Cash on Delivery orders by the courier partner.
          </p>
        </div>
      )}
    </div>
  );
}
