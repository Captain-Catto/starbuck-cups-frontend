export function CustomOrderDescription({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="orderdetailsstep-m-t-chi-ti-t-y-u-c-u-c-a-kh-ch-">
        Mô tả chi tiết <span className="text-red-400">*</span>
      </label>
      <textarea aria-label="Mô tả chi tiết yêu cầu của khách hàng (màu sắc, kích thước, thiết kế, logo, v.v.)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400 ${
          error ? "border-red-500" : "border-gray-600"
        }`}
        placeholder="Mô tả chi tiết yêu cầu của khách hàng (màu sắc, kích thước, thiết kế, logo, v.v.)" id="orderdetailsstep-m-t-chi-ti-t-y-u-c-u-c-a-kh-ch-"
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
