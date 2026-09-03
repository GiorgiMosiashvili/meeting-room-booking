"use client";

// მარტივი მოდალი: overlay, Esc-ით და გარეთ დაჭერით დახურვა, scroll lock.
// ჩვეულებრივ იხურება router.back()-ით (intercepting route-ის გამო).
import { useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(16, 24, 40, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: ${({ theme }) => theme.space(6)} ${({ theme }) => theme.space(4)};
  overflow-y: auto;
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.md};
  width: 100%;
  max-width: 560px;
  padding: ${({ theme }) => theme.space(5)};

  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    max-width: none;
    min-height: 100%;
  }
`;

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [router]);

  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) router.back();
      }}
    >
      <Panel>{children}</Panel>
    </Overlay>
  );
}
