export default function Loading() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{
          backgroundImage: "url('/images/hotel4.webp')",
          filter: "blur(2px)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/85" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-sm tracking-widest uppercase">
          Loading...
        </p>
      </div>
    </section>
  );
}
