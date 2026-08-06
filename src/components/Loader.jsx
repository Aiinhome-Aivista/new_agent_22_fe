export default function Loader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-8 h-8 border-4 border-primary-orange border-t-transparent rounded-full animate-spin"></div>
      <div className="text-gray-500">{message}</div>
    </div>
  );
}
