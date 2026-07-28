import AuthLayout from "../_components/AuthLayout";

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Choose a new password for your account"
      leftPanel={{
        badge: "Secure Your Account",
        heading: "Secure Your Account",
        description:
          "Reset your password and get back to planning your next adventure!",
      }}
      footerLink={{
        text: "Remember your password?",
        label: "Sign in",
        href: "/login",
      }}
    >
      {children}
    </AuthLayout>
  );
}
