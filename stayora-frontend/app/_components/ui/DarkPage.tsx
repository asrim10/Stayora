import React from "react";

export interface StatItem {
  label: string;
  value: React.ReactNode;
}

export interface HeroAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
}

export interface PageLayoutProps {
  // Hero
  eyebrow?: string;
  title: string;
  heroTopRight?: React.ReactNode;
  heroActions?: HeroAction[];
  heroHeight?: string;

  // Stats bar (optional)
  avatarSlot?: React.ReactNode;
  stats?: StatItem[];

  // Body sections
  children?: React.ReactNode;
}

export function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ padding: "4rem 5%" }}>
      {eyebrow && <p style={styles.eyebrow}>{eyebrow}</p>}
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children && <div style={{ marginTop: "3rem" }}>{children}</div>}
    </div>
  );
}

export function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.row}>
      <p style={styles.eyebrow}>{label}</p>
      <div style={styles.rowValue}>{children}</div>
    </div>
  );
}

export function RowList({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div style={{ borderTop: "1px solid #e5e7eb" }}>
      {rows.map((row, i) => (
        <div key={i} style={styles.row}>
          <p style={styles.eyebrow}>{row.label}</p>
          <p style={styles.rowValue}>{row.value}</p>
        </div>
      ))}
    </div>
  );
}

export function Button({
  children,
  href,
  onClick,
  variant = "solid",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const s = variant === "solid" ? styles.btnSolid : styles.btnOutline;

  if (href) {
    const Link = require("next/link").default;
    return (
      <Link
        href={href}
        style={{ ...s, textDecoration: "none", display: "inline-block" }}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function Input({
  id,
  type = "text",
  placeholder,
  registration,
  error,
  onFocus,
  onBlur,
}: {
  id?: string;
  type?: string;
  placeholder?: string;
  registration?: any;
  error?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}) {
  return (
    <div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        style={styles.input}
        onFocus={(e) => {
          e.target.style.borderColor = "#059669";
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#d1d5db";
          onBlur?.(e);
        }}
      />
      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}

//  Main Layout

export default function PageLayout({
  eyebrow,
  title,
  heroTopRight,
  heroActions = [],
  heroHeight = "55vh",
  avatarSlot,
  stats = [],
  children,
}: PageLayoutProps) {
  const Link = require("next/link").default;

  return (
    <div
      className="flex-1"
      style={{
        background: "#faf7f2",
        minHeight: "100vh",
        color: "#1a1a1a",
      }}
    >
      {/*  HERO  */}
      <div
        style={{
          position: "relative",
          height: heroHeight,
          minHeight: 320,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
          background:
            "linear-gradient(135deg, #f5f0e8 0%, #faf7f2 40%, #f0ebe3 100%)",
        }}
      >
        {/* Accent dots */}
        {[
          { top: "25%", left: "15%" },
          { top: "50%", left: "55%" },
          { top: "18%", right: "20%" },
          { top: "60%", right: "8%" },
          { top: "40%", left: "75%" },
          { top: "70%", left: "30%" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...(pos as any),
              width: i % 2 === 0 ? 6 : 4,
              height: i % 2 === 0 ? 6 : 4,
              borderRadius: "50%",
              background: "#059669",
              opacity: 0.3,
              boxShadow: "0 0 16px 4px rgba(201,169,110,0.15)",
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #faf7f2 0%, rgba(250,247,242,0.55) 55%, rgba(250,247,242,0.1) 100%)",
          }}
        />

        {/* Top-right slot */}
        {heroTopRight && (
          <div
            style={{
              position: "absolute",
              top: "2rem",
              right: "5%",
              textAlign: "right",
            }}
          >
            {heroTopRight}
          </div>
        )}

        {/* Bottom-left content */}
        <div
          style={{ position: "relative", zIndex: 1, padding: "0 5% 3.5rem" }}
        >
          {eyebrow && (
            <p style={{ ...styles.eyebrow, marginBottom: "0.75rem" }}>
              {eyebrow}
            </p>
          )}
          <h1 style={styles.heroTitle}>{title}</h1>
          {heroActions.length > 0 && (
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {heroActions.map((action, i) =>
                action.href ? (
                  <Link
                    key={i}
                    href={action.href}
                    style={{
                      ...(action.variant === "outline"
                        ? styles.btnOutline
                        : styles.btnSolid),
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    {action.label}
                  </Link>
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={action.onClick}
                    style={
                      action.variant === "outline"
                        ? styles.btnOutline
                        : styles.btnSolid
                    }
                  >
                    {action.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      {(avatarSlot || stats.length > 0) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: avatarSlot
              ? `auto ${stats.map(() => "1fr").join(" ")}`
              : stats.map(() => "1fr").join(" "),
            borderTop: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb",
            alignItems: "stretch",
          }}
        >
          {avatarSlot && (
            <div
              style={{
                padding: "2rem 3rem 2rem 5%",
                borderRight: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
              }}
            >
              {avatarSlot}
            </div>
          )}
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "2rem 5%",
                borderRight:
                  i < stats.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
            >
              <p style={{ ...styles.eyebrow, marginBottom: "0.5rem" }}>
                {stat.label}
              </p>
              <div
                style={{
                  color: "#1a1a1a",
                  fontSize: 15,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/*  BODY  */}
      {children}
    </div>
  );
}

//  Shared styles

export const styles = {
  eyebrow: {
    color: "#059669",
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    margin: 0,
  },
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 64px)",
    fontWeight: 700,
    lineHeight: 1.05,
    textTransform: "uppercase" as const,
    margin: "0 0 1.5rem",
    color: "#1a1a1a",
  },
  sectionTitle: {
    color: "#1a1a1a",
    fontSize: "clamp(24px, 4vw, 48px)",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    margin: "0.75rem 0 0",
    lineHeight: 1.1,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "3rem",
    padding: "1.75rem 0",
    borderBottom: "1px solid #e5e7eb",
    alignItems: "center",
  },
  rowValue: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 1.8,
    margin: 0,
  },
  input: {
    width: "100%",
    background: "#fff",
    border: "1px solid #d1d5db",
    color: "#1a1a1a",
    fontSize: 14,
    padding: "0.85rem 1.25rem",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
    borderRadius: "6px",
  },
  btnSolid: {
    background: "#059669",
    border: "none",
    color: "#ffffff",
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    fontWeight: 700,
    padding: "0.9rem 2rem",
    cursor: "pointer",
  },
  btnOutline: {
    background: "none",
    border: "1px solid #d1d5db",
    color: "#059669",
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    padding: "0.85rem 1.75rem",
    cursor: "pointer",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: "0.4rem",
    letterSpacing: "0.05em",
  },
  divider: {
    borderTop: "1px solid #e5e7eb",
  },
};
