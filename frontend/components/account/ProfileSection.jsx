export default function ProfileSection({ user, successMessage }) {
  return (
    <div className="rounded-lg border border-line bg-bg p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">
        Profile Information
      </h2>

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-bg px-4 py-3 text-sm text-green">
          {successMessage}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-sm text-muted">Username</span>
          <span className="text-sm text-ink font-medium">{user.username}</span>
        </div>
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-sm text-muted">Email</span>
          <span className="text-sm text-ink font-medium">{user.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Member Since</span>
          <span className="text-sm text-ink font-medium">
            {user.memberSince}
          </span>
        </div>
      </div>
    </div>
  );
}
