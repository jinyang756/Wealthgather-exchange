import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mail, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import { Logo } from '../components/Logo';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center relative font-sans">
      {/* Lighting Effect */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 py-10 z-10">
        <div className="w-full mb-6">
            <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} className="mr-2" /> 返回登录
            </Link>
        </div>

        <div className="bg-dark-card/50 border border-white/10 rounded-2xl p-8 shadow-xl w-full backdrop-blur-sm">
          <div className="flex justify-center mb-6">
             <Logo className="w-12 h-12" />
          </div>
          
          {!submitted ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">重置密码</h1>
                <p className="text-gray-500 text-sm">输入您的注册邮箱，我们将向您发送重置链接。</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">电子邮箱</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-primary-gold transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-white placeholder-gray-600 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-colors outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-gold to-[#B8860B] hover:brightness-110 text-black font-bold py-3 rounded-lg shadow-lg shadow-primary-gold/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> 发送重置链接</>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-status-profit/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-status-profit/20">
                <CheckCircle2 className="w-8 h-8 text-status-profit" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">邮件已发送</h2>
              <p className="text-gray-500 text-sm mb-6">
                我们已向 <span className="text-primary-gold">{email}</span> 发送了密码重置说明，请查收。
              </p>
              <Link to="/login" className="inline-block w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg border border-white/10 transition-all">
                返回登录页
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Footer */}
      <footer className="w-full py-6 border-t border-white/5 bg-[#0a0a0a] z-10">
        <div className="max-w-md mx-auto px-6 text-center space-y-4">
          <div className="flex flex-col items-center gap-1 text-gray-500">
             <div className="flex items-center gap-2 text-primary-gold/70">
               <Building2 size={12} />
               <span className="text-xs font-bold">武汉私募基金管理有限公司</span>
             </div>
          </div>
          <div className="flex justify-center gap-3 text-[10px] text-gray-600 font-mono">
             <span>基金业协会备案: P1068888</span>
             <span className="w-px h-3 bg-white/10"></span>
             <span>鄂ICP备2023008888号-1</span>
          </div>
          <p className="text-[10px] text-gray-700 font-mono">
            © 2024 WealthGather Exchange. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;