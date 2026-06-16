"use client";

import { Facebook, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tContacts = useTranslations("contacts");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t border-neutral-900">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">H&#39;s shoucangpu</h3>
            <p className="text-neutral-300 text-base mb-4">
              {t("shopDescription")}
              <br />
              {t("shopDescLine2")}
              <br />
              <br />
              {t("shopDescLine3")}
              <br />
              {t("shopDescLine4")}
              <br />
              <br />
              {t("shopDescLine5")}
              <br />
              PAGE:{" "}
              <Link
                href="https://www.facebook.com/p/Hs%E6%94%B6%E8%97%8F%E9%8B%AA-Hs-shoucangpu-61560973846348/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-neutral-300 transition-colors underline"
              >
                H&#39;s shoucangpu
              </Link>
              <br />
              FB:{" "}
              <Link
                href="https://www.facebook.com/hasron.luong"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-neutral-300 transition-colors underline"
              >
                Hasron Leung
              </Link>
              <br />
              {t("shopDescLine6")}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/hasron.luong"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 bg-neutral-900 border border-neutral-800 hover:bg-white hover:text-black rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t("contact")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="size-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href="tel:0896686008"
                    className="text-neutral-300 hover:text-white transition-colors text-base"
                  >
                    0896 686 008
                  </a>
                  <p className="text-sm text-neutral-400 mt-1">
                    <a
                      href="https://zalo.me/84896686008"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-300 hover:text-white transition-colors"
                    >
                      Zalo: 0896 686 008
                    </a>
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="size-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:hasronleung@gmail.com"
                  className="text-neutral-300 hover:text-white transition-colors text-base"
                >
                  hasronleung@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="size-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300 text-base">
                  {tContacts("addressShort")}
                </span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t("businessHours")}</h3>
            <ul className="space-y-2 text-base">
              <li className="flex justify-between text-neutral-300">
                <span>{t("allDays")}</span>
                <span>24/7</span>
              </li>
            </ul>
            <div className="mt-4 p-4 bg-neutral-950 border border-neutral-900 rounded-lg">
              <p className="text-sm text-neutral-300">
                {t("contactVia")}{" "}
                <a
                  href="https://www.facebook.com/messages/e2ee/t/9870524003031490"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-neutral-100 transition-colors"
                >
                  Messenger
                </a>{" "}
                {t("or")}{" "}
                <a
                  href="https://zalo.me/84896686008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-neutral-100 transition-colors"
                >
                  Zalo
                </a>{" "}
                {t("toGetConsultation")}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-neutral-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm text-center md:text-left">
              © {currentYear} H&#39;s shoucangpu. {t("allRightsReserved")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
