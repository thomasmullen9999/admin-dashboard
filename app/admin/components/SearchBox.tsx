"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  return (
    <input
      placeholder="Search email or campaign..."
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        router.push(`/admin?q=${e.target.value}`);
      }}
      style={{
        marginTop: 12,
        padding: 8,
        width: 300,
      }}
    />
  );
}
