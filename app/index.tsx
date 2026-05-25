import { useEffect, useState } from "react";
import { Redirect } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { hasAuthSession } from "@/src/services/authSessionService";

export default function IndexScreen() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    hasAuthSession()
      .then((sessionExists) => {
        if (mounted) setIsSignedIn(sessionExists);
      })
      .catch(() => {
        if (mounted) setIsSignedIn(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isSignedIn === null) return null;

  if (isSignedIn) return <Redirect href={ROUTES.tabs} />;

  return <Redirect href={ROUTES.splash} />;
}
