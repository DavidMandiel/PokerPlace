"use client";
import { createBrowserClient } from "@supabase/ssr";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('User already signed in, redirecting to dashboard');
        router.push('/dashboard');
      }
    };
    
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, redirecting to dashboard');
          router.push('/dashboard');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  useEffect(() => {
    // Function to hide the "Sign up" link
    const hideSignUpLink = () => {
      // Try multiple selectors to find the sign-up link
      const selectors = [
        '[data-testid="ui-anchor"]',
        'a[href*="sign_up"]',
        'a[href*="signup"]',
        '.supabase-auth-ui_ui-anchor'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          const link = element.querySelector('a') || element;
          if (link && (
            link.textContent?.includes('Sign up') ||
            link.textContent?.includes('sign up') ||
            link.getAttribute('href')?.includes('sign_up')
          )) {
            console.log('Hiding sign-up link:', link.textContent);
            (element as HTMLElement).style.display = 'none';
            (element as HTMLElement).style.visibility = 'hidden';
            (element as HTMLElement).style.opacity = '0';
          }
        });
      });
    };

    // Run immediately
    hideSignUpLink();

    // Run after a delay
    const timer1 = setTimeout(hideSignUpLink, 100);
    const timer2 = setTimeout(hideSignUpLink, 500);
    const timer3 = setTimeout(hideSignUpLink, 1000);

    // Use MutationObserver to watch for when the Auth component renders
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          hideSignUpLink();
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-app flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
          <p className="text-emerald-mintSoft">
            Sign in to your PokerPlace account
          </p>
        </div>
        
        <div className="card-emerald p-8">
          <Auth 
            supabaseClient={supabase} 
            view="sign_in"
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#145a4a',
                    brandAccent: '#4fd1a1',
                    inputBackground: '#ffffff',
                    inputText: '#0b2c2c',
                    inputBorder: '#4fd1a1',
                    inputLabelText: '#4fd1a1',
                  }
                },
                dark: {
                  colors: {
                    brand: '#145a4a',
                    brandAccent: '#4fd1a1',
                    inputBackground: '#0b2c2c',
                    inputText: '#ffffff',
                    inputBorder: '#4fd1a1',
                    inputLabelText: '#4fd1a1',
                  }
                }
              }
            }} 
            providers={["google"]}
            redirectTo={`${window.location.origin}/dashboard`}
            showLinks={true}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-emerald-mintSoft">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-emerald-mint hover:underline font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>

        <style jsx global>{`
          /* Only hide sign-up links within the Auth component, not our custom link */
          [data-testid="ui-anchor"]:has(a[href*="sign_up"]),
          [data-testid="ui-anchor"]:has(a[href*="signup"]),
          .supabase-auth-ui_ui-anchor:has(a[href*="sign_up"]),
          .supabase-auth-ui_ui-anchor:has(a[href*="signup"]) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          
          /* Ensure our custom link is visible */
          .mt-6 a[href="/auth/signup"] {
            display: inline !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          /* Fix input field styling for better contrast */
          .supabase-auth-ui_ui-input {
            background-color: #0b2c2c !important;
            color: #ffffff !important;
            border-color: #4fd1a1 !important;
            border-radius: 0.75rem !important;
            padding: 0.75rem 1rem !important;
          }

          .supabase-auth-ui_ui-input::placeholder {
            color: #7ddfc3 !important;
          }

          .supabase-auth-ui_ui-input:focus {
            border-color: #4fd1a1 !important;
            box-shadow: 0 0 0 2px rgba(79, 209, 161, 0.2) !important;
            outline: none !important;
          }

          /* Fix button styling */
          .supabase-auth-ui_ui-button {
            background-color: #145a4a !important;
            color: #ffffff !important;
            border-radius: 0.75rem !important;
            padding: 0.75rem 1.5rem !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
          }

          .supabase-auth-ui_ui-button:hover {
            background-color: #0e3b2f !important;
            transform: translateY(-1px) !important;
          }

          /* Fix label styling */
          .supabase-auth-ui_ui-label {
            color: #4fd1a1 !important;
            font-weight: 500 !important;
            margin-bottom: 0.5rem !important;
          }

          /* Fix divider styling */
          .supabase-auth-ui_ui-divider {
            color: #7ddfc3 !important;
          }

          /* Fix anchor styling */
          .supabase-auth-ui_ui-anchor {
            color: #4fd1a1 !important;
            text-decoration: none !important;
          }

          .supabase-auth-ui_ui-anchor:hover {
            color: #7ddfc3 !important;
            text-decoration: underline !important;
          }

          /* Fix message styling */
          .supabase-auth-ui_ui-message {
            background-color: rgba(79, 209, 161, 0.1) !important;
            color: #4fd1a1 !important;
            border: 1px solid rgba(79, 209, 161, 0.2) !important;
            border-radius: 0.75rem !important;
            padding: 0.75rem !important;
          }
        `}</style>
      </div>
    </div>
  );
}
