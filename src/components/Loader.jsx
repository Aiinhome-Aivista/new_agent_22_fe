export default function Loader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[50vh] h-full w-full">
      <div className="w-12 h-12 border-2 border-transparent border-b-primary-orange rounded-full animate-spin"></div>
      <div className="text-gray-500 font-medium">{message}</div>
    </div>
  );
}
