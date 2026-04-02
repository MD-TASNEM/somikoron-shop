import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold text-secondary mb-4">Page Not Found</h1>
        <p className="text-dark-gray mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
