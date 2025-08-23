import React, { useContext, useEffect, useState } from 'react';
import { Button, Typography, Tag, Input, ScrollList, ScrollItem } from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/useIsMobile.js';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { IconGithubLogo, IconPlay, IconFile, IconCopy } from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import { Moonshot, OpenAI, XAI, Zhipu, Volcengine, Cohere, Claude, Gemini, Suno, Minimax, Wenxin, Spark, Qingyan, DeepSeek, Qwen, Midjourney, Grok, AzureAI, Hunyuan, Xinference } from '@lobehub/icons';
import { IconShield, IconBolt, IconGlobe, IconCheckCircleStroked, IconArrowRight, IconPieChart2Stroked, IconUser, IconActivity } from '@douyinfe/semi-icons';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress = statusState?.status?.server_address || window.location.origin;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // If content is URL, send theme mode
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          const theme = localStorage.getItem('theme-mode') || 'light';
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: theme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent(t('Failed to load home page content'));
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('Failed to fetch notice:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className="w-full overflow-x-hidden">
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className="w-full overflow-x-hidden">
          {/* Banner Section */}
          <div className="w-full border-b border-semi-color-border min-h-[500px] md:min-h-[600px] lg:min-h-[700px] relative overflow-x-hidden">
            {/* Background blur gradient balls */}
            <div className="blur-ball blur-ball-indigo" />
            <div className="blur-ball blur-ball-teal" />
            <div className="flex items-center justify-center h-full px-4 py-20 md:py-24 lg:py-32 mt-10">
              {/* Centered content area */}
              <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
                  <h1 className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-semi-color-text-0 leading-tight`}>
                    <>
                      {t('The Unified')}<br />
                      <span className="shine-text">{t('LLMs API Gateway')}</span>
                    </>
                  </h1>
                  <p className="text-base md:text-lg lg:text-xl text-semi-color-text-1 mt-4 md:mt-6 max-w-xl">
                    {t('更好的价格，更好的稳定性，只需要将模型基址替换为：')}
                  </p>
                  {/* BASE URL and endpoint selection */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full mt-4 md:mt-6 max-w-md">
                    <Input
                      readonly
                      value={serverAddress}
                      className="flex-1 !rounded-full"
                      size={isMobile ? 'default' : 'large'}
                      suffix={
                        <div className="flex items-center gap-2">
                          <ScrollList bodyHeight={32} style={{ border: 'unset', boxShadow: 'unset' }}>
                            <ScrollItem
                              mode="wheel"
                              cycled={true}
                              list={endpointItems}
                              selectedIndex={endpointIndex}
                              onSelect={({ index }) => setEndpointIndex(index)}
                            />
                          </ScrollList>
                          <Button
                            type="primary"
                            onClick={handleCopyBaseURL}
                            icon={<IconCopy />}
                            className="!rounded-full"
                          />
                        </div>
                      }
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-row gap-4 justify-center items-center">
                  <Link to="/console">
                    <Button theme="solid" type="primary" size={isMobile ? "default" : "large"} className="!rounded-3xl px-8 py-2" icon={<IconPlay />}>
                      {t('获取密钥')}
                    </Button>
                  </Link>
                  {docsLink && (
                    <Button
                      size={isMobile ? "default" : "large"}
                      className="flex items-center !rounded-3xl px-6 py-2"
                      icon={<IconFile />}
                      onClick={() => window.open(docsLink, '_blank')}
                    >
                      {t('文档')}
                    </Button>
                  )}
                </div>

                {/* Framework compatibility icons */}
                <div className="mt-12 md:mt-16 lg:mt-20 w-full">
                  <div className="flex items-center mb-6 md:mb-8 justify-center">
                    <Text type="tertiary" className="text-lg md:text-xl lg:text-2xl font-light">
                      {t('支持众多的大模型供应商')}
                    </Text>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto px-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Moonshot size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <OpenAI size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <XAI size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Zhipu.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Volcengine.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Cohere.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Claude.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Gemini.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Suno size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Minimax.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Wenxin.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Spark.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Qingyan.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <DeepSeek.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Qwen.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Midjourney size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Grok size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <AzureAI.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Hunyuan.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Xinference.Color size={40} />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <Typography.Text className="!text-lg sm:!text-xl md:!text-2xl lg:!text-3xl font-bold">30+</Typography.Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Particles */}
          <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 15}s`,
                  animationDuration: `${15 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>

          {/* Interactive Code Preview Section */}
          <div className="w-full py-20 md:py-24 lg:py-32 relative overflow-hidden">
            <div className="morphing-shapes">
              <div className="morphing-shape shape-1"></div>
              <div className="morphing-shape shape-2"></div>
              <div className="morphing-shape shape-3"></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-6">
                  Get Started in Seconds
                </h2>
                <p className="text-lg md:text-xl text-semi-color-text-1 max-w-3xl mx-auto mb-8">
                  Simple integration with just a few lines of code. See how easy it is to get started.
                </p>
                <div className="status-indicator">
                  <div className="status-dot"></div>
                  All Systems Operational
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="code-preview-container">
                  <div className="code-preview-header">
                    <div className="code-preview-dot dot-red"></div>
                    <div className="code-preview-dot dot-yellow"></div>
                    <div className="code-preview-dot dot-green"></div>
                    <span className="ml-4 text-sm text-gray-400">api-integration.js</span>
                  </div>
                  <div className="code-preview-content">
                    <div className="code-line">
                      <span className="code-comment">// Replace your OpenAI base URL</span>
                    </div>
                    <div className="code-line">
                      <span className="code-keyword">const</span> <span className="code-function">openai</span> = <span className="code-keyword">new</span> <span className="code-function">OpenAI</span>({`{`}
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;<span className="code-string">baseURL</span>: <span className="code-string">"{serverAddress}"</span>,
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;<span className="code-string">apiKey</span>: <span className="code-string">"your-api-key"</span>
                    </div>
                    <div className="code-line">{`});`}</div>
                    <div className="code-line">&nbsp;</div>
                    <div className="code-line">
                      <span className="code-comment">// That's it! Start using AI models</span>
                    </div>
                    <div className="code-line">
                      <span className="code-keyword">const</span> <span className="code-function">response</span> = <span className="code-keyword">await</span> <span className="code-function">openai</span>.<span className="code-function">chat</span>.<span className="code-function">completions</span>.<span className="code-function">create</span>({`{`}
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;<span className="code-string">model</span>: <span className="code-string">"gpt-4"</span>,
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;<span className="code-string">messages</span>: [{`{`} <span className="code-string">role</span>: <span className="code-string">"user"</span>, <span className="code-string">content</span>: <span className="code-string">"Hello!"</span> {`}`}]
                    </div>
                    <div className="code-line">{`});`}</div>
                    <div className="code-line typing-animation">&nbsp;</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <IconCheckCircleStroked size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-semi-color-text-0">Drop-in Replacement</h3>
                      <p className="text-semi-color-text-1">Compatible with OpenAI SDK - no code changes needed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <IconBolt size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-semi-color-text-0">Lightning Fast</h3>
                      <p className="text-semi-color-text-1">Optimized routing for sub-100ms response times</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <IconShield size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-semi-color-text-0">Enterprise Ready</h3>
                      <p className="text-semi-color-text-1">Built-in rate limiting, monitoring, and security</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Card-Based "Why Choose Us?" Section */}
<div className="w-full py-20 md:py-24 lg:py-32 relative overflow-hidden">
  {/* Dynamic gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
  
  {/* Animated geometric shapes */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
  </div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
    <div className="text-center mb-20">
      <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6 shadow-lg">
        <IconCheckCircleStroked size={18} className="mr-2" />
        {t('Why choose us?')}
      </div>
      <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-semi-color-text-0 mb-6 leading-tight">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
          Built for
        </span>
        <br />
        <span className="text-semi-color-text-0">Excellence</span>
      </h2>
      <p className="text-xl md:text-2xl text-semi-color-text-1 max-w-4xl mx-auto leading-relaxed">
        {t('We provide industry-leading AI model access services, allowing you to focus on innovation rather than infrastructure')}
      </p>
    </div>

    {/* Features Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
      
      {/* Feature 1 - Enterprise Security */}
      <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 border border-white/20 dark:border-slate-700/50 hover:scale-[1.02] hover:-translate-y-2">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <IconShield size={36} className="text-white" />
            </div>
            <div className="ml-6">
              <div className="text-6xl font-black text-blue-500 mb-1">99.9%</div>
              <div className="text-sm text-semi-color-text-2 uppercase tracking-wide font-semibold">Security Uptime</div>
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-semi-color-text-0 mb-4 group-hover:text-blue-600 transition-colors duration-300">
            {t('Enterprise-level security')}
          </h3>
          <p className="text-semi-color-text-1 leading-relaxed text-lg mb-6">
            {t('Bank-level data encryption and privacy protection ensures your data is safe and worry-free and complies with various compliance requirements')}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-blue-600 font-semibold">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
              <IconArrowRight size={20} className="text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2 - Lightning Speed */}
      <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 border border-white/20 dark:border-slate-700/50 hover:scale-[1.02] hover:-translate-y-2">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-green-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <IconBolt size={36} className="text-white" />
            </div>
            <div className="ml-6">
              <div className="text-6xl font-black text-emerald-500 mb-1">&lt;100ms</div>
              <div className="text-sm text-semi-color-text-2 uppercase tracking-wide font-semibold">Response Time</div>
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-semi-color-text-0 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
            {t('Speedy response')}
          </h3>
          <p className="text-semi-color-text-1 leading-relaxed text-lg mb-6">
            {t('Global CDN acceleration, average response time <100ms, giving your app a lightning-fast user experience')}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-emerald-600 font-semibold">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm">Global CDN</span>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors duration-300">
              <IconArrowRight size={20} className="text-emerald-600 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3 - Global Coverage */}
      <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 border border-white/20 dark:border-slate-700/50 hover:scale-[1.02] hover:-translate-y-2">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <IconGlobe size={36} className="text-white" />
            </div>
            <div className="ml-6">
              <div className="text-6xl font-black text-purple-500 mb-1">200+</div>
              <div className="text-sm text-semi-color-text-2 uppercase tracking-wide font-semibold">Countries</div>
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-semi-color-text-0 mb-4 group-hover:text-purple-600 transition-colors duration-300">
            {t('Global coverage')}
          </h3>
          <p className="text-semi-color-text-1 leading-relaxed text-lg mb-6">
            {t('Covering more than 200 countries and regions around the world, you can enjoy stable service no matter where your users are')}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-purple-600 font-semibold">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm">Worldwide</span>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors duration-300">
              <IconArrowRight size={20} className="text-purple-600 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature 4 - Trusted Platform */}
      <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 border border-white/20 dark:border-slate-700/50 hover:scale-[1.02] hover:-translate-y-2">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-orange-500/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <IconCheckCircleStroked size={36} className="text-white" />
            </div>
            <div className="ml-6">
              <div className="text-6xl font-black text-orange-500 mb-1">50K+</div>
              <div className="text-sm text-semi-color-text-2 uppercase tracking-wide font-semibold">Developers</div>
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-semi-color-text-0 mb-4 group-hover:text-orange-600 transition-colors duration-300">
            {t('Trusted data')}
          </h3>
          <p className="text-semi-color-text-1 leading-relaxed text-lg mb-6">
            {t('Tens of thousands of developers and enterprises choose us to build an AI-driven future')}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-orange-600 font-semibold">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">1B+ Calls</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors duration-300">
              <IconArrowRight size={20} className="text-orange-600 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom CTA Section */}
    <div className="text-center">
      <div className="inline-flex flex-col items-center p-8 bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-slate-800/90 dark:to-slate-700/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50">
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-semi-color-text-0">Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span className="text-lg font-semibold text-semi-color-text-0">Fast</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span className="text-lg font-semibold text-semi-color-text-0">Global</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <span className="text-lg font-semibold text-semi-color-text-0">Trusted</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-semi-color-text-0 mb-2">Ready to get started?</div>
        <div className="text-semi-color-text-1">Join thousands of developers building the future</div>
      </div>
    </div>
  </div>
</div>

{/* Statistics & Metrics Section */}
<div className="w-full py-20 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
{/* Animated background elements */}
<div className="absolute inset-0">
  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
</div>

<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-16">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
      {t('Trusted data')}
    </h2>
    <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
      {t('Tens of thousands of developers and enterprises choose us to build an AI-driven future')}
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {/* Stat 1 */}
    <div className="text-center group stat-item">
      <div className="relative p-6 rounded-xl glass-effect">
        <IconPieChart2Stroked size={48} className="text-white/80 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
        <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
          99.9%
        </div>
        <div className="text-white/90 font-medium">{t('Service Availability')}</div>
      </div>
    </div>

    {/* Stat 2 */}
    <div className="text-center group stat-item">
      <div className="relative p-6 rounded-xl glass-effect">
        <IconUser size={48} className="text-white/80 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
        <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
          50K+
        </div>
        <div className="text-white/90 font-medium">{t('Active developers')}</div>
      </div>
    </div>

    {/* Stat 3 */}
    <div className="text-center group stat-item">
      <div className="relative p-6 rounded-xl glass-effect">
        <IconBolt size={48} className="text-white/80 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
        <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
          1B+
        </div>
        <div className="text-white/90 font-medium">{t('Number of API calls')}</div>
      </div>
    </div>

    {/* Stat 4 */}
    <div className="text-center group stat-item">
      <div className="relative p-6 rounded-xl glass-effect">
        <IconActivity size={48} className="text-white/80 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
        <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
          &lt;50ms
        </div>
        <div className="text-white/90 font-medium">{t('Average response time')}</div>
      </div>
    </div>
  </div>
</div>
</div>

{/* Testimonials Section */}
<div className="w-full py-20 md:py-24 lg:py-32 relative overflow-hidden">
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-6">
        Trusted by Developers Worldwide
      </h2>
      <p className="text-lg md:text-xl text-semi-color-text-1 max-w-3xl mx-auto">
        Join thousands of developers and companies building the future with our AI API gateway
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="testimonials-container">
        <div className="testimonial-card">
          <div className="testimonial-avatar">S</div>
          <p className="testimonial-text">
            "Incredible performance and reliability. Our API response times improved by 60% after switching."
          </p>
          <div className="testimonial-author">Sarah Chen</div>
          <div className="testimonial-role">Senior Engineer at TechCorp</div>
        </div>
      </div>

      <div className="testimonials-container">
        <div className="testimonial-card">
          <div className="testimonial-avatar">M</div>
          <p className="testimonial-text">
            "The best AI API gateway we've used. Seamless integration and excellent support team."
          </p>
          <div className="testimonial-author">Marcus Johnson</div>
          <div className="testimonial-role">CTO at StartupXYZ</div>
        </div>
      </div>

      <div className="testimonials-container">
        <div className="testimonial-card">
          <div className="testimonial-avatar">A</div>
          <p className="testimonial-text">
            "Game-changer for our AI applications. The cost savings and performance gains are remarkable."
          </p>
          <div className="testimonial-author">Alex Rivera</div>
          <div className="testimonial-role">Lead Developer at InnovateLab</div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Pricing Preview Section */}
<div className="w-full py-20 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
        Simple, Transparent Pricing
      </h2>
      <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
        Pay only for what you use. No hidden fees, no surprises.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="pricing-preview-card">
        <div className="pricing-badge">Starter</div>
        <div className="pricing-amount">Free</div>
        <div className="pricing-period">Forever</div>
        <ul className="pricing-features">
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            10,000 API calls/month
          </li>
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            Basic models access
          </li>
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            Community support
          </li>
        </ul>
      </div>

      <div className="pricing-preview-card">
        <div className="pricing-badge">Pro</div>
        <div className="pricing-amount">$29</div>
        <div className="pricing-period">per month</div>
        <ul className="pricing-features">
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            1M API calls/month
          </li>
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            All models access
          </li>
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            Priority support
          </li>
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            Advanced analytics
          </li>
        </ul>
      </div>

      <div className="pricing-preview-card">
        <div className="pricing-badge">Enterprise</div>
        <div className="pricing-amount">Custom</div>
        <div className="pricing-period">contact us</div>
        <ul className="pricing-features">
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            Unlimited API calls
          </li>
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            Custom models
          </li>
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            24/7 dedicated support
          </li>
          <li className="pricing-feature">
            <span className="pricing-feature-icon">✓</span>
            SLA guarantees
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>

{/* Getting Started Section */}
<div className="w-full py-20 md:py-24 lg:py-32 relative overflow-hidden">
{/* Background pattern */}
<div className="absolute inset-0 opacity-5">
  <div className="absolute inset-0" style={{
    backgroundImage: `radial-gradient(circle at 1px 1px, var(--semi-color-text-0) 1px, transparent 0)`,
    backgroundSize: '20px 20px'
  }} />
</div>

<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-16">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-semi-color-text-0 mb-6">
      {t('Start using it in three steps')}
    </h2>
    <p className="text-lg md:text-xl text-semi-color-text-1 max-w-3xl mx-auto">
      {t('Just a few simple steps to access the world top AI models and start your journey of intelligence')}
    </p>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
    {/* Step 1 */}
    <div className="relative group">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
            1
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
        </div>
        <h3 className="text-xl font-bold text-semi-color-text-0 mb-4">{t('Register an account')}</h3>
        <p className="text-semi-color-text-1 leading-relaxed mb-6">
          {t('Quickly register an account, get your exclusive API key, and enjoy free credits')}
        </p>
        <div className="flex items-center text-blue-600 font-medium group-hover:text-purple-600 transition-colors duration-300">
          <IconCheckCircleStroked size={20} className="mr-2" />
          {t('Free registration')}
        </div>
      </div>
      {/* Connection line */}
      <div className="hidden lg:block absolute top-10 left-full w-12 h-0.5 step-connection text-blue-500 transform -translate-y-1/2" />
    </div>

    {/* Step 2 */}
    <div className="relative group">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
            2
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-green-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
        </div>
        <h3 className="text-xl font-bold text-semi-color-text-0 mb-4">{t('Configure access')}</h3>
        <p className="text-semi-color-text-1 leading-relaxed mb-6">
          {t('Replace your API base address with our service address, complete the configuration with one line of code')}
        </p>
        <div className="flex items-center text-teal-600 font-medium group-hover:text-green-600 transition-colors duration-300">
          <IconCheckCircleStroked size={20} className="mr-2" />
          {t('One-click configuration')}
        </div>
      </div>
      {/* Connection line */}
      <div className="hidden lg:block absolute top-10 left-full w-12 h-0.5 step-connection text-teal-500 transform -translate-y-1/2" />
    </div>

    {/* Step 3 */}
    <div className="relative group">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
            3
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
        </div>
        <h3 className="text-xl font-bold text-semi-color-text-0 mb-4">{t('Get started')}</h3>
        <p className="text-semi-color-text-1 leading-relaxed mb-6">
          {t('Start calling AI models now, build your smart applications, and enjoy the ultimate experience')}
        </p>
        <div className="flex items-center text-orange-600 font-medium group-hover:text-red-600 transition-colors duration-300">
          <IconCheckCircleStroked size={20} className="mr-2" />
          {t('Start now')}
        </div>
      </div>
    </div>
  </div>

  {/* CTA Button */}
  <div className="text-center mt-16">
    <Link to="/console">
      <Button
        theme="solid"
        type="primary"
        size="large"
        className="!rounded-full px-12 py-3 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
        icon={<IconArrowRight />}
        iconPosition="right"
      >
        {t('Start using it for free now')}
      </Button>
    </Link>
          </div>
        </div>
      </div>
        </div>
      ) : (
        <div className="overflow-x-hidden w-full">
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className="w-full h-screen border-none"
            />
          ) : (
            <div className="mt-[64px]" dangerouslySetInnerHTML={{ __html: homePageContent }} />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

