"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <div className="text-6xl">📶</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">You&apos;re offline</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm">
        No internet connection. Pages you&apos;ve already visited are still available — go back or wait for your connection to restore.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
