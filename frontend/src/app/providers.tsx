// frontend/src/app/providers.tsx

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/** Central place for future context providers (auth, theme, etc.). */
export function Providers({ children }: Props) {
  return <>{children}</>;
}