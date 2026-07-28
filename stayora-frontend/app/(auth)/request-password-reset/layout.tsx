import AuthLayout from "../_components/AuthLayout";

export default function RequestPasswordResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link"
      leftPanel={{
        badge: "Secure Recovery",
        heading: "Forgot Your Password?",
        description:
          "No worries! Enter your email and we'll send you a reset link to get you back on track.",
      }}
      footerLink={{
        text: "Remember your password?",
        label: "Back to Login",
        href: "/login",
      }}
    >
      {children}
    </AuthLayout>
  );
}
