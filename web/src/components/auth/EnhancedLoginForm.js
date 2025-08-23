import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/EnhancedAuthContext';
import { Button, Card, Form, Tabs, TabPane, Divider, Typography } from '@douyinfe/semi-ui';
import { IconMail, IconPhone, IconGithubLogo, IconGoogle, IconLock, IconUser } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const EnhancedLoginForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    signInWithGoogle, 
    signInWithGitHub, 
    signInWithEmail,
    sendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('oauth');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setError('');
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'github') {
        await signInWithGitHub();
      }
    } catch (error) {
      setError(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOTP = async () => {
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await sendEmailOTP(email);
      if (response.success) {
        setIsOtpSent(true);
      } else {
        setError(response.message || '发送失败');
      }
    } catch (error) {
      setError(error.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await verifyEmailOTP(email, otp);
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || '验证失败');
      }
    } catch (error) {
      setError(error.message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOTP = async () => {
    if (!phone) {
      setError('请输入手机号码');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await sendPhoneOTP(phone);
      if (response.success) {
        setIsOtpSent(true);
      } else {
        setError(response.message || '发送失败');
      }
    } catch (error) {
      setError(error.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await verifyPhoneOTP(phone, otp);
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || '验证失败');
      }
    } catch (error) {
      setError(error.message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { user, error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message || '登录失败');
      } else if (user) {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const renderOAuthOptions = () => (
    <div className="space-y-4">
      <Button
        theme="outline"
        className="w-full h-12 flex items-center justify-center !rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        icon={<IconGoogle style={{ color: '#DB4437' }} />}
        onClick={() => handleOAuthLogin('google')}
        loading={loading}
      >
        <span className="ml-3">{t('使用 Google 登录')}</span>
      </Button>

      <Button
        theme="outline"
        className="w-full h-12 flex items-center justify-center !rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
        icon={<IconGithubLogo />}
        onClick={() => handleOAuthLogin('github')}
        loading={loading}
      >
        <span className="ml-3">{t('使用 GitHub 登录')}</span>
      </Button>
    </div>
  );

  const renderEmailOTP = () => (
    <div className="space-y-4">
      {!isOtpSent ? (
        <>
          <Form.Input
            field="email"
            label={t('邮箱地址')}
            placeholder={t('请输入您的邮箱地址')}
            value={email}
            onChange={setEmail}
            prefix={<IconMail />}
            type="email"
          />
          <Button
            theme="solid"
            type="primary"
            className="w-full !rounded-full"
            onClick={handleSendEmailOTP}
            loading={loading}
          >
            {t('发送验证码')}
          </Button>
        </>
      ) : (
        <>
          <Form.Input
            field="otp"
            label={t('验证码')}
            placeholder={t('请输入6位验证码')}
            value={otp}
            onChange={setOtp}
            maxLength={6}
          />
          <Button
            theme="solid"
            type="primary"
            className="w-full !rounded-full"
            onClick={handleVerifyEmailOTP}
            loading={loading}
          >
            {t('验证登录')}
          </Button>
        </>
      )}
    </div>
  );

  const renderPhoneOTP = () => (
    <div className="space-y-4">
      {!isOtpSent ? (
        <>
          <Form.Input
            field="phone"
            label={t('手机号码')}
            placeholder={t('请输入您的手机号码')}
            value={phone}
            onChange={setPhone}
            prefix={<IconPhone />}
          />
          <Button
            theme="solid"
            type="primary"
            className="w-full !rounded-full"
            onClick={handleSendPhoneOTP}
            loading={loading}
          >
            {t('发送验证码')}
          </Button>
        </>
      ) : (
        <>
          <Form.Input
            field="otp"
            label={t('验证码')}
            placeholder={t('请输入6位验证码')}
            value={otp}
            onChange={setOtp}
            maxLength={6}
          />
          <Button
            theme="solid"
            type="primary"
            className="w-full !rounded-full"
            onClick={handleVerifyPhoneOTP}
            loading={loading}
          >
            {t('验证登录')}
          </Button>
        </>
      )}
    </div>
  );

  const renderEmailPassword = () => (
    <div className="space-y-4">
      <Form.Input
        field="email"
        label={t('邮箱地址')}
        placeholder={t('请输入您的邮箱地址')}
        value={email}
        onChange={setEmail}
        prefix={<IconMail />}
        type="email"
      />
      <Form.Input
        field="password"
        label={t('密码')}
        placeholder={t('请输入您的密码')}
        value={password}
        onChange={setPassword}
        prefix={<IconLock />}
        type="password"
      />
      <Button
        theme="solid"
        type="primary"
        className="w-full !rounded-full"
        onClick={handleEmailPasswordLogin}
        loading={loading}
      >
        {t('登录')}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 !rounded-2xl overflow-hidden">
          <div className="flex justify-center pt-8 pb-4">
            <Title heading={3} className="text-gray-800 dark:text-gray-200">
              {t('欢迎回来')}
            </Title>
          </div>
          
          {error && (
            <div className="px-6 pb-4">
              <Text type="danger" className="text-center">
                {error}
              </Text>
            </div>
          )}
          
          <div className="px-6 py-4">
            <Tabs activeTab={activeTab} onChange={setActiveTab} className="w-full">
              <TabPane tab={t('社交登录')} itemKey="oauth">
                {renderOAuthOptions()}
              </TabPane>
              
              <TabPane tab={t('邮箱验证码')} itemKey="email-otp">
                {renderEmailOTP()}
              </TabPane>
              
              <TabPane tab={t('手机验证码')} itemKey="phone-otp">
                {renderPhoneOTP()}
              </TabPane>
              
              <TabPane tab={t('密码登录')} itemKey="password">
                {renderEmailPassword()}
              </TabPane>
            </Tabs>
            
            <Divider margin='24px' align='center'>
              <Text type="tertiary">{t('或')}</Text>
            </Divider>
            
            <div className="text-center">
              <Text>
                {t('还没有账户？')}{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  {t('立即注册')}
                </Link>
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedLoginForm;