import { useEffect, useState } from "react";
import userApi from "../axios/userAPI";
import { toast } from "react-toastify";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await userApi.getMe();
      setUser(res.data.data.user);
      setProject(res.data.data.project);

      if (res.data.data.project?.slug) {
        localStorage.setItem("projectSlug", res.data.data.project.slug);
      }
    } catch (err) {
        console.log("err" + err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="w-full flex justify-center pt-10 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg border p-8 space-y-6 text-center">

        <h1 className="text-3xl font-bold text-indigo-600">Profile</h1>

        {/* USER INFO */}
        <div className="space-y-3 text-left">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-semibold text-lg">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold text-lg">{user.email}</p>
          </div>

          {user.phone && (
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold text-lg">{user.phone}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
              {user.role}
            </span>
          </div>
        </div>

        {/* PROJECT INFO */}
        {project && (
          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500">Assigned Project</p>
            <p className="font-bold text-xl mt-1">{project.name}</p>
            <p className="text-gray-600 text-sm">{project.description}</p>

            {/* ✅ PHONE NUMBER FROM PROJECT (If available) */}
            {project.phone && (
              <p className="text-sm text-gray-700 mt-1">
                Contact: <span className="font-medium">{project.phone}</span>
              </p>
            )}

            {project.qr_code && (
                <div className="mt-5 flex flex-col items-center gap-3">
                    <img
                    src={project.qr_code}
                    alt="Project QR Code"
                    className="w-48 h-48 border rounded-xl shadow-md"
                    />

                    <button
                    onClick={() => {
                        const link = document.createElement("a");
                        link.href = project.qr_code;
                        link.download = `${project.name}_qrcode.png`;
                        link.click();
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Download 
                    </button>
                </div>
                )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
