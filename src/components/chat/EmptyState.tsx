export function EmptyState() {
  return (
    <div className="flex-1 hidden lg:flex items-center justify-center text-gray-500 bg-white p-4">
      <div className="text-center">
        <svg
          className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-base md:text-lg">
          Select a contact to start chatting
        </p>
      </div>
    </div>
  );
}
