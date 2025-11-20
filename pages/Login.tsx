
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Building2, AlertTriangle, User, Lock, ArrowRight, ShieldAlert, Loader2, XCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { LegalModal, LegalDocType } from '../components/LegalDocs';

const Login: React.FC = () => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  
  // Risk State
  const [showRiskModal, setShowRiskModal] = useState(false);
  
  // Legal Modal State
  const [activeDoc, setActiveDoc] = useState<LegalDocType | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear inputs on mount/unmount for security
  useEffect(() => {
    setAccount('');
    setPassword('');
    return () => {
      setAccount('');
      setPassword('');
    };
  }, []);

  // Mock Security Check Logic
  const checkPasswordRisk = (pwd: string) => {
    // Simple weak password check instead of "Leak DB" which sounds scary
    const weakPasswords = ['123456', '12345678', 'password', 'admin', 'admin123', '888888', '666666'];
    return weakPasswords.includes(pwd);
  };

  const handleLoginLogic = async () => {
    setError('');
    
    // 1. Stage: Environment Scan
    setLoading(true);
    setLoadingStage('正在检测运行环境...');
    await new Promise(r => setTimeout(r, 600));

    // 2. Stage: Credential Check
    setLoadingStage('正在验证凭证强度...');
    await new Promise(r => setTimeout(r, 600));

    // 3. Check for Risk (Weak Password)
    if (checkPasswordRisk(password)) {
      setLoading(false);
      setShowRiskModal(true);
      return;
    }

    // 4. Proceed to Login
    performLogin();
  };

  const performLogin = async () => {
    setLoading(true);
    setLoadingStage('安全连接中...');
    try {
      await login(account, password);
      navigate('/');
    } catch (err) {
      setError('认证失败: 请检查账号或密码');
    }
    setLoading(false);
    setLoadingStage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginLogic();
  };

  const openDoc = (type: LegalDocType, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDoc(type);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-6 relative overflow-hidden font-sans selection:bg-primary-gold selection:text-black">
      
      {/* Lighting Effect: Ambient Spotlight */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-gold/15 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Main Centered Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative z-10 py-4 md:py-10">
        
        {/* 1. Top Area: Brand */}
        <div className="mb-6 md:mb-8 text-center flex flex-col items-center group">
          <div className="w-16 h-16 mb-3 relative">
             <div className="absolute inset-0 bg-primary-gold/20 rounded-full blur-2xl animate-pulse group-hover:bg-primary-gold/30 transition-all duration-500"></div>
             <div className="relative w-full h-full drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500 ease-out">
                <Logo className="w-full h-full" />
             </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider drop-shadow-lg">聚财众发</h1>
          <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-primary-gold to-transparent my-2 opacity-50"></div>
          <p className="text-[10px] md:text-xs text-primary-gold/90 uppercase tracking-[0.3em] font-medium">
            WealthGather Exchange
          </p>
        </div>

        {/* 2. Middle Area: Login Form */}
        <div className="w-full space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {/* Account Input */}
              <div className="group">
                <label className="block text-[10px] md:text-xs text-gray-400 mb-1 ml-1 font-medium uppercase tracking-wide group-focus-within:text-primary-gold transition-colors">
                  账号 / 电子邮箱
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-primary-gold transition-colors" />
                   </div>
                   <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 md:py-4 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-1 focus:ring-primary-gold/50 focus:bg-white/15 transition-all text-sm md:text-base shadow-inner"
                    placeholder="请输入您的账号"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-[10px] md:text-xs text-gray-400 mb-1 ml-1 font-medium uppercase tracking-wide group-focus-within:text-primary-gold transition-colors">
                  登录密码
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-primary-gold transition-colors" />
                   </div>
                   <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl py-3 md:py-4 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold/50 focus:ring-1 focus:ring-primary-gold/50 focus:bg-white/15 transition-all text-sm md:text-base shadow-inner tracking-widest"
                    placeholder="••••••••"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-gold to-[#B8860B] text-black font-bold py-3.5 rounded-xl shadow-lg shadow-primary-gold/10 hover:shadow-primary-gold/30 hover:brightness-110 transform active:scale-[0.98] transition-all text-sm md:text-base tracking-wide flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">{loadingStage}</span>
                </div>
              ) : (
                <>
                   <ShieldCheck size={18} /> 安全登录
                </>
              )}
            </button>

            <div className="flex justify-between text-xs text-gray-400 px-1 pt-1">
               <Link to="/signup" className="hover:text-primary-gold transition-colors flex items-center gap-1">
                 注册新机构账户 <ArrowRight size={10} />
               </Link>
               <Link to="/forgot-password" className="hover:text-white transition-colors">忘记密码?</Link>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Bottom Area */}
      <footer className="w-full py-6 border-t border-white/5 relative z-10 bg-[#0a0a0a] mt-auto">
        <div className="max-w-md mx-auto px-6 text-center space-y-3">
          <div className="flex flex-col items-center gap-0.5 text-gray-400">
             <div className="flex items-center gap-2 text-primary-gold/80">
               <Building2 size={12} />
               <span className="text-xs font-bold">武汉私募基金管理有限公司</span>
             </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-[10px] text-gray-500 font-mono">
             <span className="px-2 py-0.5 border border-white/10 rounded bg-white/[0.05]">基金业协会备案: P1068888</span>
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-gray-400 pt-1">
            <button onClick={(e) => openDoc('privacy', e)} className="hover:text-primary-gold transition-colors">隐私政策</button>
            <span className="text-gray-600">|</span>
            <button onClick={(e) => openDoc('agreement', e)} className="hover:text-primary-gold transition-colors">用户协议</button>
            <span className="text-gray-600">|</span>
            <button onClick={(e) => openDoc('risk', e)} className="hover:text-primary-gold transition-colors flex items-center gap-1 text-gray-400">
               <AlertTriangle size={10} /> 风险披露
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Document Modal */}
      <LegalModal type={activeDoc} onClose={() => setActiveDoc(null)} />

      {/* SECURITY RISK WARNING MODAL - SOFTENED TONE */}
      {showRiskModal && (
         <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-fade-in">
           <div className="bg-[#1A1A1A] w-full max-w-sm rounded-2xl border border-orange-500/50 shadow-2xl overflow-hidden animate-bounce-in">
              <div className="bg-orange-500/10 p-6 flex flex-col items-center text-center border-b border-orange-500/20">
                 <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-orange-500">
                    <ShieldAlert size={32} className="text-orange-500" />
                 </div>
                 <h2 className="text-xl font-bold text-orange-500 mb-2">账户安全建议</h2>
                 <p className="text-gray-300 text-sm leading-relaxed">
                    检测到您使用的密码过于简单（弱口令），容易被黑客破解。为了您的资金安全，建议您定期修改为高强度密码。
                 </p>
              </div>
              <div className="p-6 space-y-3 bg-[#141414]">
                 <button 
                   onClick={() => navigate('/forgot-password')}
                   className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                 >
                    <Lock size={16} /> 去修改密码
                 </button>
                 <button 
                   onClick={() => { setShowRiskModal(false); performLogin(); }}
                   className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 text-xs font-medium rounded-xl transition-all"
                 >
                    暂时跳过，继续登录
                 </button>
              </div>
           </div>
         </div>
      )}

    </div>
  );
};

export default Login;
