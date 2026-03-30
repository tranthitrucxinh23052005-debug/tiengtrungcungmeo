import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, User, Mail, Lock } from 'lucide-react';

export function Signup({ onToggleMode }: { onToggleMode: () => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, username);
      // Nếu Supabase đã tắt Confirm Email, App sẽ tự động Login và chuyển trang
    } catch (err: any) {
      if (err.message.includes('User already registered')) {
        setError('Email này đã được sử dụng rồi bạn ơi! 😿');
      } else {
        setError(err.message || 'Lỗi đăng ký không xác định');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border-4 border-white relative">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-blue-100 rounded-3xl text-blue-500">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">Gia Nhập Vườn Mèo</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input
              type="text" required value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-2 border-transparent focus:border-blue-300 rounded-2xl outline-none font-bold"
              placeholder="Tên của bạn..."
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-2 border-transparent focus:border-blue-300 rounded-2xl outline-none font-bold"
              placeholder="Email..."
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-2 border-transparent focus:border-blue-300 rounded-2xl outline-none font-bold"
              placeholder="Mật khẩu..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold text-center border-2 border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang tạo hồ sơ...' : 'Đăng Ký Ngay'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 font-bold">
          Đã có tài khoản? <button onClick={onToggleMode} className="text-blue-500 underline">Đăng nhập</button>
        </p>
      </div>
    </div>
  );
}