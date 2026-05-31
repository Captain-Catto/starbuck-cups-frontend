"use client";

interface ExcludedPathsPanelProps {
  excludedPaths?: string[];
  addExcludedPath: (path: string) => void;
  removeExcludedPath: (index: number) => void;
}

export function ExcludedPathsPanel({
  excludedPaths,
  addExcludedPath,
  removeExcludedPath,
}: ExcludedPathsPanelProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4">🚫 Đường dẫn bị loại trừ</h2>
      <p className="text-sm text-gray-500 mb-4">
        Nhập đường dẫn (URL path) mà bạn không muốn hiển thị hiệu ứng. Ví dụ: /checkout, /cart
      </p>

      <div className="flex gap-2 mb-4">
        <input
          aria-label="/path/to/exclude"
          type="text"
          id="newPathInput"
          placeholder="/path/to/exclude"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const target = e.target as HTMLInputElement;
              addExcludedPath(target.value);
              target.value = "";
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            const input = document.getElementById("newPathInput") as HTMLInputElement;
            if (input) {
              addExcludedPath(input.value);
              input.value = "";
            }
          }}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Thêm
        </button>
      </div>

      <div className="space-y-2">
        {excludedPaths?.map((path, index) => (
          <div
            key={path}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <span className="font-mono text-sm">{path}</span>
            <button
              type="button"
              onClick={() => removeExcludedPath(index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              Xóa
            </button>
          </div>
        ))}
        {!excludedPaths?.length && (
          <p className="text-sm text-gray-400 italic">
            Chưa có đường dẫn nào bị loại trừ
          </p>
        )}
      </div>
    </div>
  );
}
