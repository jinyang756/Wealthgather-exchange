import React from 'react';
import { X, ScrollText, ShieldCheck, AlertTriangle, FileText } from 'lucide-react';

export type LegalDocType = 'privacy' | 'agreement' | 'risk';

interface LegalModalProps {
  type: LegalDocType | null;
  onClose: () => void;
}

export const LEGAL_CONTENT: Record<LegalDocType, { title: string; icon: any; content: React.ReactNode }> = {
  privacy: {
    title: '隐私政策',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-sans">
        <p><strong>版本生效日期：2025年2月20日</strong></p>
        <p>武汉私募基金管理有限公司（以下简称“我们”）深知个人信息对您的重要性，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。</p>
        
        <h4 className="text-primary-gold font-bold mt-4">1. 我们如何收集信息</h4>
        <p>为实现交易所账户开立及反洗钱监管要求，我们需要收集您的：</p>
        <ul className="list-disc pl-5 space-y-1 text-gray-400">
          <li>身份信息：包括姓名、身份证件号码、面部识别特征（用于活体检测）。</li>
          <li>联系方式：电子邮箱、通讯地址（仅用于寄送纸质账单，可选）。</li>
          <li>机构信息：营业执照、法定代表人信息、受益所有人信息。</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">* 注：本平台不支持电话营销，亦不会收集您的手机号码用于任何营销用途。</p>

        <h4 className="text-primary-gold font-bold mt-4">2. 信息的使用与存储</h4>
        <p>您的数据将加密存储于中国境内的服务器中。除非法律法规另有规定，我们不会向第三方共享您的个人信息。我们会使用银行级的加密技术（SSL/TLS）传输您的数据。</p>
        
        <h4 className="text-primary-gold font-bold mt-4">3. 您的权利</h4>
        <p>您有权查阅、更正您的信息，或注销账户。注销账户后，我们将停止为您提供产品或服务，并依据法律法规要求删除您的个人信息。</p>
      </div>
    )
  },
  agreement: {
    title: '用户服务协议',
    icon: FileText,
    content: (
      <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-sans">
        <p>欢迎您使用聚财众发交易所（WealthGather Exchange）机构交易终端。</p>
        
        <h4 className="text-primary-gold font-bold mt-4">1. 服务内容</h4>
        <p>本平台专为合格机构投资者提供金融数据分析、资产管理视图及交易通道技术服务。本平台提供的所有行情数据仅供参考，不构成投资建议。</p>
        
        <h4 className="text-primary-gold font-bold mt-4">2. 用户行为规范</h4>
        <p>用户在使用本服务时，必须遵守《中华人民共和国证券法》、《私募投资基金监督管理暂行办法》等相关法律法规。</p>
        <ul className="list-disc pl-5 space-y-1 text-gray-400">
          <li>禁止利用本平台进行洗钱、非法集资、内幕交易等违法活动。</li>
          <li>禁止使用任何自动化工具（如爬虫）未经许可抓取本平台数据。</li>
          <li>禁止将账户出借、转让给非本机构授权人员使用。</li>
        </ul>

        <h4 className="text-primary-gold font-bold mt-4">3. 免责声明</h4>
        <p>鉴于网络服务的特殊性，因不可抗力、黑客攻击、系统不稳定等原因造成服务中断或数据丢失，平台在法律允许范围内免责。</p>
      </div>
    )
  },
  risk: {
    title: '风险披露声明书',
    icon: AlertTriangle,
    content: (
      <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-sans">
        <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-lg mb-4">
          <p className="text-red-400 font-bold">【重要提示】市场有风险，投资需谨慎。</p>
        </div>
        <p>在您进行交易之前，请务必仔细阅读本风险披露声明，并确保您完全理解相关风险：</p>
        
        <h4 className="text-primary-gold font-bold mt-4">1. 宏观经济风险</h4>
        <p>由于国家宏观经济形势变化、法律法规颁布及实施、财政及货币政策调整等因素，可能引起证券市场价格波动，从而影响您的投资收益。</p>

        <h4 className="text-primary-gold font-bold mt-4">2. 技术风险</h4>
        <p>由于通讯设施故障、系统停机维护、黑客攻击等不可抗力因素，可能导致您的交易指令无法及时传输或执行，由此产生的损失需由您自行承担。</p>

        <h4 className="text-primary-gold font-bold mt-4">3. 机构交易特别风险</h4>
        <p>机构大额交易可能面临流动性风险。在使用算法交易或程序化交易功能时，请确保您的策略模型经过充分回测，防止因参数设置错误导致巨额亏损。</p>
      </div>
    )
  }
};

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;
  const doc = LEGAL_CONTENT[type];
  const Icon = doc.icon;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#1A1A1A] w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 flex flex-col shadow-2xl transform transition-all animate-bounce-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#242424] to-[#1A1A1A] rounded-t-2xl">
           <div className="flex items-center gap-3 text-white font-bold text-lg">
             <div className="p-2 bg-primary-gold/10 rounded-lg">
                <Icon className="text-primary-gold" size={20} />
             </div>
             {doc.title}
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
             <X size={20} />
           </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#141414]">
          {doc.content}
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-white/10 text-right bg-[#1A1A1A] rounded-b-2xl flex justify-end">
           <button 
             onClick={onClose} 
             className="px-8 py-3 bg-primary-gold hover:bg-primary-deep text-black font-bold rounded-xl shadow-lg shadow-primary-gold/10 transition-all"
           >
             我已阅读并知晓
           </button>
        </div>
      </div>
    </div>
  );
};