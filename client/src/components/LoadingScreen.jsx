export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#090a0f]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
    </div>
  );
}
