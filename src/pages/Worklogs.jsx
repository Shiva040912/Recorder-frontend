import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api";

const statuses = [
  "In Progress",
  "Pending",
  "Completed",
  "Pushed",
];

const Worklogs = () => {
  const [workLogs, setWorkLogs] = useState([]);
  const [projects, setProjects] = useState([]);

  const [projectFilter, setProjectFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [editingLog, setEditingLog] = useState(null);
  const [editPageName, setEditPageName] = useState("");
  const [editWork, setEditWork] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch projects"
        );
      }

      setProjects(data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch all work logs
  const fetchWorkLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (projectFilter) {
        params.append("projectName", projectFilter);
      }

      if (dateFilter) {
        params.append("date", dateFilter);
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/work-logs${query ? `?${query}` : ""}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch work logs"
        );
      }

      setWorkLogs(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchWorkLogs();
  }, [projectFilter, dateFilter, statusFilter]);

  // Client-side search
  const filteredLogs = useMemo(() => {
    if (!search.trim()) {
      return workLogs;
    }

    const searchText = search.toLowerCase().trim();

    return workLogs.filter((log) => {
      return (
        log.projectName?.toLowerCase().includes(searchText) ||
        log.pageName?.toLowerCase().includes(searchText) ||
        log.work?.toLowerCase().includes(searchText) ||
        log.status?.toLowerCase().includes(searchText)
      );
    });
  }, [workLogs, search]);

  // Change status
  const handleStatusChange = async (logId, newStatus) => {
    try {
      setUpdatingStatus(logId);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/work-logs/${logId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      setWorkLogs((previousLogs) =>
        previousLogs.map((log) =>
          log._id === logId ? data : log
        )
      );

      setMessage(`Status changed to ${newStatus}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Open edit
  const handleOpenEdit = (log) => {
    setEditingLog(log);
    setEditPageName(log.pageName);
    setEditWork(log.work);
    setError("");
    setMessage("");
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editPageName.trim()) {
      setError("Please enter page name");
      return;
    }

    if (!editWork.trim()) {
      setError("Please enter work");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/work-logs/${editingLog._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageName: editPageName.trim(),
            work: editWork.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update work"
        );
      }

      setWorkLogs((previousLogs) =>
        previousLogs.map((log) =>
          log._id === editingLog._id ? data : log
        )
      );

      setEditingLog(null);
      setEditPageName("");
      setEditWork("");

      setMessage("Work updated successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete work
  const handleDelete = async (log) => {
    const confirmed = window.confirm(
      `Delete this work entry?\n\n${log.pageName} - ${log.work}`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(log._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/work-logs/${log._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete work"
        );
      }

      setWorkLogs((previousLogs) =>
        previousLogs.filter(
          (item) => item._id !== log._id
        )
      );

      setMessage("Work deleted successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const clearFilters = () => {
    setProjectFilter("");
    setDateFilter("");
    setStatusFilter("");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#f6f5ff] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">
            Workspace
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-900 sm:text-3xl">
            Work Logs
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-400">
            View and manage work entries from all your projects.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-3xl border border-indigo-100/80 bg-white p-5 shadow-[0_8px_30px_rgba(79,70,229,0.05)] sm:p-6">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">

            {/* Search */}
            <div className="flex-1">
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search project, page or work..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Project */}
            <div className="w-full xl:w-52">
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Project
              </label>

              <select
                value={projectFilter}
                onChange={(event) =>
                  setProjectFilter(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">All Projects</option>

                {projects.map((project) => (
                  <option
                    key={project._id}
                    value={project.projectName}
                  >
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="w-full xl:w-48">
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Date
              </label>

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Status */}
            <div className="w-full xl:w-48">
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">All Status</option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear */}
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-bold text-emerald-600">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs font-bold text-red-500">
              {error}
            </p>
          </div>
        )}

        {/* Work Logs Table */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-indigo-100/80 bg-white shadow-[0_8px_30px_rgba(79,70,229,0.05)]">

          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                All Work Entries
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                {filteredLogs.length}{" "}
                {filteredLogs.length === 1
                  ? "entry"
                  : "entries"}{" "}
                found
              </p>
            </div>

            <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-extrabold text-indigo-600">
              {workLogs.length} Total
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Project
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Page Name
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Work
                  </th>

                  <th className="px-4 py-4 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-4 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-14 text-center"
                    >
                      <p className="text-sm font-semibold text-slate-400">
                        Loading work logs...
                      </p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-14 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-black text-indigo-500">
                        ▤
                      </div>

                      <p className="mt-4 text-sm font-extrabold text-slate-700">
                        No work logs found
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Try changing your filters or search.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-slate-100 transition hover:bg-indigo-50/30 last:border-b-0"
                    >

                      {/* Project */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-xl bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700">
                          {log.projectName}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                        {formatDate(log.workDate)}
                      </td>

                      {/* Page */}
                      <td className="px-5 py-4 text-sm font-extrabold text-slate-800">
                        {log.pageName}
                      </td>

                      {/* Work */}
                      <td className="max-w-[350px] px-5 py-4">
                        <p className="text-sm font-medium leading-6 text-slate-600">
                          {log.work}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <div className="flex items-center gap-1 rounded-2xl bg-slate-50 p-1">

                            {statuses.map((status) => {
                              const selected =
                                log.status === status;

                              const updating =
                                updatingStatus === log._id;

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  disabled={updating}
                                  onClick={() =>
                                    handleStatusChange(
                                      log._id,
                                      status
                                    )
                                  }
                                  title={`Set ${status}`}
                                  className={`flex h-8 min-w-8 items-center justify-center rounded-xl px-2 text-[10px] font-extrabold transition ${
                                    selected
                                      ? "bg-indigo-600 text-white shadow-sm"
                                      : "text-slate-400 hover:bg-white hover:text-indigo-500"
                                  } ${
                                    updating
                                      ? "cursor-wait opacity-40"
                                      : ""
                                  }`}
                                >
                                  {selected ? "✓" : ""}
                                </button>
                              );
                            })}

                          </div>
                        </div>

                        <p className="mt-1 text-center text-[9px] font-bold text-slate-400">
                          {log.status}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEdit(log)
                            }
                            className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(log)
                            }
                            disabled={deleting === log._id}
                            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleting === log._id
                              ? "..."
                              : "Delete"}
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-950/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-[30px] border border-indigo-100 bg-white p-6 shadow-2xl sm:p-7">

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">
                  Edit Work
                </p>

                <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                  Update Work Entry
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  {editingLog.projectName} •{" "}
                  {formatDate(editingLog.workDate)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingLog(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">

              <div>
                <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Page Name
                </label>

                <input
                  type="text"
                  value={editPageName}
                  onChange={(event) =>
                    setEditPageName(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Work
                </label>

                <textarea
                  value={editWork}
                  onChange={(event) =>
                    setEditWork(event.target.value)
                  }
                  rows="4"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

            </div>

            {error && (
              <p className="mt-3 text-xs font-semibold text-red-500">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() => setEditingLog(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Worklogs;