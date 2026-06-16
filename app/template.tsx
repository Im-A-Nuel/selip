// Re-mounts on every navigation, so each route plays a smooth enter animation.

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
