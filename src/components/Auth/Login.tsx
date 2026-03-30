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
    setError('');
    setLoading(true);
    
    try {
      await signIn(email, password);
      // Khi signIn thành công, AuthContext sẽ tự đổi state user và App tự chuyển trang
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('Sai email hoặc mật khẩu rồi bạn ơi! 😿');
      } else {
        setError(err.message || 'Lỗi đăng nhập không xác định');
      }
    } finally {
      setLoading(false); // Dừng loading kể cả khi lỗi
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border-4 border-white relative overflow-hidden">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-pink-100 rounded-3xl text-pink-500 animate-bounce">
            <Cat size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">Chào Mừng Bạn Quay Lại!</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={20} />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-pink-50/50 border-2 border-transparent focus:border-pink-300 rounded-2xl outline-none font-bold"
                placeholder="Email..."
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={20} />
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-pink-50/50 border-2 border-transparent focus:border-pink-300 rounded-2xl outline-none font-bold"
                placeholder="Mật khẩu..."
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold text-center border-2 border-red-100 animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Mèo đang mở cổng...' : <><LogIn size={24} /> Đăng Nhập</>}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 font-bold">
          Chưa có tài khoản? <button onClick={onToggleMode} className="text-pink-500 underline">Đăng ký</button>
        </p>
      </div>
    </div>
  );
}