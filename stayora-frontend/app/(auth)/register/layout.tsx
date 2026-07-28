import AuthLayout from "../_components/AuthLayout";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join Stayora and start booking premium stays"
      footerLink={{
        text: "Already have an account?",
        label: "Sign in",
        href: "/login",
      }}
    >
      {children}
    </AuthLayout>
  );
}
