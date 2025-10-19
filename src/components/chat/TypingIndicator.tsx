export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-md px-4 py-3 rounded-2xl bg-white border border-gray-200">
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
