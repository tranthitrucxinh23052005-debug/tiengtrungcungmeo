import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Sparkles } from 'lucide-react';

export function Signup({ onToggleMode }: { onToggleMode: () => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, { username });
    alert('Kiểm tra email để kích hoạt tài khoản meo~');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border-4 border-white relative overflow-hidden">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-blue-100 rounded-3xl text-blue-500">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-800">Trở Thành Phiên Bản Mới</h2>
          <p className="text-gray-500 font-bold">Bắt đầu hành trình chinh phục tiếng Trung!</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input
              type="text" required value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-2 border-transparent focus:border-blue-300 rounded-2xl outline-none transition-all font-bold"
              placeholder="Tên của bạn (Username)..."
            />
          </div>
          {/* Email & Pass tương tự Login nhưng đổi sang tông màu Blue */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-2 border-transparent focus:border-blue-300 rounded-2xl outline-none transition-all font-bold"
              placeholder="Email đăng ký..."
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-2 border-transparent focus:border-blue-300 rounded-2xl outline-none transition-all font-bold"
              placeholder="Mật khẩu bí mật..."
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Đang tạo hồ sơ...' : <><UserPlus size={24} /> Đăng Ký Ngay</>}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 font-bold">
          Đã có tài khoản?{' '}
          <button onClick={onToggleMode} className="text-blue-500 hover:underline">Đăng nhập meo~</button>
        </p>
      </div>
    </div>
  );
}