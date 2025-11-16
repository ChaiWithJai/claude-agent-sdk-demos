interface ErrorProps {
  message: string;
  onRetry: () => void;
}

export function Error({ message, onRetry }: ErrorProps) {
  return (
    <div className="error">
      <div className="error-icon">⚠️</div>
      <h2>Something Went Wrong</h2>
      <p>{message}</p>
      <button className="primary-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
