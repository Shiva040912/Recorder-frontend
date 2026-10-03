import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const statuses = [
  "In Progress",
  "Pending",
  "Completed",
  "Pushed",
];

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const Project = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [pages, setPages] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);

  const [date, setDate] = useState(getToday());

  const [pageName, setPageName] = useState("");

  const [selectedPage, setSelectedPage] =
    useState(null);

  const [task, setTask] = useState("");

  const [editingPage, setEditingPage] =
    useState(null);

  const [editPageName, setEditPageName] =
    useState("");

  const [viewTask, setViewTask] = useState(null);

  const [editingTask, setEditingTask] =
    useState(null);

  const [editTaskPage, setEditTaskPage] =
    useState("");

  const [editTaskWork, setEditTaskWork] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [loadingPages, setLoadingPages] =
    useState(true);
  const [loadingTasks, setLoadingTasks] =
    useState(false);

  const [addingPage, setAddingPage] =
    useState(false);
  const [addingTask, setAddingTask] =
    useState(false);
  const [savingPage, setSavingPage] =
    useState(false);
  const [savingTask, setSavingTask] =
    useState(false);

  const [deletingPage, setDeletingPage] =
    useState(null);
  const [deletingTask, setDeletingTask] =
    useState(null);
  const [updatingStatus, setUpdatingStatus] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Project
  const fetchProject = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/projects/${projectId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch project"
        );
      }

      setProject(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Pages
  const fetchPages = async () => {
    if (!project) {
      return;
    }

    try {
      setLoadingPages(true);

      const params = new URLSearchParams({
        projectName: project.projectName,
      });

      const response = await fetch(
        `${API_URL}/pages?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch pages"
        );
      }

      setPages(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingPages(false);
    }
  };

  // Work logs
  const fetchWorkLogs = async () => {
    if (!project) {
      return;
    }

    try {
      setLoadingTasks(true);

      const params = new URLSearchParams({
        projectName: project.projectName,
        date,
      });

      const response = await fetch(
        `${API_URL}/work-logs?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch work"
        );
      }

      setWorkLogs(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      fetchPages();
      fetchWorkLogs();
    }
  }, [project]);

  useEffect(() => {
    if (project) {
      fetchWorkLogs();
    }
  }, [date]);

  // Add page
  const handleAddPage = async () => {
    if (!pageName.trim()) {
      setError("Please enter page name");
      return;
    }

    try {
      setAddingPage(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/pages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: project.projectName,
            pageName: pageName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create page"
        );
      }

      setPages((previous) => [
        ...previous,
        data,
      ]);

      setPageName("");
      setMessage("Page added successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingPage(false);
    }
  };

  // Open page
  const openPage = (page) => {
    setSelectedPage(page);
    setTask("");
    setError("");
    setMessage("");
  };

  // Add task
  const handleAddTask = async () => {
    if (!task.trim()) {
      setError("Please enter task");
      return;
    }

    try {
      setAddingTask(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/work-logs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: project.projectName,
            workDate: date,
            pageName: selectedPage.pageName,
            work: task.trim(),
            status: "Pending",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add task"
        );
      }

      setWorkLogs((previous) => [
        ...previous,
        data,
      ]);

      setTask("");
      setMessage("Task added successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingTask(false);
    }
  };

  // Edit page
  const openEditPage = (page) => {
    setEditingPage(page);
    setEditPageName(page.pageName);
    setError("");
  };

  const handleEditPage = async () => {
    if (!editPageName.trim()) {
      setError("Please enter page name");
      return;
    }

    try {
      setSavingPage(true);
      setError("");

      const response = await fetch(
        `${API_URL}/pages/${editingPage._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageName: editPageName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update page"
        );
      }

      setPages((previous) =>
        previous.map((page) =>
          page._id === data._id
            ? data
            : page
        )
      );

      if (
        selectedPage &&
        selectedPage._id === data._id
      ) {
        setSelectedPage(data);
      }

      setWorkLogs((previous) =>
        previous.map((log) =>
          log.pageName === editingPage.pageName
            ? {
                ...log,
                pageName: data.pageName,
              }
            : log
        )
      );

      setEditingPage(null);
      setMessage("Page updated successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setSavingPage(false);
    }
  };

  // Delete page
  const handleDeletePage = async (page) => {
    const confirmed = window.confirm(
      `Delete "${page.pageName}"?\n\nAll tasks inside this page will also be deleted.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPage(page._id);
      setError("");

      const response = await fetch(
        `${API_URL}/pages/${page._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete page"
        );
      }

      setPages((previous) =>
        previous.filter(
          (item) => item._id !== page._id
        )
      );

      setWorkLogs((previous) =>
        previous.filter(
          (log) => log.pageName !== page.pageName
        )
      );

      if (
        selectedPage &&
        selectedPage._id === page._id
      ) {
        setSelectedPage(null);
      }

      setMessage("Page deleted successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingPage(null);
    }
  };

  // Status
  const handleStatusChange = async (
    log,
    newStatus
  ) => {
    if (log.status === "Pushed") {
      return;
    }

    if (newStatus === log.status) {
      return;
    }

    try {
      setUpdatingStatus(log._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/work-logs/${log._id}`,
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
          data.message ||
            "Failed to update status"
        );
      }

      setWorkLogs((previous) =>
        previous.map((item) =>
          item._id === log._id ? data : item
        )
      );

      setMessage(
        `Status changed to ${newStatus}`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // View task
  const openTask = (log) => {
    setViewTask(log);
  };

  // Edit task
  const openEditTask = (log) => {
    if (log.status === "Pushed") {
      setError(
        "Pushed task status is locked, but task details can still be edited."
      );
    }

    setEditingTask(log);
    setEditTaskPage(log.pageName);
    setEditTaskWork(log.work);
  };

  const handleEditTask = async () => {
    if (!editTaskPage.trim()) {
      setError("Please enter page name");
      return;
    }

    if (!editTaskWork.trim()) {
      setError("Please enter task");
      return;
    }

    try {
      setSavingTask(true);
      setError("");

      const response = await fetch(
        `${API_URL}/work-logs/${editingTask._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageName: editTaskPage.trim(),
            work: editTaskWork.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update task"
        );
      }

      setWorkLogs((previous) =>
        previous.map((item) =>
          item._id === data._id ? data : item
        )
      );

      setEditingTask(null);
      setMessage("Task updated successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setSavingTask(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (log) => {
    const confirmed = window.confirm(
      `Delete this task?\n\n${log.work}`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTask(log._id);
      setError("");

      const response = await fetch(
        `${API_URL}/work-logs/${log._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete task"
        );
      }

      setWorkLogs((previous) =>
        previous.filter(
          (item) => item._id !== log._id
        )
      );

      setMessage("Task deleted successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingTask(null);
    }
  };

  const getPageTasks = (page) => {
    return workLogs.filter(
      (log) => log.pageName === page.pageName
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] p-8 text-center">
        <p className="text-sm font-bold text-zinc-500">
          Loading project...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#08080a] p-8">
        <p className="text-red-400">
          {error || "Project not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08080a] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8">
      <div className="mx-auto max-w-[1400px]">

        <Link
          to="/projects"
          className="text-xs font-bold text-violet-400 hover:text-violet-300"
        >
          ← Back to Projects
        </Link>

        {/* Header */}
        <div className="mt-5 rounded-[30px] border border-violet-500/20 bg-gradient-to-br from-violet-950 via-indigo-950 to-[#111114] p-6 shadow-2xl sm:p-8">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-300">
            Project
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-white">
            {project.projectName}
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Manage pages and daily tasks.
          </p>
        </div>

        {/* Date */}
        <div className="mt-5 rounded-3xl border border-white/10 bg-[#111114] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-400">
                Work Date
              </p>

              <h2 className="mt-2 text-lg font-extrabold text-white">
                {date}
              </h2>
            </div>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#18181c] px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Add Page */}
        <div className="mt-5 rounded-3xl border border-white/10 bg-[#111114] p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-400">
            Pages
          </p>

          <h2 className="mt-2 text-lg font-extrabold text-white">
            Add Page
          </h2>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={pageName}
              onChange={(event) => {
                setPageName(event.target.value);
                setError("");
              }}
              placeholder="Example: GC Entry"
              className="flex-1 rounded-2xl border border-white/10 bg-[#18181c] px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
            />

            <button
              type="button"
              onClick={handleAddPage}
              disabled={addingPage}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {addingPage ? "Adding..." : "+ Add Page"}
            </button>
          </div>

          {message && (
            <p className="mt-3 text-xs font-bold text-emerald-400">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-3 text-xs font-bold text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Pages */}
        <div className="mt-7">
          <h2 className="text-lg font-extrabold text-white">
            Project Pages
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Click a page to view and manage its tasks.
          </p>

          {loadingPages ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-[#111114] p-8 text-center">
              <p className="text-sm text-zinc-500">
                Loading pages...
              </p>
            </div>
          ) : pages.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-[#111114] p-10 text-center">
              <p className="text-sm font-bold text-zinc-500">
                No pages yet
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => {
                const pageTasks =
                  getPageTasks(page);

                return (
                  <div
                    key={page._id}
                    className="rounded-3xl border border-white/10 bg-[#111114] p-5 transition hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-950/10"
                  >
                    <button
                      type="button"
                      onClick={() => openPage(page)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600/15 text-lg font-black text-violet-400">
                          #
                        </div>

                        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold text-zinc-500">
                          {pageTasks.length}{" "}
                          {pageTasks.length === 1
                            ? "Task"
                            : "Tasks"}
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-extrabold text-white">
                        {page.pageName}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-600">
                        Click to open tasks →
                      </p>
                    </button>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openPage(page)}
                        className="rounded-xl bg-violet-600/10 px-3 py-2.5 text-xs font-bold text-violet-400 hover:bg-violet-600/20"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditPage(page)
                        }
                        className="rounded-xl bg-white/5 px-3 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeletePage(page)
                        }
                        disabled={
                          deletingPage === page._id
                        }
                        className="col-span-2 rounded-xl bg-red-500/10 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-40"
                      >
                        {deletingPage === page._id
                          ? "Deleting..."
                          : "Delete Page"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PAGE TASK MODAL */}
      {selectedPage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-3 py-5 backdrop-blur-md">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#101014] shadow-2xl">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-400">
                  Page
                </p>

                <h2 className="mt-2 text-xl font-extrabold text-white">
                  {selectedPage.pageName}
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Tasks for {date}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPage(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5 sm:p-6">

              {/* Add Task */}
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
                <p className="text-xs font-extrabold text-white">
                  Add Task
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={task}
                    onChange={(event) => {
                      setTask(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter task / work"
                    className="flex-1 rounded-xl border border-white/10 bg-[#18181c] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
                  />

                  <button
                    type="button"
                    onClick={handleAddTask}
                    disabled={addingTask}
                    className="rounded-xl bg-violet-600 px-5 py-3 text-xs font-extrabold text-white hover:bg-violet-500 disabled:opacity-50"
                  >
                    {addingTask
                      ? "Adding..."
                      : "+ Add Task"}
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="mt-5 space-y-3">
                {loadingTasks ? (
                  <p className="py-8 text-center text-sm text-zinc-600">
                    Loading tasks...
                  </p>
                ) : getPageTasks(selectedPage).length ===
                  0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                    <p className="text-sm font-bold text-zinc-500">
                      No tasks for this date
                    </p>
                  </div>
                ) : (
                  getPageTasks(selectedPage).map(
                    (log) => {
                      const isPushed =
                        log.status === "Pushed";

                      return (
                        <div
                          key={log._id}
                          className="rounded-2xl border border-white/10 bg-[#151519] p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-bold leading-6 text-white">
                                {log.work}
                              </p>

                              <div className="mt-2 flex items-center gap-2">
                                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-400">
                                  {log.status}
                                </span>

                                {isPushed && (
                                  <span className="text-[10px] text-zinc-600">
                                    🔒 Locked
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status stepper */}
                            <div className="flex flex-wrap gap-1 rounded-xl bg-black/30 p-1">
                              {statuses.map(
                                (status) => {
                                  const selected =
                                    log.status ===
                                    status;

                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      disabled={
                                        isPushed ||
                                        updatingStatus ===
                                          log._id
                                      }
                                      onClick={() =>
                                        handleStatusChange(
                                          log,
                                          status
                                        )
                                      }
                                      className={`rounded-lg px-2.5 py-2 text-[9px] font-extrabold transition ${
                                        selected
                                          ? "bg-violet-600 text-white shadow-lg"
                                          : "text-zinc-600 hover:bg-white/5 hover:text-zinc-300"
                                      } ${
                                        isPushed
                                          ? "cursor-not-allowed opacity-50"
                                          : ""
                                      }`}
                                    >
                                      {selected
                                        ? "✓ "
                                        : ""}
                                      {status}
                                    </button>
                                  );
                                }
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openTask(log)
                                }
                                className="rounded-xl bg-violet-600/10 px-3 py-2 text-xs font-bold text-violet-400"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditTask(log)
                                }
                                className="rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteTask(
                                    log
                                  )
                                }
                                disabled={
                                  deletingTask ===
                                  log._id
                                }
                                className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400"
                              >
                                {deletingTask ===
                                log._id
                                  ? "..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Task */}
      {viewTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#111114] p-6 shadow-2xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-400">
                  Task Details
                </p>

                <h2 className="mt-2 text-xl font-extrabold text-white">
                  {viewTask.pageName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewTask(null)}
                className="text-xl text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#18181c] p-4">
              <p className="text-xs font-bold text-zinc-600">
                WORK
              </p>

              <p className="mt-2 break-words text-sm leading-7 text-zinc-200">
                {viewTask.work}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#18181c] p-4">
              <span className="text-xs font-bold text-zinc-500">
                Status
              </span>

              <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-400">
                {viewTask.status}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Edit Page */}
      {editingPage && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111114] p-6">
            <h2 className="text-xl font-extrabold text-white">
              Edit Page
            </h2>

            <input
              type="text"
              value={editPageName}
              onChange={(event) =>
                setEditPageName(event.target.value)
              }
              className="mt-5 w-full rounded-2xl border border-white/10 bg-[#18181c] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setEditingPage(null)
                }
                className="flex-1 rounded-2xl bg-white/5 py-3 text-sm font-bold text-zinc-400"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleEditPage}
                disabled={savingPage}
                className="flex-1 rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white"
              >
                {savingPage
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task */}
      {editingTask && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#111114] p-6">
            <h2 className="text-xl font-extrabold text-white">
              Edit Task
            </h2>

            <input
              type="text"
              value={editTaskPage}
              onChange={(event) =>
                setEditTaskPage(
                  event.target.value
                )
              }
              className="mt-5 w-full rounded-2xl border border-white/10 bg-[#18181c] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
              placeholder="Page Name"
            />

            <textarea
              value={editTaskWork}
              onChange={(event) =>
                setEditTaskWork(
                  event.target.value
                )
              }
              rows="4"
              className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-[#18181c] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-violet-500"
              placeholder="Task"
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setEditingTask(null)
                }
                className="flex-1 rounded-2xl bg-white/5 py-3 text-sm font-bold text-zinc-400"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleEditTask}
                disabled={savingTask}
                className="flex-1 rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white"
              >
                {savingTask
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;