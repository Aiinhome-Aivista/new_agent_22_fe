export default function Navbar({ title }) {
  return (
    <div className="bg-white border-b border-border-light px-8 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        PwC Enterprise Demo
      </div>
    </div>
  );
}
