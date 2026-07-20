import { useEffect, useMemo, useState } from "react";

export function useLocalTime(timezone) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  return useMemo(() => {
    if (!timezone) {
      return "";
    }

    return new Intl.DateTimeFormat("en", {
      dateStyle: "full",
      timeStyle: "medium",
      timeZone: timezone,
    }).format(now);
  }, [now, timezone]);
}
