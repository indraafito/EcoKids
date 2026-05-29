import React from 'react';
import EcoMascot from './ui/EcoMascot';
import Button from './ui/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary-bg/30 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="rotate-12 transform scale-110 mb-6 drop-shadow-md">
            <EcoMascot size={140} />
          </div>
          <h1 className="text-3xl font-nunito font-extrabold text-primary-dark mb-3">
            Opps... Ada Masalah Kecil! 😢
          </h1>
          <p className="text-base font-nunito font-bold text-primary max-w-md mb-8 leading-relaxed">
            Dunia EcoKids mengalami gangguan sementara. Jangan khawatir, mari kita bersihkan dan coba lagi!
          </p>
          <Button 
            onClick={this.handleReload} 
            variant="primary" 
            className="px-8 py-3.5 text-lg"
          >
            Segarkan Halaman 🔄
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
