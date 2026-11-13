import Link from "next/link";

export function Footer({ companies, questions }: { companies: number; questions: number }) {
  return (
    <footer className="border-t px-4 py-6 text-sm text-muted-foreground lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {questions.toLocaleString()} questions across {companies} companies. Progress, bookmarks and notes are saved in
          your browser.
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/companies" className="hover:text-foreground">Companies</Link>
          <Link href="/questions" className="hover:text-foreground">Questions</Link>
          <Link href="/topics" className="hover:text-foreground">Topics</Link>
          <a
            href="https://github.com/liquidslr/leetcode-company-wise-problems"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Data source
          </a>
        </nav>
      </div>
    </footer>
  );
}
