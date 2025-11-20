
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserPlus, Lock, Mail, User, ShieldCheck, Building2, 
  AlertTriangle, ArrowRight, Briefcase, Upload, CheckCircle2, 
  Loader2, X, ScrollText, ScanFace, PenTool, Eraser, ChevronLeft, FileSignature
} from 'lucide-react';
import { Logo } from '../components/Logo';

type AccountType = 'personal' | 'org';
type Step = 'form' | 'face' | 'signature';

// Contract content mocks...
const CONTRACT_CONTENT: any = {
  service: { title: '用户服务协议', content: '协议内容...' },
  privacy: { title: '隐私政策', content: '本平台只收集邮箱，不收集手机号...' },
  qualified: { title: '机构投资者适格确认', content: '确认内容...' },
  aml: { title: '反洗钱承诺', content: '承诺内容...' }
};

// --- SIGNATURE PAD ---
const SignaturePad: React.FC<{ onConfirm: (dataUrl: string) => void; onBack: () => void }> = ({ onConfirm, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignature(true);
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const getCoordinates = (e: any, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return { offsetX: clientX - rect.left, offsetY: clientY - rect.top };
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs text-gray-400 px-1">
         <span className="flex gap-1 font-bold"><PenTool size={12}/> 签署区域</span>
         <button onClick={() => { 
             const cvs = canvasRef.current; 
             if(cvs) cvs.getContext('2d')?.clearRect(0,0,cvs.width,cvs.height); 
             setHasSignature(false);
         }} className="text-primary-gold flex gap-1 hover:underline"><Eraser size={12}/> 清除</button>
      </div>
      <div className="bg-[#FDFBF7] rounded-xl overflow-hidden border-2 border-dashed border-primary-gold/30 relative shadow-inner touch-none">
        <canvas 
          ref={canvasRef} width={500} height={150} className="w-full h-[150px]"
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={()=>setIsDrawing(false)}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={()=>setIsDrawing(false)}
        />
        {!hasSignature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 text-4xl font-bold text-gray-500 -rotate-6">在此签名</div>}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 bg-white/5 rounded-xl text-gray-300 text-xs">返回</button>
        <button onClick={() => onConfirm(canvasRef.current?.toDataURL() || '')} disabled={!hasSignature} className="flex-[2] py-3 bg-primary-gold text-black font-bold rounded-xl text-sm disabled:opacity-50">确认开户</button>
      </div>
    </div>
  );
};

const Signup: React.FC = () => {
  const [step, setStep] = useState<Step>('form');
  const [type, setType] = useState<AccountType>('personal');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', orgName: '', creditCode: '', agreed: false });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // PWA / Meta compliance
  useEffect(() => {
     const meta = document.createElement('meta');
     meta.name = "format-detection";
     meta.content = "telephone=no"; // Prevent phone number linking
     document.head.appendChild(meta);
  }, []);

  const handleSignup = async () => {
     setLoading(true);
     await signup(type === 'org' ? formData.orgName : formData.name, formData.email, formData.password, type);
     navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 selection:bg-primary-gold selection:text-black">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Logo className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-wide">
             {step === 'form' ? '开立交易账户' : step === 'face' ? '生物识别验证' : '签署电子协议'}
          </h1>
        </div>

        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl">
          {step === 'form' && (
            <form onSubmit={e => { e.preventDefault(); setStep('face'); }} className="space-y-5">
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-lg border border-white/5">
                 <button type="button" onClick={() => setType('personal')} className={`py-2 text-sm font-bold rounded ${type==='personal'?'bg-white/10 text-primary-gold':'text-gray-500'}`}>个人投资者</button>
                 <button type="button" onClick={() => setType('org')} className={`py-2 text-sm font-bold rounded ${type==='org'?'bg-white/10 text-primary-gold':'text-gray-500'}`}>机构投资者</button>
              </div>

              {type === 'org' && (
                 <div className="space-y-3 p-3 bg-primary-gold/5 border border-primary-gold/10 rounded-xl">
                    <div className="flex items-center gap-2 text-primary-gold text-xs font-bold"><Building2 size={12}/> 企业认证</div>
                    <input type="text" required placeholder="企业全称" value={formData.orgName} onChange={e=>setFormData({...formData, orgName:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-xs text-white focus:border-primary-gold outline-none" />
                    <input type="text" required placeholder="统一社会信用代码" value={formData.creditCode} onChange={e=>setFormData({...formData, creditCode:e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-xs text-white font-mono focus:border-primary-gold outline-none" />
                 </div>
              )}

              <div className="space-y-3">
                 <div className="relative"><User className="absolute left-3 top-3 w-4 h-4 text-gray-500"/><input type="text" required placeholder={type==='org'?'经办人姓名':'真实姓名'} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 text-sm text-white focus:border-primary-gold outline-none" /></div>
                 <div className="relative"><Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500"/><input type="email" required placeholder="电子邮箱 (唯一联系方式)" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 text-sm text-white focus:border-primary-gold outline-none" /></div>
                 <div className="relative"><Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500"/><input type="password" required placeholder="设置密码" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 text-sm text-white focus:border-primary-gold outline-none" /></div>
              </div>

              <label className="flex gap-2 items-start cursor-pointer">
                 <input type="checkbox" required checked={formData.agreed} onChange={e=>setFormData({...formData, agreed:e.target.checked})} className="mt-1" />
                 <span className="text-xs text-gray-500">我已阅读并同意《用户服务协议》及《隐私政策》。<br/><span className="text-primary-gold">*本平台仅通过邮箱联系，绝不索要手机号。</span></span>
              </label>

              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-primary-gold to-[#B8860B] text-black font-bold rounded-xl hover:brightness-110">下一步</button>
              <div className="text-center"><Link to="/login" className="text-xs text-gray-500 hover:text-primary-gold">已有账户? 立即登录</Link></div>
            </form>
          )}

          {step === 'face' && (
            <div className="text-center py-6">
               <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary-gold bg-black relative mb-4">
                  <Webcam className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 bg-primary-gold/10 animate-pulse flex items-center justify-center"><div className="w-full h-0.5 bg-primary-gold absolute top-1/2 animate-scan-x"></div></div>
               </div>
               <p className="text-sm text-gray-400 mb-6">请正对摄像头进行活体检测</p>
               <div className="flex gap-3">
                  <button onClick={() => setStep('form')} className="flex-1 py-3 border border-white/10 rounded-xl text-gray-400">返回</button>
                  <button onClick={() => setStep('signature')} className="flex-[2] py-3 bg-primary-gold text-black font-bold rounded-xl">开始识别</button>
               </div>
            </div>
          )}

          {step === 'signature' && (
             <div className="flex flex-col h-[500px]">
                <div className="flex-1 bg-[#181818] p-4 rounded-lg overflow-y-auto mb-4 border border-white/5 text-xs text-gray-400 font-serif leading-relaxed">
                   <h3 className="font-bold text-white text-center mb-4 text-sm">电子开户协议书</h3>
                   <p>甲方：武汉私募基金管理有限公司</p>
                   <p>乙方：{type==='org'?formData.orgName:formData.name}</p>
                   <p>...</p>
                   <p className="mt-4">乙方确认提供的邮箱 {formData.email} 为唯一有效联系方式。</p>
                </div>
                {loading ? <div className="text-center py-10"><Loader2 className="animate-spin text-primary-gold mx-auto mb-2"/>正在开户...</div> : <SignaturePad onConfirm={handleSignup} onBack={()=>setStep('face')} />}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
