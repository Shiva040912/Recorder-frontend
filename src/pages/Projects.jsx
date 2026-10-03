import { useEffect, useMemo, useState } from "react";

const API_URL =  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Pushed",
];

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatCreatedDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusIndex = (status) => {
  return STATUSES.indexOf(status);
};

const getNextStatus = (status) => {
  const index = getStatusIndex(status);

  if (index === -1 || index === STATUSES.length - 1) {
    return null;
  }

  return STATUSES[index + 1];
};

const statusClass = (status) => {
  if (status === "Pending") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  if (status === "In Progress") {
    return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }

  if (status === "Completed") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "Pushed") {
    return "border-violet-500/30 bg-violet-500/15 text-violet-300";
  }

  return "border-zinc-700 bg-zinc-800 text-zinc-300";
};

const Projects = () => {
  const [projects, setProjects] = useState([]);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);

  const [projectName, setProjectName] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [workLogs, setWorkLogs] = useState([]);
  const [loadingWork, setLoadingWork] = useState(false);

  const [pageName, setPageName] = useState("");
  const [work, setWork] = useState("");
  const [addingWork, setAddingWork] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [updatingProject, setUpdatingProject] = useState(false);

  const [editingWork, setEditingWork] = useState(null);
  const [editingPageName, setEditingPageName] = useState("");
  const [editingWorkText, setEditingWorkText] = useState("");
  const [updatingWork, setUpdatingWork] = useState(false);

  const [selectedPage, setSelectedPage] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(null);

  // --------------------------------------------------
  // FETCH PROJECTS
  // --------------------------------------------------

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");

      const response = await fetch(`${API_URL}/projects`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch projects"
        );
      }

      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --------------------------------------------------
  // FETCH WORK LOGS
  // --------------------------------------------------

  const fetchWorkLogs = async () => {
    if (!selectedProject) {
      return;
    }

    try {
      setLoadingWork(true);
      setError("");

      const params = new URLSearchParams({
        projectName: selectedProject.projectName,
        date: selectedDate,
      });

      const response = await fetch(
        `${API_URL}/work-logs?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch work logs"
        );
      }

      setWorkLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingWork(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchWorkLogs();
    }
  }, [selectedProject, selectedDate]);

  // --------------------------------------------------
  // CREATE PROJECT
  // --------------------------------------------------

  const handleCreateProject = async (event) => {
    event.preventDefault();

    if (!projectName.trim()) {
      setError("Please enter a project name");
      return;
    }

    try {
      setCreatingProject(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: projectName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project"
        );
      }

      setProjects((previous) => [data, ...previous]);

      setProjectName("");
      setMessage("Project created successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingProject(false);
    }
  };

  // --------------------------------------------------
  // DELETE PROJECT
  // --------------------------------------------------

  const handleDeleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.projectName}"?\n\nAll work entries inside this project will also be deleted.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProject(project._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/projects/${project._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete project"
        );
      }

      setProjects((previous) =>
        previous.filter(
          (item) => item._id !== project._id
        )
      );

      if (selectedProject?._id === project._id) {
        setSelectedProject(null);
        setWorkLogs([]);
      }

      setMessage("Project deleted successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingProject(null);
    }
  };

  // --------------------------------------------------
  // PRINT PROJECT REPORT
  // --------------------------------------------------

  const handlePrintProject = (project) => {
    const reportUrl = `${API_URL}/reports/project/${project._id}`;

    window.open(reportUrl, "_blank", "noopener,noreferrer");
  };

  // --------------------------------------------------
  // VIEW PROJECT
  // --------------------------------------------------

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setSelectedDate(getToday());
    setPageName("");
    setWork("");
    setMessage("");
    setError("");
  };

  // --------------------------------------------------
  // UPDATE PROJECT
  // --------------------------------------------------

  const handleUpdateProject = async () => {
    if (!editingProjectName.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setUpdatingProject(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/projects/${editingProject._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: editingProjectName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update project"
        );
      }

      setProjects((previous) =>
        previous.map((project) =>
          project._id === data._id ? data : project
        )
      );

      if (selectedProject?._id === data._id) {
        setSelectedProject(data);
      }

      setEditingProject(null);
      setEditingProjectName("");

      setMessage("Project updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingProject(false);
    }
  };

  // --------------------------------------------------
  // ADD WORK
  // --------------------------------------------------

  const handleAddWork = async (event) => {
    event.preventDefault();

    if (!pageName.trim()) {
      setError("Please enter page name");
      return;
    }

    if (!work.trim()) {
      setError("Please enter work");
      return;
    }

    try {
      setAddingWork(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/work-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: selectedProject.projectName,
          workDate: selectedDate,
          pageName: pageName.trim(),
          work: work.trim(),
          status: "Pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add work"
        );
      }

      setWorkLogs((previous) => [...previous, data]);

      setPageName("");
      setWork("");

      setMessage("Work added successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingWork(false);
    }
  };

  // --------------------------------------------------
  // VIEW PAGE TASKS
  // --------------------------------------------------

  const handleViewPage = (page) => {
    setSelectedPage(page);
    setError("");
    setMessage("");
  };

  // --------------------------------------------------
  // ADD TASK FROM PAGE POPUP
  // --------------------------------------------------

  const handleAddTaskFromPage = async (event) => {
    event.preventDefault();

    if (!selectedPage?.pageName) {
      return;
    }

    if (!work.trim()) {
      setError("Please enter task");
      return;
    }

    try {
      setAddingWork(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/work-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: selectedProject.projectName,
          workDate: selectedDate,
          pageName: selectedPage.pageName,
          work: work.trim(),
          status: "Pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add task"
        );
      }

      setWorkLogs((previous) => [...previous, data]);

      setSelectedPage((previous) => ({
        ...previous,
        _refresh: Date.now(),
      }));

      setWork("");

      await fetchWorkLogs();

      setMessage("Task added successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingWork(false);
    }
  };

  // --------------------------------------------------
  // EDIT WORK
  // --------------------------------------------------

  const openEditWork = (log) => {
    setEditingWork(log);
    setEditingPageName(log.pageName);
    setEditingWorkText(log.work);
    setError("");
    setMessage("");
  };

  const handleUpdateWork = async () => {
    if (!editingPageName.trim()) {
      setError("Page name is required");
      return;
    }

    if (!editingWorkText.trim()) {
      setError("Work is required");
      return;
    }

    try {
      setUpdatingWork(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/work-logs/${editingWork._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageName: editingPageName.trim(),
            work: editingWorkText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update work"
        );
      }

      setWorkLogs((previous) =>
        previous.map((log) =>
          log._id === data._id ? data : log
        )
      );

      setEditingWork(null);
      setEditingPageName("");
      setEditingWorkText("");

      setMessage("Work updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingWork(false);
    }
  };

  // --------------------------------------------------
  // DELETE WORK
  // --------------------------------------------------

  const handleDeleteWork = async (log) => {
    const confirmed = window.confirm(
      `Delete this work?\n\n${log.pageName} → ${log.work}`
    );

    if (!confirmed) {
      return;
    }

    try {
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

      setWorkLogs((previous) =>
        previous.filter(
          (item) => item._id !== log._id
        )
      );

      setMessage("Work deleted successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  // --------------------------------------------------
  // STATUS CHANGE
  // --------------------------------------------------

  const handleStatusChange = async (log) => {
    if (log.status === "Pushed") {
      setMessage(
        "This work is already Pushed. Status cannot be changed."
      );
      return;
    }

    const nextStatus = getNextStatus(log.status);

    if (!nextStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Change status?\n\n${log.status} → ${nextStatus}`
    );

    if (!confirmed) {
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
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      setWorkLogs((previous) =>
        previous.map((item) =>
          item._id === data._id ? data : item
        )
      );

      setMessage(`Status changed to ${nextStatus}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // --------------------------------------------------
  // UNIQUE PAGES
  // --------------------------------------------------

  const pages = useMemo(() => {
    const map = new Map();

    workLogs.forEach((log) => {
      if (!map.has(log.pageName)) {
        map.set(log.pageName, []);
      }

      map.get(log.pageName).push(log);
    });

    return Array.from(map.entries()).map(
      ([name, tasks]) => ({
        name,
        tasks,
      })
    );
  }, [workLogs]);

  // --------------------------------------------------
  // CLOSE MODALS
  // --------------------------------------------------

  const closeProjectModal = () => {
    setSelectedProject(null);
    setSelectedPage(null);
    setEditingWork(null);
    setMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-700/10 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-700/10 blur-[120px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}
        <header className="mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-lg font-black shadow-lg shadow-violet-900/30">
              R
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Recorder
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                Work Tracker
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-400">
              Workspace
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
              Projects
            </h2>

            <p className="mt-2 max-w-xl text-sm font-medium text-zinc-500">
              Manage your projects and track daily development work.
            </p>
          </div>
        </header>

        {/* GLOBAL MESSAGE */}
        {(message || error) && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-xs font-semibold ${
              error
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* CREATE PROJECT */}
        <section className="rounded-[26px] border border-violet-500/10 bg-[#0c0c11] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-400">
                New Project
              </p>

              <h3 className="mt-2 text-lg font-extrabold text-white">
                Create Project
              </h3>

              <p className="mt-1 text-xs font-medium text-zinc-500">
                Create a project before recording daily work.
              </p>
            </div>

            <form
              onSubmit={handleCreateProject}
              className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={projectName}
                onChange={(event) => {
                  setProjectName(event.target.value);
                  setError("");
                  setMessage("");
                }}
                placeholder="Enter project name"
                className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-[#08080b] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              />

              <button
                type="submit"
                disabled={creatingProject}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingProject ? "Creating..." : "+ Create"}
              </button>
            </form>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white">
                My Projects
              </h3>

              <p className="mt-1 text-xs font-medium text-zinc-500">
                View, edit and manage your projects.
              </p>
            </div>

            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold text-violet-300">
              {projects.length} Projects
            </span>
          </div>

          {loadingProjects ? (
            <div className="rounded-[26px] border border-zinc-800 bg-[#0c0c11] p-10 text-center">
              <p className="text-sm font-semibold text-zinc-500">
                Loading projects...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-zinc-800 bg-[#0c0c11] p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-400">
                +
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-white">
                No projects yet
              </h3>

              <p className="mt-1 text-xs font-medium text-zinc-500">
                Create your first project above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project._id}
                  className="group rounded-[26px] border border-zinc-800 bg-[#0c0c11] p-5 shadow-[0_15px_45px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_20px_55px_rgba(124,58,237,0.12)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-base font-black shadow-lg shadow-violet-900/20">
                      {project.projectName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[9px] font-bold text-violet-300">
                      PROJECT
                    </span>
                  </div>

                  <h3 className="mt-5 truncate text-base font-extrabold text-white">
                    {project.projectName}
                  </h3>

                  <p className="mt-1 text-[11px] font-medium text-zinc-600">
                    Created {formatCreatedDate(project.createdAt)}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleViewProject(project)
                      }
                      className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-2 py-2.5 text-[11px] font-bold text-violet-300 transition hover:bg-violet-500/20"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(project);
                        setEditingProjectName(
                          project.projectName
                        );
                        setError("");
                        setMessage("");
                      }}
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-2 py-2.5 text-[11px] font-bold text-zinc-300 transition hover:border-violet-500/30 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintProject(project)}
                      className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-2 py-2.5 text-[11px] font-bold text-violet-300 transition hover:bg-violet-500/20"
                    >
                      🖨️ Print
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteProject(project)
                      }
                      disabled={
                        deletingProject === project._id
                      }
                      className="rounded-xl border border-red-500/15 bg-red-500/5 px-2 py-2.5 text-[11px] font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingProject === project._id
                        ? "..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* =====================================================
          PROJECT VIEW MODAL
      ===================================================== */}

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-[1150px] flex-col overflow-hidden rounded-[28px] border border-violet-500/20 bg-[#09090d] shadow-[0_30px_100px_rgba(0,0,0,0.7)]">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-violet-400">
                  Project
                </p>

                <h2 className="mt-1 truncate text-lg font-extrabold text-white">
                  {selectedProject.projectName}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeProjectModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-violet-500/30 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-5 sm:px-6">

              {/* DATE */}
              <div className="rounded-2xl border border-zinc-800 bg-[#0d0d12] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-violet-400">
                      Work Date
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      {formatDate(selectedDate)}
                    </p>
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) =>
                      setSelectedDate(event.target.value)
                    }
                    className="rounded-xl border border-zinc-700 bg-[#08080b] px-3 py-2 text-xs font-semibold text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* ADD WORK */}
              <form
                onSubmit={handleAddWork}
                className="mt-4 rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4"
              >
                <div className="mb-3">
                  <p className="text-sm font-extrabold text-white">
                    Add Page / Work
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-zinc-500">
                    New work starts with Pending status.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-[0.8fr_1.7fr_auto]">
                  <input
                    type="text"
                    value={pageName}
                    onChange={(event) => {
                      setPageName(event.target.value);
                      setError("");
                    }}
                    placeholder="Page Name"
                    className="rounded-xl border border-zinc-800 bg-[#08080b] px-3.5 py-3 text-xs font-medium text-white outline-none focus:border-violet-500"
                  />

                  <input
                    type="text"
                    value={work}
                    onChange={(event) => {
                      setWork(event.target.value);
                      setError("");
                    }}
                    placeholder="Work / Task"
                    className="rounded-xl border border-zinc-800 bg-[#08080b] px-3.5 py-3 text-xs font-medium text-white outline-none focus:border-violet-500"
                  />

                  <button
                    type="submit"
                    disabled={addingWork}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-xs font-extrabold text-white transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-50"
                  >
                    {addingWork ? "Adding..." : "+ Add"}
                  </button>
                </div>
              </form>

              {/* WORK TITLE */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Work Entries
                  </h3>

                  <p className="mt-1 text-[10px] font-medium text-zinc-600">
                    Click a page name to view all its tasks.
                  </p>
                </div>

                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[9px] font-bold text-zinc-400">
                  {workLogs.length} Entries
                </span>
              </div>

              {/* WORK LIST */}
              <div className="mt-3">
                {loadingWork ? (
                  <div className="rounded-2xl border border-zinc-800 bg-[#0c0c11] p-10 text-center">
                    <p className="text-xs font-semibold text-zinc-500">
                      Loading work...
                    </p>
                  </div>
                ) : workLogs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#0c0c11] p-10 text-center">
                    <p className="text-sm font-bold text-zinc-400">
                      No work entries
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-600">
                      Add your first page and work above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workLogs.map((log) => {
                      const nextStatus = getNextStatus(
                        log.status
                      );

                      const isUpdating =
                        updatingStatus === log._id;

                      return (
                        <article
                          key={log._id}
                          className="rounded-2xl border border-zinc-800 bg-[#0c0c11] p-4 transition hover:border-violet-500/20"
                        >
                          {/* MAIN WORK */}
                          <div className="grid gap-4 xl:grid-cols-[0.7fr_1.2fr_auto] xl:items-center">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewPage(log)
                              }
                              className="min-w-0 text-left"
                            >
                              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-violet-400">
                                Page
                              </span>

                              <span className="mt-1 block truncate text-sm font-extrabold text-white underline decoration-violet-500/40 underline-offset-4 transition hover:text-violet-300">
                                {log.pageName}
                              </span>
                            </button>

                            <div className="min-w-0">
                              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                                Work
                              </span>

                              <p className="mt-1 break-words text-xs font-medium leading-5 text-zinc-300">
                                {log.work}
                              </p>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewPage(log)
                                }
                                className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-[10px] font-bold text-violet-300 hover:bg-violet-500/20"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditWork(log)
                                }
                                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-[10px] font-bold text-zinc-300 hover:text-white"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteWork(log)
                                }
                                className="rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2 text-[10px] font-bold text-red-400 hover:bg-red-500/10"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* STATUS */}
                          <div className="mt-4 border-t border-zinc-800 pt-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                                  Status
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${statusClass(
                                      log.status
                                    )}`}
                                  >
                                    {log.status}
                                  </span>

                                  {log.status === "Pushed" && (
                                    <span className="text-[9px] font-semibold text-violet-400">
                                      Locked
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {STATUSES.map(
                                  (status, index) => {
                                    const currentIndex =
                                      getStatusIndex(
                                        log.status
                                      );

                                    const reached =
                                      index <= currentIndex;

                                    const isCurrent =
                                      status === log.status;

                                    return (
                                      <button
                                        key={status}
                                        type="button"
                                        disabled={
                                          isUpdating ||
                                          log.status ===
                                            "Pushed" ||
                                          index !==
                                            currentIndex + 1
                                        }
                                        onClick={() =>
                                          handleStatusChange(
                                            log
                                          )
                                        }
                                        className={`rounded-lg border px-2.5 py-2 text-[9px] font-bold transition ${
                                          isCurrent
                                            ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                                            : reached
                                            ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
                                            : index ===
                                              currentIndex + 1
                                            ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-violet-500/40 hover:text-violet-300"
                                            : "cursor-not-allowed border-zinc-900 bg-zinc-950 text-zinc-700"
                                        }`}
                                      >
                                        {reached &&
                                        !isCurrent
                                          ? "✓ "
                                          : ""}
                                        {status}
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PROJECT EDIT MODAL
      ===================================================== */}

      {editingProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[26px] border border-violet-500/20 bg-[#0b0b10] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-400">
                  Project
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-white">
                  Edit Project
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400"
              >
                ×
              </button>
            </div>

            <input
              type="text"
              value={editingProjectName}
              onChange={(event) =>
                setEditingProjectName(event.target.value)
              }
              className="mt-5 w-full rounded-xl border border-zinc-800 bg-[#08080b] px-4 py-3 text-sm font-medium text-white outline-none focus:border-violet-500"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-bold text-zinc-400"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateProject}
                disabled={updatingProject}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-xs font-extrabold text-white disabled:opacity-50"
              >
                {updatingProject ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          WORK EDIT MODAL
      ===================================================== */}

      {editingWork && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[26px] border border-violet-500/20 bg-[#0b0b10] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-400">
                  Work
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-white">
                  Edit Work
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                value={editingPageName}
                onChange={(event) =>
                  setEditingPageName(event.target.value)
                }
                placeholder="Page Name"
                className="w-full rounded-xl border border-zinc-800 bg-[#08080b] px-4 py-3 text-sm font-medium text-white outline-none focus:border-violet-500"
              />

              <textarea
                value={editingWorkText}
                onChange={(event) =>
                  setEditingWorkText(event.target.value)
                }
                placeholder="Work"
                rows="4"
                className="w-full resize-none rounded-xl border border-zinc-800 bg-[#08080b] px-4 py-3 text-sm font-medium text-white outline-none focus:border-violet-500"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-bold text-zinc-400"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateWork}
                disabled={updatingWork}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-xs font-extrabold text-white disabled:opacity-50"
              >
                {updatingWork ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PAGE TASKS MODAL
      ===================================================== */}

      {selectedPage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-violet-500/20 bg-[#09090d] shadow-[0_30px_100px_rgba(0,0,0,0.8)]">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-violet-400">
                  Page Tasks
                </p>

                <h3 className="mt-1 truncate text-lg font-extrabold text-white">
                  {selectedPage.pageName}
                </h3>

                <p className="mt-1 text-[10px] text-zinc-600">
                  {formatDate(selectedDate)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPage(null)}
                className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto p-5">

              {/* ADD TASK */}
              <form
                onSubmit={handleAddTaskFromPage}
                className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4"
              >
                <p className="text-xs font-extrabold text-white">
                  Add Task
                </p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={work}
                    onChange={(event) => {
                      setWork(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter task"
                    className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-[#08080b] px-3.5 py-3 text-xs text-white outline-none focus:border-violet-500"
                  />

                  <button
                    type="submit"
                    disabled={addingWork}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-xs font-extrabold text-white disabled:opacity-50"
                  >
                    {addingWork ? "Adding..." : "+ Task"}
                  </button>
                </div>
              </form>

              {/* TASKS */}
              <div className="mt-5 space-y-2">
                {workLogs
                  .filter(
                    (log) =>
                      log.pageName ===
                      selectedPage.pageName
                  )
                  .map((log, index) => (
                    <div
                      key={log._id}
                      className="rounded-xl border border-zinc-800 bg-[#0c0c11] p-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-[10px] font-bold text-violet-400">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-xs font-semibold leading-5 text-zinc-300">
                            {log.work}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-[8px] font-bold ${statusClass(
                                log.status
                              )}`}
                            >
                              {log.status}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                openEditWork(log)
                              }
                              className="text-[9px] font-bold text-violet-400 hover:text-violet-300"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteWork(log)
                              }
                              className="text-[9px] font-bold text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {workLogs.filter(
                  (log) =>
                    log.pageName === selectedPage.pageName
                ).length === 0 && (
                  <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
                    <p className="text-xs font-semibold text-zinc-500">
                      No tasks for this page.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;