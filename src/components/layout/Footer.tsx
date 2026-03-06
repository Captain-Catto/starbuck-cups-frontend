"use client";

import { Facebook, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-white border-t border-zinc-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">H&#39;s shoucangpu</h3>
            <p className="text-zinc-200 text-sm mb-4">
              Ly ST@RBUCKS CHÍNH HÃNG các nước
              <br />
              95% MẪU TRÊN PAGE là HÀNG SẴN SHIP HOẢ TỐC📍HCM📍
              <br />
              <br />
              Quà tặng cao cấp Luxury
              <br />
              Có dịch vụ gói quà
              <br />
              <br />
              Tiệm sưu tầm của H
              <br />
              PAGE:{" "}
              <Link
                href="https://www.facebook.com/p/Hs%E6%94%B6%E8%97%8F%E9%8B%AA-Hs-shoucangpu-61560973846348/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-zinc-100 transition-colors underline"
              >
                H&#39;s shoucangpu
              </Link>
              <br />
              FB:{" "}
              <Link
                href="https://www.facebook.com/hasron.luong"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-zinc-100 transition-colors underline"
              >
                Hasron Leung
              </Link>
              <br />
              Dịch vụ ship hoả tốc 24/7
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/hasron.luong"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-zinc-200 flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href="tel:0896686008"
                    className="text-zinc-200 hover:text-white transition-colors text-sm"
                  >
                    0896 686 008
                  </a>
                  <p className="text-xs text-zinc-200 mt-1">
                    <a
                      href="https://zalo.me/84896686008"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-200 hover:text-white transition-colors"
                    >
                      Zalo:{" "}
                    </a>
                    <a
                      href="https://zalo.me/84896686008"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-200 hover:text-white transition-colors"
                    >
                      0896 686 008
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-zinc-200 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:hasronleung@gmail.com"
                  className="text-zinc-200 hover:text-white transition-colors text-sm"
                >
                  hasronleung@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-zinc-200 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-200 text-sm">
                  254 Trần Hưng Đạo B, P.11, Q.5, TP.HCM
                </span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-lg font-bold mb-4">Giờ làm việc</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between text-zinc-200">
                <span>Tất cả các ngày:</span>
                <span>24/7</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
              <p className="text-xs text-zinc-300">
                Liên hệ qua{" "}
                <a
                  href="https://www.facebook.com/messages/e2ee/t/9870524003031490"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-zinc-100 transition-colors"
                >
                  Messenger
                </a>{" "}
                hoặc{" "}
                <a
                  href="https://zalo.me/84896686008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-zinc-100 transition-colors"
                >
                  Zalo
                </a>{" "}
                để được tư vấn 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-200 text-sm text-center md:text-left">
              © {currentYear} H&#39;s shoucangpu. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
