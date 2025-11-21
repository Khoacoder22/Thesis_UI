import { useEffect, useState } from "react";
import userApi from "../axios/userAPI";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Download, 
  QrCode, 
  ShieldCheck 
} from "lucide-react";

const Profile = () => {
  // --- GIỮ NGUYÊN LOGIC GỐC ---
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await userApi.getMe();
      setUser(res.data.data.user);
      setProject(res.data.data.project);

      if (res.data.data.project?.slug) {
        sessionStorage.setItem("projectSlug", res.data.data.project.slug);
      }
    } catch (err) {
      console.log("err" + err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // --- PHẦN UI ĐƯỢC THIẾT KẾ LẠI ---
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* HEADER / COVER AREA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 w-full relative">
           <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg">
                 <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User size={40} />
                 </div>
              </div>
           </div>
        </div>

        {/* USER INFO SECTION */}
        <div className="pt-16 pb-8 px-8">
           <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                 <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                       <ShieldCheck size={14} />
                       {user.role}
                    </span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail size={20} />
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                    <p className="text-gray-800 font-medium break-all">{user.email}</p>
                 </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                   <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <Phone size={20} />
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>
                      <p className="text-gray-800 font-medium">{user.phone}</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* PROJECT INFO SECTION */}
        {project && (
          <div className="border-t border-gray-200 bg-gray-50/50 p-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
               <Briefcase className="text-indigo-600" size={20} /> 
               Assigned Project
            </h3>

            <div className="flex flex-col md:flex-row gap-8">
               {/* Left: Text Info */}
               <div className="flex-1 space-y-4">
                  <div>
                     <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Building size={16} /> Project Name
                     </div>
                     <p className="text-xl font-bold text-gray-900">{project.name}</p>
                  </div>
                  
                  <div>
                     <p className="text-sm text-gray-500 mb-1">Description</p>
                     <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-200 text-sm leading-relaxed">
                        {project.description || "No description available."}
                     </p>
                  </div>

                  {project.phone && (
                     <div>
                        <p className="text-sm text-gray-500 mb-1">Contact Hotline</p>
                        <p className="font-medium text-gray-800">{project.phone}</p>
                     </div>
                  )}
               </div>

               {/* Right: QR Code Card */}
               {project.qr_code && (
                  <div className="md:w-72 flex-shrink-0">
                     <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        <div className="mb-2 flex items-center gap-2 text-gray-400 text-xs uppercase font-bold tracking-wider">
                           <QrCode size={14} /> Scan Access
                        </div>
                        
                        <div className="p-2 bg-white border-2 border-dashed border-gray-300 rounded-xl mb-4">
                           <img
                              src={project.qr_code}
                              alt="Project QR Code"
                              className="w-40 h-40 object-contain rounded-lg"
                           />
                        </div>

                        <button
                           onClick={() => {
                              const link = document.createElement("a");
                              link.href = project.qr_code;
                              link.download = `${project.name}_qrcode.png`;
                              link.click();
                           }}
                           className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200"
                        >
                           <Download size={18} />
                           Save QR Code
                        </button>
                     </div>
                  </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;