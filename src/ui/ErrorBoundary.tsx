import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    // 控制台保留完整堆栈
    console.error('[BeamScene Error]', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null, info: null });

  render() {
    if (this.state.error) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="max-w-3xl w-full rounded-lg bg-slate-900 ring-1 ring-rose-500/40 p-5">
            <h3 className="text-rose-400 font-semibold mb-2">渲染错误</h3>
            <pre className="text-xs text-rose-200 whitespace-pre-wrap break-words mb-2">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            {this.state.error?.stack && (
              <details className="mb-2">
                <summary className="text-xs text-slate-400 cursor-pointer">堆栈</summary>
                <pre className="text-[10px] text-slate-400 whitespace-pre-wrap break-words mt-1">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            {this.state.info?.componentStack && (
              <details>
                <summary className="text-xs text-slate-400 cursor-pointer">组件树</summary>
                <pre className="text-[10px] text-slate-400 whitespace-pre-wrap break-words mt-1">
                  {this.state.info.componentStack}
                </pre>
              </details>
            )}
            <button
              className="mt-3 text-xs px-3 py-1 rounded bg-sky-600 hover:bg-sky-500"
              onClick={this.reset}
            >
              重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
