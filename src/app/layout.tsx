import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCompanySummaries, getGlobalStats } from "@/lib/data";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CompanyLeet: LeetCode questions by company", template: "%s · CompanyLeet" },
  description: "Company-wise LeetCode interview questions with progress tracking, streaks, bookmarks and notes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const topCompanies = getCompanySummaries().slice(0, 12);
  const stats = getGlobalStats();
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <div className="flex min-h-screen">
              <Sidebar topCompanies={topCompanies} />
              <div className="flex min-w-0 flex-1 flex-col">
                <Header topCompanies={topCompanies} />
                <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
                <Footer companies={stats.companies} questions={stats.total} />
              </div>
            </div>
            <Toaster richColors position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
