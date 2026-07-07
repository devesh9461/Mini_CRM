import { Component } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <HiOutlineExclamationCircle style={{ fontSize: '3rem', color: 'var(--status-lost)', marginBottom: '16px' }} />
          <div className="empty-state__title">Something went wrong</div>
          <div className="empty-state__desc" style={{ marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
