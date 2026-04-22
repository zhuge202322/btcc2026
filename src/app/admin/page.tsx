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
        setMessage('Invalid password');
      }
    } catch (e) {
      setMessage('Login failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wsNumber, groupLink, checkInReward }),
      });
      if (res.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Save failed: Unauthorized');
      }
    } catch (e) {
      setMessage('Error saving');
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage('Password must be at least 6 characters');
      return;
    }
    setPwdMessage('Updating...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: newPassword }),
      });
      if (res.ok) {
        setPwdMessage('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdMessage(''), 4000);
      } else {
        setPwdMessage('Update failed');
      }
    } catch (e) {
      setPwdMessage('Error updating password');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">InsiderCoinClub Admin</h1>
        
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Admin Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="Default: admin123"
                required
              />
            </div>
            {message && <p className="text-red-400 text-sm">{message}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp Customer Service</label>
              <p className="text-[10px] text-slate-500 mb-2">For the floating button. Example: 85212345678</p>
              <input 
                type="text" 
                value={wsNumber}
                onChange={(e) => setWsNumber(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="E.g., 85212345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp Group Link</label>
              <p className="text-[10px] text-slate-500 mb-2">For VIP signals card and guide modal</p>
              <input 
                type="url" 
                value={groupLink}
                onChange={(e) => setGroupLink(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="E.g., https://chat.whatsapp.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Check-in USDT Reward</label>
              <p className="text-[10px] text-slate-500 mb-2">Display amount for daily check-in on homepage</p>
              <input 
                type="number" 
                value={checkInReward}
                onChange={(e) => setCheckInReward(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="E.g., 1"
              />
            </div>
            {message && <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition shadow-lg shadow-indigo-500/20">
              Save Settings
            </button>
          </form>
        )}

        {isLoggedIn && (
          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Min 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Type new password again"
                  required
                />
              </div>
              {pwdMessage && <p className={`text-sm ${pwdMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{pwdMessage}</p>}
              <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl transition shadow-lg">
                Confirm Change
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
