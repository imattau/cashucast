export default function BoostBadge({users}:{users:string[]}) {
  if(!users.length) return null;
  return (
    <div className="flex items-center gap-1 text-sm text-white/80">
      ↻ {users.length}
      {/* hover → absolute grid of avatar imgs */}
    </div>
  );
}
