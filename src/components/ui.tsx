"use client";

// გამრავალჯერადებადი UI პრიმიტივები styled-components-ით.
import styled, { keyframes } from "styled-components";

// გვერდის შიგთავსის ცენტრირებული კონტეინერი.
export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.space(6)} ${({ theme }) => theme.space(4)};
`;

// გვერდის სათაური + აღწერა + მარჯვენა მოქმედება.
export const PageHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
  margin-bottom: ${({ theme }) => theme.space(5)};

  h1 {
    font-size: 1.5rem;
    line-height: 1.2;
  }
  p {
    color: ${({ theme }) => theme.color.textMuted};
    margin-top: ${({ theme }) => theme.space(1)};
  }
`;

// ბარათი.
export const Card = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ theme }) => theme.space(4)};
`;

// badge.
export const Badge = styled.span<{ $tone?: "default" | "success" | "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(1)};
  padding: 2px ${({ theme }) => theme.space(2)};
  border-radius: ${({ theme }) => theme.radius.full};
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme, $tone }) =>
    $tone === "success"
      ? theme.color.successSoft
      : $tone === "danger"
        ? theme.color.dangerSoft
        : theme.color.surfaceAlt};
  color: ${({ theme, $tone }) =>
    $tone === "success"
      ? theme.color.success
      : $tone === "danger"
        ? theme.color.danger
        : theme.color.textMuted};
`;

// ღილაკი.
export const Button = styled.button<{ $variant?: "primary" | "ghost" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(4)};
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === "ghost" ? theme.color.border : "transparent"};
  background: ${({ theme, $variant }) =>
    $variant === "ghost" ? theme.color.surface : theme.color.primary};
  color: ${({ theme, $variant }) =>
    $variant === "ghost" ? theme.color.text : theme.color.primaryText};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: filter 0.12s ease;

  &:hover:not(:disabled) {
    filter: brightness(0.96);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.color.surface};
  font-size: 0.9rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.color.surface};
  font-size: 0.9rem;
`;

// ველი ლეიბლით.
export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(1)};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.textMuted};
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

// ჩატვირთვის ჩონჩხი.
export const Skeleton = styled.div<{ $h?: string; $w?: string }>`
  height: ${({ $h }) => $h ?? "1rem"};
  width: ${({ $w }) => $w ?? "100%"};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.color.surfaceAlt};
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ theme }) => theme.color.border};
  border-top-color: ${({ theme }) => theme.color.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const StateBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space(10)} ${({ theme }) => theme.space(4)};
  color: ${({ theme }) => theme.color.textMuted};

  h3 {
    color: ${({ theme }) => theme.color.text};
    margin-bottom: ${({ theme }) => theme.space(1)};
  }
`;

// ცარიელი მდგომარეობა.
export function EmptyState({
  title = "Nothing here yet",
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <StateBox>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </StateBox>
  );
}

// შეცდომის მდგომარეობა (retry ღილაკით).
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <StateBox>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <div style={{ marginTop: 16 }}>
          <Button $variant="ghost" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </StateBox>
  );
}
