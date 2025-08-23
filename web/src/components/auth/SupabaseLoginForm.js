import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/SupabaseAuthContext';
import { Button, Card, Form, Tabs, TabPane, Typography } from '@douyinfe/semi-ui';
import { IconMail, IconGithubLogo, IconGoogle } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const SupabaseLoginForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    signInWithGoogle, 
    signInWithGitHub, 
    signInWithEmail,
    signInWithMagicLink
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('oauth');

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

  const handleEmailLogin = async (e) => {
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

  const handleMagicLink = async () => {
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        setError(error.message || '发送失败');
      } else {
        setError('魔法链接已发送到您的邮箱');
      }
    } catch (error) {
      setError(error.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 !rounded-2xl">
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
              </TabPane>

              <TabPane tab={t('邮箱登录')} itemKey="email">
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
                    prefix={<IconMail />}
                    type="password"
                  />
                  <Button
                    theme="solid"
                    type="primary"
                    className="w-full !rounded-full"
                    onClick={handleEmailLogin}
                    loading={loading}
                  >
                    {t('登录')}
                  </Button>
                </div>
              </TabPane>

              <TabPane tab={t('魔法链接')} itemKey="magic">
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
                  <Button
                    theme="solid"
                    type="primary"
                    className="w-full !rounded-full"
                    onClick={handleMagicLink}
                    loading={loading}
                  >
                    {t('发送魔法链接')}
                  </Button>
                </div>
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

export default SupabaseLoginForm;