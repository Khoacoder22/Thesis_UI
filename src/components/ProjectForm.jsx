
const ProjectForm = ({
  showForm,
  editMode,
  formData,
  setFormData,
  onSave,
  onClose,
  onDelete,
}) => {
  if (!showForm) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 
                 animate-fadeIn backdrop-blur-sm"
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md transform animate-slideUp">
        <h3 className="text-xl font-bold text-indigo-600 mb-4 text-center">
          {editMode ? "Edit Project" : "Create Project"}
        </h3>

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              Cancel
            </button>

            {editMode && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Delete
              </button>
            )}

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
