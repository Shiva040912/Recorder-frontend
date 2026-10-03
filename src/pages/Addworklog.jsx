const AddWorkLog = () => {
  return (
    <div className="min-h-screen bg-[#f6f5ff] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button className="mb-4 text-sm font-bold text-indigo-600 transition hover:text-indigo-800">
            ← Back
          </button>

          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">
            Work Log
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-900 sm:text-3xl">
            Add Work Log
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-400">
            Record what you worked on and keep your development history
            organized.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-indigo-100/80 bg-white p-5 shadow-[0_10px_35px_rgba(79,70,229,0.06)] sm:p-7 lg:p-8">
          <form className="space-y-6">
            {/* Project Section */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Project Details
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Tell us which project you worked on.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Project Name */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Project Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Recorder"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Website */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Website URL
                  <span className="ml-1 font-medium text-slate-400">
                    (Optional)
                  </span>
                </label>

                <input
                  type="url"
                  placeholder="https://example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="h-px bg-indigo-50" />

            {/* Work Details */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Work Details
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Describe what you worked on.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Date */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Work Date
                </label>

                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Status
                </label>

                <select
                  defaultValue="In Progress"
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-600">
                Work Title
              </label>

              <input
                type="text"
                placeholder="e.g. Implemented work log CRUD APIs"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-600">
                Description
              </label>

              <textarea
                rows="4"
                placeholder="Describe what you did, what you changed, or what you completed..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Time + Notes */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Time Spent
                </label>

                <input
                  type="text"
                  placeholder="e.g. 2 hours 30 minutes"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Notes
                  <span className="ml-1 font-medium text-slate-400">
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Any additional notes"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-indigo-50 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-200"
              >
                Save Work Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWorkLog;