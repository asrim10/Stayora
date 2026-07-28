import AuthLayout from "../_components/AuthLayout";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      footerLink={{
        text: "Don't have an account?",
        label: "Create one",
        href: "/register",
      }}
    >
      {children}
    </AuthLayout>
  );
}
