import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-white dark:bg-[#090a0f] p-6">
          <section className="page-band max-w-lg p-8 text-center">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Something needs a refresh</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">The learning workspace hit an unexpected state. Reload the page to continue.</p>
            <button onClick={() => window.location.reload()} className="focus-ring mt-6 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white">
              Reload
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
