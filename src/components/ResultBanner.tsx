import { CheckCircle2, XCircle } from 'lucide-react';
import type { AvailabilityResult } from '@/availability';

interface ResultBannerProps {
  result: AvailabilityResult;
  submitted: boolean;
}

export function ResultBanner({ result, submitted }: ResultBannerProps) {
  if (!submitted) return null;

  const styles = result.available
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
    : 'bg-rose-50 border-rose-200 text-rose-900';

  return (
    <div
      role="status"
      className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-3 text-sm ${styles}`}
    >
      {result.available ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" aria-hidden />
      )}
      <div>
        <p className="font-semibold">
          {result.available ? 'Available' : 'Unavailable'}
        </p>
        <p className="mt-0.5">{result.message}</p>
      </div>
    </div>
  );
}
