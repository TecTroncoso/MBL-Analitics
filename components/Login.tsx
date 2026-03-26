"use client";

import { useState } from "react";
import { mlbbApi } from "@/lib/mlbb-api";
import { Shield, User, Globe, KeyRound, Loader2 } from "lucide-react";

export function Login({ onLoginSuccess }: { onLoginSuccess: (token: string, userId: string) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [roleId, setRoleId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId || !zoneId) {
      setError("Please enter your Game ID and Server ID");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await mlbbApi.sendVerificationCode(roleId, zoneId);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError("Please enter the verification code");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await mlbbApi.login(roleId, zoneId, code);
      if (res.data?.jwt) {
        onLoginSuccess(res.data.jwt, res.data.roleid || roleId);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-gaming-card border border-gaming-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gaming-accent/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-16 h-16 rounded-2xl bg-gaming-accent/20 flex items-center justify-center mb-4 border border-gaming-accent/30">
            <Shield className="w-8 h-8 text-gaming-accent" suppressHydrationWarning />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Player Login</h1>
          <p className="text-gray-400 text-center mt-2 text-sm">
            Connect your account to view your real-time stats and match history.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4 relative">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Game ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" suppressHydrationWarning />
                  </div>
                  <input
                    type="text"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-gaming-bg border border-gaming-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-accent focus:border-transparent transition-all"
                    placeholder="e.g. 123456789"
                    required
                  />
                </div>
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Server ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-500" suppressHydrationWarning />
                  </div>
                  <input
                    type="text"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-gaming-bg border border-gaming-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-accent focus:border-transparent transition-all"
                    placeholder="1234"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gaming-accent hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gaming-accent focus:ring-offset-gaming-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" suppressHydrationWarning /> : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 relative">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Verification Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" suppressHydrationWarning />
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gaming-bg border border-gaming-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gaming-accent focus:border-transparent transition-all"
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Code sent to your in-game mail.{" "}
                <button type="button" onClick={() => setStep(1)} className="text-gaming-accent hover:underline">
                  Change ID
                </button>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gaming-accent hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gaming-accent focus:ring-offset-gaming-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" suppressHydrationWarning /> : "Verify & Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
