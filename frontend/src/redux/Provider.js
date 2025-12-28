"use client";

import { Provider } from "react-redux";
import store from "./store";
import AuthHydration from "@/components/AuthHydration";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthHydration>
        {children}
      </AuthHydration>
    </Provider>
  );
}
