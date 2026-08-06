export default function FileTree({ manifest }) {
  if (!manifest || !manifest.files) return <div className="text-gray-500 italic">No files available</div>;

  return (
    <div className="bg-gray-50 p-4 rounded border border-border-light space-y-2">
      {manifest.files.map((file, idx) => (
        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📄</span>
            <span className="font-mono text-sm font-medium">{file.filename}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-48 truncate">{file.purpose}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              file.status === 'generated' ? 'bg-green-100 text-green-700' : 
              file.status === 'planned' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {file.status || 'planned'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
