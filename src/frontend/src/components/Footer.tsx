import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-4">
        <div className="flex flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            © 2026. Dibuat dengan <Heart className="h-3 w-3 fill-red-500 text-red-500" /> menggunakan{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
