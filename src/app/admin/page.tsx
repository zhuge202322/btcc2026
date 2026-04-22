"use client";
import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [wsNumber, setWsNumber] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [checkInReward, setCheckInReward] = useState('1');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/check-auth')
      .then(res => {
        if (res.ok) setIsLoggedIn(true);
      })
      .finally(() => setLoading(false));

    // Fetch config
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setWsNumber(data.wsNumber || '');
        setGroupLink(data.groupLink || '');
        setCheckInReward(data.checkInReward || '1');
      })
      .catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        setMessage('密码错误');
      }
    } catch (e) {
      setMessage('登录失败');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('保存中...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wsNumber, groupLink, checkInReward }),
      });
      if (res.ok) {
        setMessage('设置已成功保存！前端已生效。');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('保存失败：您可能未登录');
      }
    } catch (e) {
      setMessage('保存出错');
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMessage('两次输入的密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage('密码长度不能少于6位');
      return;
    }
    setPwdMessage('修改中...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: newPassword }),
      });
      if (res.ok) {
        setPwdMessage('密码修改成功！下次请使用新密码登录。');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdMessage(''), 4000);
      } else {
        setPwdMessage('修改失败');
      }
    } catch (e) {
      setPwdMessage('修改出错');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">加载中...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">InsiderCoinClub 后台管理</h1>
        
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">管理员密码</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="默认: admin123"
                required
              />
            </div>
            {message && <p className="text-red-400 text-sm">{message}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition">
              登 录
            </button>
          </form>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp 客服号码</label>
              <p className="text-[10px] text-slate-500 mb-2">用于右下角悬浮按钮，格式示例：85212345678</p>
              <input 
                type="text" 
                value={wsNumber}
                onChange={(e) => setWsNumber(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="例如: 85212345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp 群组链接</label>
              <p className="text-[10px] text-slate-500 mb-2">用于主页VIP按钮及引导弹窗</p>
              <input 
                type="url" 
                value={groupLink}
                onChange={(e) => setGroupLink(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="例如: https://chat.whatsapp.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">签到奖励 USDT 数量</label>
              <p className="text-[10px] text-slate-500 mb-2">主页左下角展示的签到可领取的USDT金额</p>
              <input 
                type="number" 
                value={checkInReward}
                onChange={(e) => setCheckInReward(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="例如: 1"
              />
            </div>
            {message && <p className={`text-sm ${message.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition shadow-lg shadow-indigo-500/20">
              保存设置
            </button>
          </form>
        )}

        {isLoggedIn && (
          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <h2 className="text-lg font-bold mb-4">修改密码</h2>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">新密码</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="请输入新密码 (不少于6位)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">确认新密码</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="再次输入新密码"
                  required
                />
              </div>
              {pwdMessage && <p className={`text-sm ${pwdMessage.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>{pwdMessage}</p>}
              <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl transition shadow-lg">
                确认修改密码
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
