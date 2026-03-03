"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

// Messenger Icon Component (same as FloatingContactButton)
const MessengerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.3 9.6C17.6314 9.15817 17.5418 8.53137 17.1 8.2C16.6582 7.86863 16.0314 7.95817 15.7 8.4L13.3918 11.4776L11.2071 9.29289C11.0021 9.08791 10.7183 8.98197 10.4291 9.00252C10.1399 9.02307 9.87393 9.16809 9.7 9.4L6.7 13.4C6.36863 13.8418 6.45817 14.4686 6.9 14.8C7.34183 15.1314 7.96863 15.0418 8.3 14.6L10.6082 11.5224L12.7929 13.7071C12.9979 13.9121 13.2817 14.018 13.5709 13.9975C13.8601 13.9769 14.1261 13.8319 14.3 13.6L17.3 9.6Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z"
      fill="currentColor"
    />
  </svg>
);

// Zalo Icon Component (same as FloatingContactButton)
const ZaloIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 614.501 613.667"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M464.721,301.399c-13.984-0.014-23.707,11.478-23.944,28.312c-0.251,17.771,9.168,29.208,24.037,29.202   c14.287-0.007,23.799-11.095,24.01-27.995C489.028,313.536,479.127,301.399,464.721,301.399z" />
    <path d="M291.83,301.392c-14.473-0.316-24.578,11.603-24.604,29.024c-0.02,16.959,9.294,28.259,23.496,28.502   c15.072,0.251,24.592-10.87,24.539-28.707C315.214,313.318,305.769,301.696,291.83,301.392z" />
    <path d="M310.518,3.158C143.102,3.158,7.375,138.884,7.375,306.3s135.727,303.142,303.143,303.142   c167.415,0,303.143-135.727,303.143-303.142S477.933,3.158,310.518,3.158z M217.858,391.083   c-33.364,0.818-66.828,1.353-100.133-0.343c-21.326-1.095-27.652-18.647-14.248-36.583c21.55-28.826,43.886-57.065,65.792-85.621   c2.546-3.305,6.214-5.996,7.15-12.705c-16.609,0-32.784,0.04-48.958-0.013c-19.195-0.066-28.278-5.805-28.14-17.652   c0.132-11.768,9.175-17.329,28.397-17.348c25.159-0.026,50.324-0.06,75.476,0.026c9.637,0.033,19.604,0.105,25.304,9.789   c6.22,10.561,0.284,19.512-5.646,27.454c-21.26,28.497-43.015,56.624-64.559,84.902c-2.599,3.41-5.119,6.88-9.453,12.725   c23.424,0,44.123-0.053,64.816,0.026c8.674,0.026,16.662,1.873,19.941,11.267C237.892,379.329,231.368,390.752,217.858,391.083z    M350.854,330.211c0,13.417-0.093,26.841,0.039,40.265c0.073,7.599-2.599,13.647-9.512,17.084   c-7.296,3.642-14.71,3.028-20.304-2.968c-3.997-4.281-6.214-3.213-10.488-0.422c-17.955,11.728-39.908,9.96-56.597-3.866   c-29.928-24.789-30.026-74.803-0.211-99.776c16.194-13.562,39.592-15.462,56.709-4.143c3.951,2.619,6.201,4.815,10.396-0.053   c5.39-6.267,13.055-6.761,20.271-3.357c7.454,3.509,9.935,10.165,9.776,18.265C350.67,304.222,350.86,317.217,350.854,330.211z    M395.617,369.579c-0.118,12.837-6.398,19.783-17.196,19.908c-10.779,0.132-17.593-6.966-17.646-19.512   c-0.179-43.352-0.185-86.696,0.007-130.041c0.059-12.256,7.302-19.921,17.896-19.222c11.425,0.752,16.992,7.448,16.992,18.833   c0,22.104,0,44.216,0,66.327C395.677,327.105,395.828,348.345,395.617,369.579z M463.981,391.868   c-34.399-0.336-59.037-26.444-58.786-62.289c0.251-35.66,25.304-60.713,60.383-60.396c34.631,0.304,59.374,26.306,58.998,61.986   C524.207,366.492,498.534,392.205,463.981,391.868z" />
  </svg>
);

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Liên hệ" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ</h1>
          <p className="text-zinc-400 text-lg">
            Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn bạn
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Phone Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Điện thoại</h3>
            <a
              href="tel:0896686008"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              0896 686 008
            </a>
            <p className="text-sm text-zinc-500 mt-2">
              24/7 Nếu khách cần gấp ship hỏa tốc cứ gọi trực tiếp sđt sẽ có hỗ
              trợ liền.
            </p>
          </div>

          {/* Zalo Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <ZaloIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Zalo</h3>
            <a
              href="https://zalo.me/84896686008"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              0896 686 008
            </a>
            <p className="text-sm text-zinc-500 mt-2">Hỗ trợ 24/7</p>
          </div>

          {/* Messenger Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <MessengerIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Messenger</h3>
            <a
              href="https://www.facebook.com/messages/e2ee/t/9870524003031490"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Facebook Messenger
            </a>
            <p className="text-sm text-zinc-500 mt-2">Hỗ trợ 24/7</p>
          </div>

          {/* Email Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <a
              href="mailto:hasronleung@gmail.com"
              className="text-zinc-400 hover:text-white transition-colors break-all"
            >
              hasronleung@gmail.com
            </a>
            <p className="text-sm text-zinc-500 mt-2">Phản hồi trong 24 giờ</p>
          </div>

          {/* Address Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Địa chỉ</h3>
            <p className="text-zinc-400">
              254 Trần Hưng Đạo B
              <br />
              Phường 11, Quận 5
              <br />
              TP. Hồ Chí Minh
            </p>
          </div>

          {/* Working Hours Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Giờ làm việc</h3>
            <div className="text-zinc-400 text-sm space-y-1">
              <p>Hỗ trợ 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
