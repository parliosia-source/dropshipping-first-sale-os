/**
 * Shared loading spinner — used by all pages during data fetch.
 */
export default function LoadingSpinner({ className = "h-64" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}