import Navbar from "./_components/Navbar";
import ScrollToTop from "./_components/ScrollToTop";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <ScrollToTop />
    </>
  );
}
