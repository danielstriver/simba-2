import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <span className="text-white font-black text-3xl">S</span>
      </div>
      <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-2">404</h1>
      <p className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">Page not found</p>
      <p className="text-gray-400 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/products"
          className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-6 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
