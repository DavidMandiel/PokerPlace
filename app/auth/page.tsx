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
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to PokerPlace</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Use Google or email to continue.
      </p>
      
      <div className="mt-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-6 bg-white/60 dark:bg-zinc-950/50">
        <Auth 
          supabaseClient={supabase} 
          view="sign_in"
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#18181b',
                  brandAccent: '#52525b',
                  inputBackground: '#ffffff',
                  inputText: '#18181b',
                  inputBorder: '#d4d4d8',
                  inputLabelText: '#52525b',
                }
              },
              dark: {
                colors: {
                  brand: '#fafafa',
                  brandAccent: '#a1a1aa',
                  inputBackground: '#27272a',
                  inputText: '#fafafa',
                  inputBorder: '#52525b',
                  inputLabelText: '#a1a1aa',
                }
              }
            }
          }} 
          providers={["google"]}
          redirectTo={`${window.location.origin}/dashboard`}
          showLinks={true}
        />
      </div>

      <div className="mt-4 text-center text-sm">
        <p>
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium">
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
        .mt-4 a[href="/auth/signup"] {
          display: inline !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Fix input field styling for better contrast */
        .supabase-auth-ui_ui-input {
          background-color: #ffffff !important;
          color: #18181b !important;
          border-color: #d4d4d8 !important;
        }

        .supabase-auth-ui_ui-input::placeholder {
          color: #71717a !important;
        }

        /* Dark mode input styling */
        .dark .supabase-auth-ui_ui-input {
          background-color: #27272a !important;
          color: #fafafa !important;
          border-color: #52525b !important;
        }

        .dark .supabase-auth-ui_ui-input::placeholder {
          color: #a1a1aa !important;
        }

        /* Fix button styling */
        .supabase-auth-ui_ui-button {
          background-color: #18181b !important;
          color: #ffffff !important;
        }

        .dark .supabase-auth-ui_ui-button {
          background-color: #fafafa !important;
          color: #18181b !important;
        }

        /* Fix label styling */
        .supabase-auth-ui_ui-label {
          color: #52525b !important;
        }

        .dark .supabase-auth-ui_ui-label {
          color: #a1a1aa !important;
        }
      `}</style>
    </div>
  );
}
