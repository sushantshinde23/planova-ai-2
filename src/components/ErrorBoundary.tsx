import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReturnToDashboard?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PLANOVA AI ErrorBoundary] Caught runtime error:', error, errorInfo);
  }

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReturnToDashboard = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReturnToDashboard) {
      this.props.onReturnToDashboard();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center space-y-5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-[#0f172a] dark:text-white tracking-tight">
                Something went wrong.
              </h2>
              <p className="text-xs text-[#64748b] dark:text-slate-400 leading-relaxed">
                An unexpected error occurred in this workspace module. Your mission records, plans, and entered data remain safely persisted.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-800 rounded-xl text-[11px] font-mono text-left text-slate-600 dark:text-slate-400 truncate">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleTryAgain}
                className="px-4 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] dark:bg-[#2563eb] dark:hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleReturnToDashboard}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0f172a] dark:text-slate-200 border border-[#e2e8f0] dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#2563eb] dark:text-blue-400" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
