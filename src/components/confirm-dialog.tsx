"use client";

// დადასტურების დიალოგი (state-ით იმართება, არა როუტინგით).
import { useEffect } from "react";
import styled from "styled-components";
import { Button } from "@/components/ui";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(16, 24, 40, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space(4)};
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.md};
  max-width: 400px;
  width: 100%;
  padding: ${({ theme }) => theme.space(5)};

  h3 {
    margin-bottom: ${({ theme }) => theme.space(2)};
  }
  p {
    color: ${({ theme }) => theme.color.textMuted};
    margin-bottom: ${({ theme }) => theme.space(4)};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space(2)};
`;

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  pending,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <Panel>
        <h3>{title}</h3>
        <p>{message}</p>
        <Actions>
          <Button $variant="ghost" onClick={onCancel} disabled={pending}>
            Keep it
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? "Working…" : confirmLabel}
          </Button>
        </Actions>
      </Panel>
    </Overlay>
  );
}
