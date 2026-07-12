"use client";

import { Provider } from "react-redux";
import { publicStore } from "@/store/publicStore";

export default function PublicStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={publicStore}>{children}</Provider>;
}
