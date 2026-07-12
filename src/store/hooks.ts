import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Slice-free hooks module: the type-only import above is erased at compile
// time, so importing from here does NOT pull every reducer into the bundle.
// Public components must import hooks from here, not from "@/store".
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
