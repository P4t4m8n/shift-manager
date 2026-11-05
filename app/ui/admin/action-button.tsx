import { smallButtonClass } from "@/app/ui/styles";

export function ActionButton({
  action,
  children,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <button type="submit" className={smallButtonClass}>
        {children}
      </button>
    </form>
  );
}
