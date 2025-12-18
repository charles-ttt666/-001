import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, 
  Sun, 
  ArrowRight, 
  Menu, 
  X, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  PenTool,
  Code,
  Coffee,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
  Bot
} from 'lucide-react';

const App = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Gemini API 配置
  // 注意：在实际部署到 Vercel 时，建议使用环境变量，不要直接将 Key 硬编码在这里
  const apiKey = ""; 
  
  // AI 聊天相关状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: '你好，我是 Zeyu 的数字替身。关于设计系统、React 开发或极简主义，你想聊点什么？' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 文章摘要相关状态
  const [summaries, setSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});

  // 监听滚动以改变导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 聊天窗口自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  // 切换主题
  const toggleTheme = () => setIsDark(!isDark);

  // 滚动到指定区域
  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Gemini API 调用函数
  const callGeminiAPI = async (prompt, systemInstruction = "") => {
    if (!apiKey) {
      return "请先配置 Gemini API Key 才能使用 AI 功能。";
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          }),
        }
      );

      if (!response.ok) throw new Error("API call failed");
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，我现在无法回答。";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "连接 AI 服务时出现了一点小插曲，请稍后再试。";
    }
  };

  // 处理发送聊天消息
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    const systemPrompt = `
      你是一个叫 Zeyu 的 Design Engineer (设计工程师) 的数字替身。
      你运行在一个极简主义风格的个人博客上。
      
      你的角色设定：
      1. 专业且富有哲理：你的回答应该简洁、优雅，不仅关注技术细节，也关注设计背后的思考。
      2. 技术栈：你精通 React, Tailwind CSS, UI/UX 设计。
      3. 风格：语气平和、自信，带有一点点极客的幽默感。
      4. 限制：只回答与技术、设计、职业发展或本博客相关的问题。
      
      当前博客内容背景：
      - Zeyu 关注极简主义设计、Server Components、数字游民生活。
      - Zeyu 有开源项目 "Aurora UI" 和 AI 工具 "ZenTask"。
      
      请用中文回答。保持回答精炼，不要长篇大论，像是在对话。
    `;

    const aiResponse = await callGeminiAPI(userMsg, systemPrompt);
    
    setChatMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsChatLoading(false);
  };

  // 处理生成文章摘要
  const handleGenerateSummary = async (e, articleId, title, excerpt) => {
    e.stopPropagation(); // 防止触发卡片点击
    if (loadingSummaries[articleId] || summaries[articleId]) return;

    setLoadingSummaries(prev => ({ ...prev, [articleId]: true }));

    const prompt = `
      请为一篇标题为《${title}》的博客文章生成一个更有深度的、引人入胜的“导读”。
      
      目前的简单摘录是：“${excerpt}”
      
      要求：
      1. 稍微扩展一点，加入一些引发思考的反问或哲理。
      2. 语气要像是一个资深设计师在深夜的思考。
      3. 字数控制在 80 字以内。
      4. 用中文。
      5. 加上一个相关的 emoji。
    `;

    const summary = await callGeminiAPI(prompt);
    
    setSummaries(prev => ({ ...prev, [articleId]: summary }));
    setLoadingSummaries(prev => ({ ...prev, [articleId]: false }));
  };

  // 数据模拟
  const articles = [
    {
      id: 1,
      category: "设计思维",
      date: "2023年 10月 24日",
      title: "极简主义不是空无一物，而是恰如其分",
      excerpt: "在数字产品的设计中，我们往往陷入堆砌功能的陷阱。本文探讨如何通过减法设计，提升用户的核心体验与情感连接。",
      image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      category: "技术前沿",
      date: "2023年 11月 02日",
      title: "构建未来的组件库：React Server Components 实践",
      excerpt: "服务端组件正在改变我们构建前端应用的方式。从性能优化到开发体验，这是一场静悄悄的革命。",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      category: "生活方式",
      date: "2023年 12月 15日",
      title: "数字游民的背包：在旅途中寻找代码与诗意",
      excerpt: "清迈的咖啡馆，巴厘岛的海滩。作为一名远程开发者，我在地理位置的流动中寻找创造力的恒定。",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const projects = [
    {
      title: "Aurora UI",
      type: "开源设计系统",
      desc: "一套基于 Tailwind 的现代化 React 组件库，专注于可访问性。",
      color: "bg-purple-500"
    },
    {
      title: "ZenTask",
      type: "生产力工具",
      desc: "利用 AI 辅助的任务管理应用，帮助创意工作者进入心流状态。",
      color: "bg-emerald-500"
    },
    {
      title: "MonoFont",
      type: "字体设计",
      desc: "一款专为编程设计的等宽字体，平衡了阅读舒适度与代码美学。",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-500 selection:text-white ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 导航栏 */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? (isDark ? 'bg-slate-950/80 border-b border-slate-800' : 'bg-white/80 border-b border-slate-200') : 'bg-transparent'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            ZEYU<span className="text-indigo-500">.</span>DESIGN
          </div>
          
          {/* 桌面菜单 */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            {['文章', '项目', '关于', '联系'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item === '文章' ? 'articles' : item === '项目' ? 'projects' : item === '关于' ? 'about' : 'contact')}
                className="hover:text-indigo-500 transition-colors uppercase"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleTheme}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {isMenuOpen && (
          <div className={`md:hidden absolute w-full px-6 py-8 border-b ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col space-y-6 text-lg font-medium">
              {['文章', '项目', '关于', '联系'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item === '文章' ? 'articles' : item === '项目' ? 'projects' : item === '关于' ? 'about' : 'contact')}
                  className="text-left hover:text-indigo-500"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero 区域 */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-3 mb-6 animate-fade-in-up opacity-0" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
            <div className="h-px w-12 bg-indigo-500"></div>
            <span className="text-indigo-500 font-medium tracking-widest uppercase text-sm">Design Engineer</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] mb-8 animate-fade-in-up opacity-0" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
            在混乱中<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">构建秩序</span>
            与美感。
          </h1>
          
          <p className={`text-xl md:text-2xl max-w-2xl leading-relaxed mb-12 animate-fade-in-up opacity-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
            你好，我是 Zeyu。一名游走于设计与代码之间的开发者。我热衷于创造直观的数字体验，并用文字记录技术背后的思考。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up opacity-0" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
            <button 
              onClick={() => scrollToSection('articles')}
              className={`group px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 transition-all hover:scale-105 ${isDark ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
            >
              <span>阅读文章</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setIsChatOpen(true)}
              className={`px-8 py-4 rounded-full font-semibold border transition-all hover:scale-105 flex items-center justify-center space-x-2 ${isDark ? 'border-slate-700 hover:border-white hover:bg-slate-800' : 'border-slate-300 hover:border-slate-900 hover:bg-slate-100'}`}
            >
              <Sparkles size={18} className="text-indigo-500" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* 装饰性背景元素 */}
        <div className="absolute top-1/4 right-0 -z-10 opacity-20 blur-3xl w-96 h-96 bg-indigo-600 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 -z-10 opacity-20 blur-3xl w-64 h-64 bg-purple-600 rounded-full animate-pulse delay-700"></div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="opacity-50" />
        </div>
      </section>

      {/* 数据概览栏 */}
      <section className={`py-12 border-y ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-100/50'}`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
                { icon: Code, label: "代码提交", value: "2,048+" },
                { icon: PenTool, label: "设计稿", value: "150+" },
                { icon: Coffee, label: "咖啡", value: "∞" },
                { icon: Mail, label: "订阅者", value: "5K+" },
            ].map((stat, index) => (
                <div key={index} className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm'}`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 文章部分 */}
      <section id="articles" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">最新思考</h2>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>关于设计、技术与数字生活的深度探索。</p>
          </div>
          <button className="text-indigo-500 font-medium hover:text-indigo-400 transition-colors flex items-center gap-2 group">
            查看归档 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[4/3]">
                <div className={`absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-10`} />
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 z-20">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-slate-950/80 text-white' : 'bg-white/90 text-slate-900'} backdrop-blur-sm`}>
                        {article.category}
                    </span>
                </div>
                {/* AI 摘要按钮 */}
                <div className="absolute bottom-4 right-4 z-20">
                    <button 
                        onClick={(e) => handleGenerateSummary(e, article.id, article.title, article.excerpt)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-full text-xs font-bold transition-all transform active:scale-95 ${
                            loadingSummaries[article.id] ? 'bg-indigo-600 text-white' : 
                            (isDark ? 'bg-slate-950/80 text-indigo-400 hover:bg-indigo-600 hover:text-white' : 'bg-white/90 text-indigo-600 hover:bg-indigo-500 hover:text-white')
                        } backdrop-blur-sm shadow-lg`}
                    >
                        {loadingSummaries[article.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        <span>{summaries[article.id] ? '重新生成' : 'AI 摘要'}</span>
                    </button>
                </div>
              </div>
              
              <div className={`text-sm mb-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{article.date}</div>
              <h3 className="text-xl font-bold mb-3 leading-snug group-hover:text-indigo-500 transition-colors">{article.title}</h3>
              
              {/* 显示 AI 摘要 或 原文摘要 */}
              <div className={`relative overflow-hidden transition-all duration-500 ${summaries[article.id] ? 'p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5' : ''}`}>
                  {summaries[article.id] && (
                      <div className="absolute top-0 left-0 px-2 py-0.5 bg-indigo-500 text-[10px] text-white rounded-br-lg font-bold">GEMINI AI</div>
                  )}
                  <p className={`text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'} ${summaries[article.id] ? 'mt-2 italic' : 'line-clamp-3'}`}>
                    {summaries[article.id] || article.excerpt}
                  </p>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 项目展示部分 */}
      <section id="projects" className={`py-24 px-6 ${isDark ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">精选作品</h2>
            
            <div className="space-y-20">
                {projects.map((project, index) => (
                    <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                        <div className={`w-full md:w-1/2 aspect-video rounded-3xl ${project.color} bg-opacity-10 flex items-center justify-center p-8 relative overflow-hidden group`}>
                             {/* 抽象的项目展示区域 */}
                             <div className={`absolute inset-0 ${project.color} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`}></div>
                             <div className={`w-3/4 h-3/4 rounded-xl shadow-2xl transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                                <div className="p-4 border-b border-opacity-10 border-black flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="p-8 flex items-center justify-center h-full text-4xl font-bold opacity-10">
                                    PROJECT
                                </div>
                             </div>
                        </div>
                        <div className="w-full md:w-1/2">
                            <span className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-2 block">{project.type}</span>
                            <h3 className="text-3xl md:text-4xl font-bold mb-6">{project.title}</h3>
                            <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{project.desc}</p>
                            <button className={`font-semibold border-b-2 border-indigo-500 pb-1 hover:text-indigo-500 transition-colors`}>查看详情</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 订阅部分 */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <div className={`p-12 rounded-3xl ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800' : 'bg-gradient-to-br from-indigo-50 to-white border border-slate-200'}`}>
            <h2 className="text-3xl font-bold mb-4">订阅我的周刊</h2>
            <p className={`mb-8 max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                每周一封邮件，分享我对前端技术、产品设计和独立开发的思考。无广告，随时退订。
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className={`flex-1 px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                />
                <button className="px-8 py-4 bg-indigo-500 text-white rounded-full font-semibold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30">
                    订阅
                </button>
            </form>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className={`py-12 px-6 border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="text-xl font-bold mb-2">ZEYU.DESIGN</div>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>© 2024 Zeyu Design. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-6">
                <a href="#" className={`transform hover:scale-110 transition-transform ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}><Github size={24} /></a>
                <a href="#" className={`transform hover:scale-110 transition-transform ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-500'}`}><Twitter size={24} /></a>
                <a href="#" className={`transform hover:scale-110 transition-transform ${isDark ? 'text-slate-400 hover:text-blue-600' : 'text-slate-500 hover:text-blue-700'}`}><Linkedin size={24} /></a>
                <a href="#" className={`transform hover:scale-110 transition-transform ${isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'}`}><Mail size={24} /></a>
            </div>
        </div>
      </footer>

      {/* AI 聊天悬浮按钮与窗口 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
            <div className={`mb-4 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-fade-in-up ${isDark ? 'bg-slate-900/95 border-slate-700 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'}`} style={{height: '500px'}}>
                {/* 聊天头部 */}
                <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/80 border-slate-100'}`}>
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-indigo-500 rounded-lg">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Ask Zeyu AI</h3>
                            <span className="flex items-center text-[10px] text-green-500 gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Online</span>
                        </div>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}>
                        <X size={18} />
                    </button>
                </div>

                {/* 聊天消息区 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                    : (isDark ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm')
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className={`p-3 rounded-2xl rounded-tl-sm ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <Loader2 size={16} className="animate-spin text-indigo-500" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* 输入区 */}
                <form onSubmit={handleSendMessage} className={`p-3 border-t flex gap-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="关于设计的任何问题..."
                        className={`flex-1 px-4 py-2 rounded-full text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-950 text-white placeholder-slate-600' : 'bg-slate-100 text-slate-900 placeholder-slate-400'}`}
                    />
                    <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isChatLoading}
                        className={`p-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        )}

        <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
        >
            {isChatOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:animate-bounce" />}
        </button>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
