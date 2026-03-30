import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, Cat } from 'lucide-react';

export function Login({ onToggleMode }: { onToggleMode: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError('Sai email hoặc mật khẩu rồi bạn ơi! 😿');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border-4 border-white relative overflow-hidden">
        <div className="text-center space-y-4 relative z-10">
          <div className="inline-flex p-4 bg-pink-100 rounded-3xl text-pink-500 animate-bounce">
            <Cat size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Chào bạn quay Lại!</h2>
          <p className="text-gray-500 font-bold">Mèo đang đợi bạn vào học nè meo~</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={20} />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-pink-50/50 border-2 border-transparent focus:border-pink-300 rounded-2xl outline-none transition-all font-bold"
                placeholder="Email của bạn..."
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={20} />
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-pink-50/50 border-2 border-transparent focus:border-pink-300 rounded-2xl outline-none transition-all font-bold"
                placeholder="Mật khẩu bí mật..."
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Đang vào vườn...' : <><LogIn size={24} /> Đăng Nhập</>}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 font-bold">
          Chưa có tài khoản?{' '}
          <button onClick={onToggleMode} className="text-pink-500 hover:underline">Đăng ký ngay</button>
        </p>
      </div>
    </div>
  );
}