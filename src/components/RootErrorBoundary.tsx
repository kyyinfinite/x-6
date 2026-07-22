import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

// Jaring pengaman terakhir: kalau ada error tak terduga di mana pun
// (bukan cuma 3D), user lihat pesan jelas, bukan halaman blank total.
export default class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[App] Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#FAF6EE", color: "#2B2620", padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 14, opacity: 0.7 }}>Terjadi kesalahan saat memuat halaman.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "8px 16px", borderRadius: 8, background: "#A6772C", color: "white", border: "none", fontSize: 13, cursor: "pointer" }}
          >
            Muat Ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}