import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
}

// Menangkap error loading texture per-frame, supaya 1 URL rusak
// tidak menjatuhkan seluruh Canvas (Clouds ikut hilang).
export default class PhotoErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[PhotoFrame] gagal memuat thumbnail, fallback dipakai:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}