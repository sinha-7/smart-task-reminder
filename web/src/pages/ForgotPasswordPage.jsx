import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Check your email for reset instructions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="glass-card p-8 w-full max-w-md animate-scale-in relative">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🔑</span>
          <h1 className="text-2xl font-bold text-gray-100">Reset password</h1>
          <p className="text-gray-500 mt-1">We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center animate-fade-in">
            <span className="text-5xl block mb-4">📧</span>
            <p className="text-gray-300 mb-4">
              If an account with <strong>{email}</strong> exists, you'll receive a reset link shortly.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" id="forgot-submit-btn">
              Send reset link
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
