import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import UserViewModal from "../../components/admin/UserViewModal";
import MessageModal from "../../components/modals/MessageModal";

export default function AdminUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // CREATE MODAL
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [tempPassword, setTempPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [messageConfig, setMessageConfig] = useState(null);

  // --------------------------------------------------
  // FETCH USERS (ADMIN)
  // --------------------------------------------------
  const fetchUsers = useCallback(async () => {
    const res = await fetch("http://127.0.0.1:8000/users/all", {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    setUsers(await res.json());
  }, [user]);

  useEffect(() => {
    if (user?.access_token) fetchUsers();
  }, [user, fetchUsers]);

  // --------------------------------------------------
  // CREATE ADMIN / DELIVERY
  // --------------------------------------------------
  const handleCreateUser = async () => {
    if (!newEmail || !tempPassword) return;

    setCreating(true);

    try {
      await fetch("http://127.0.0.1:8000/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          email: newEmail,
          password: tempPassword,
          role: newRole,
        }),
      });

      setMessageConfig({
        type: "success",
        title: "Account Created",
        message: `${newRole.toUpperCase()} account for ${newEmail} has been created successfully.`,
      });
      setShowCreate(false);
      setNewEmail("");
      setTempPassword("");
      fetchUsers();
    } catch {
      setMessageConfig({
        type: "error",
        title: "Creation Failed",
        message: "Failed to create the staff account. Please check the details and try again.",
      });
    } finally {
      setCreating(false);
    }
  };

  // --------------------------------------------------
  // FILTER LOGIC
  // --------------------------------------------------
  const filteredUsers = users.filter((u) => {
    const searchMatch = u.email.toLowerCase().includes(search.toLowerCase());

    if (!searchMatch) return false;

    if (filter === "all") return true;
    if (filter === "active") return !u.disabled && !u.deleted;
    if (filter === "disabled") return u.disabled && !u.deleted;
    if (filter === "deleted") return u.deleted;

    return u.role === filter;
  });

  // --------------------------------------------------
  // UI HELPERS
  // --------------------------------------------------
  const roleBadge = (role) =>
    role === "admin"
      ? "bg-purple-500/15 text-purple-400"
      : role === "delivery"
        ? "bg-blue-500/15 text-blue-400"
        : "bg-emerald-500/15 text-emerald-400";

  const statusBadge = (user) => {
    if (user.deleted)
      return "bg-red-500/15 text-red-400";
    if (user.disabled)
      return "bg-yellow-500/15 text-yellow-400";
    return "bg-green-500/15 text-green-400";
  };

  const statusText = (user) => {
    if (user.deleted) return "DELETED";
    if (user.disabled) return "DISABLED";
    return "ACTIVE";
  };

  return (
    <div className="text-white max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">User Management</h1>
          <p className="text-gray-400">
            Users remain visible even if disabled or deleted (orders integrity).
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold shadow-lg"
        >
          Create Admin / Delivery
        </button>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          placeholder="Search email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-4 py-3"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="deleted">Deleted</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u._id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-6 py-4">{u.email}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${roleBadge(
                      u.role
                    )}`}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${statusBadge(
                      u
                    )}`}
                  >
                    {statusText(u)}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="text-cyan-400 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      <UserViewModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onActionComplete={fetchUsers}
      />

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0b0f1a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create Account</h2>

            <input
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full mb-4 bg-black/40 border border-white/10 px-4 py-3 rounded-lg"
            />

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full mb-4 bg-black/40 border border-white/10 px-4 py-3 rounded-lg"
            >
              <option value="admin">Admin</option>
              <option value="delivery">Delivery</option>
            </select>

            <input
              placeholder="Temporary Password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full mb-6 bg-black/40 border border-white/10 px-4 py-3 rounded-lg"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="px-6 py-2 bg-cyan-500 rounded-lg font-semibold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {messageConfig && (
        <MessageModal
          type={messageConfig.type}
          title={messageConfig.title}
          message={messageConfig.message}
          onClose={() => setMessageConfig(null)}
        />
      )}
    </div>
  );
}
