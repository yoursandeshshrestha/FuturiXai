"use client";

import { signIn } from "next-auth/react";
import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, AlertCircle } from "lucide-react";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthProvider = "google" | "github";

interface FormErrors {
  email?: string;
  password?: string;
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<AuthProvider | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle OAuth callback errors
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  // Validate email format
  const validateEmail = useCallback((email: string): boolean => {
    if (!email) {
      setFormErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  }, []);

  // Validate password
  const validatePassword = useCallback((password: string): boolean => {
    if (!password) {
      setFormErrors((prev) => ({ ...prev, password: "Password is required" }));
      return false;
    }
    if (password.length < 8) {
      setFormErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters",
      }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFormErrors({});

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Generic error message for security
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (result?.ok) {
        router.push("/chat");
        router.refresh();
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: AuthProvider) => {
    setError("");
    setOauthLoading(provider);

    try {
      await signIn(provider, { callbackUrl: "/chat" });
    } catch (err) {
      console.error(`${provider} sign in error:`, err);
      setError(
        `Failed to sign in with ${
          provider === "google" ? "Google" : "GitHub"
        }. Please try again.`
      );
      setOauthLoading(null);
    }
  };

  const handleDemoAccount = useCallback((accountType: "demo1" | "demo2") => {
    // In production, these should come from environment variables or be removed entirely
    if (accountType === "demo1") {
      setEmail("sandeshshrestha@gmail.com");
      setPassword("password123");
    } else {
      setEmail("manasvikapoor@gmail.com");
      setPassword("password123");
    }
    setError("");
    setFormErrors({});
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Background Image */}
      <div className="hidden lg:block lg:w-[50%] relative" aria-hidden="true">
        <Image
          src="/background-2.png"
          alt="Login background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 font-light mb-1">Log in to</p>
            <h1 className="text-3xl font-bold text-black">FuturixAI</h1>
          </div>

          {/* Global Error Message */}
          {error && (
            <div
              className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200 flex items-start gap-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* OAuth Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={oauthLoading !== null || loading}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 hover:tracking-wide transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign in with Google"
            >
              {oauthLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Image
                  src="/google.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              )}
              {oauthLoading === "google"
                ? "Signing in..."
                : "Login with Google"}
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              disabled={oauthLoading !== null || loading}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 hover:tracking-wide transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign in with GitHub"
            >
              {oauthLoading === "github" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Image
                  src="/github.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              )}
              {oauthLoading === "github"
                ? "Signing in..."
                : "Login with GitHub"}
            </button>
          </div>

          {/* Separator */}
          <div className="relative my-6" role="separator" aria-label="or">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => email && validateEmail(email)}
                  disabled={loading || oauthLoading !== null}
                  required
                  aria-invalid={formErrors.email ? "true" : "false"}
                  aria-describedby={
                    formErrors.email ? "email-error" : undefined
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your Email"
                />
              </div>
              {formErrors.email && (
                <p
                  id="email-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => password && validatePassword(password)}
                  disabled={loading || oauthLoading !== null}
                  required
                  aria-invalid={formErrors.password ? "true" : "false"}
                  aria-describedby={
                    formErrors.password ? "password-error" : undefined
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your Password"
                />
              </div>
              {formErrors.password && (
                <p
                  id="password-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="w-full bg-gray-200 text-black py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Demo Accounts - Only in development */}
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-6 space-y-3">
              <p className="text-xs text-gray-400 text-center">
                Try with demo accounts:
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoAccount("demo1")}
                  disabled={loading || oauthLoading !== null}
                  className="flex-1 text-gray-600 py-2 px-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Fill in demo account 1 credentials"
                >
                  Demo 1
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoAccount("demo2")}
                  disabled={loading || oauthLoading !== null}
                  className="flex-1 text-gray-600 py-2 px-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Fill in demo account 2 credentials"
                >
                  Demo 2
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function SignInPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
    </div>
  );
}

// Main export with Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInPageFallback />}>
      <SignInForm />
    </Suspense>
  );
}
