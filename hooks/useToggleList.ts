import { useState } from "react";

export function useToggleList(initialValues: string[] = []) {
  const [values, setValues] = useState<string[]>(initialValues);

  function toggle(value: string) {
    setValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function clear() {
    setValues([]);
  }

  return { values, setValues, toggle, clear };
}
