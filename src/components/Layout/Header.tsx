import { Brain } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gray-800 text-white px-4 py-2.5 flex items-center justify-center gap-2">
      <Brain className="w-6 h-6 text-red-500" />
      <h1 className="text-lg font-semibold">Brain Wrangler</h1>
    </header>
  );
}
