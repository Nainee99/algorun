import { Blocks } from "lucide-react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="relative border-t border-gray-800/50 mt-auto bg-gray-900/30 backdrop-blur-md">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <Blocks className="size-5 text-gray-500" />
            <span>Algorun — Built for developers, by developers</span>
          </div>
          <nav className="flex items-center gap-5">
            <Link
              href="/support"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              Support
            </Link>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Algorun. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
