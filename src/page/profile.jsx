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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* ✅ HEADER COMPACT - Giảm height từ h-32 → h-24 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-24 w-full relative">
           <div className="absolute -bottom-10 left-6">
              {/* ✅ Avatar nhỏ hơn: w-20 h-20 thay vì w-24 h-24 */}
              <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-lg">
                 <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User size={32} />
                 </div>
              </div>
           </div>
        </div>

        {/* ✅ USER INFO COMPACT - Giảm padding từ pt-16 pb-8 px-8 → pt-14 pb-6 px-6 */}
        <div className="pt-14 pb-6 px-6">
           <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                 {/* ✅ Title nhỏ hơn: text-2xl thay vì text-3xl */}
                 <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                 <div className="flex items-center gap-2 mt-1">
                    {/* ✅ Badge nhỏ hơn: px-2.5 py-0.5, text-xs */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                       <ShieldCheck size={12} />
                       {user.role}
                    </span>
                 </div>
              </div>
           </div>

           {/* ✅ Info Cards Compact - Giảm gap từ gap-6 → gap-4, mt-8 → mt-6 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* ✅ Card padding nhỏ hơn: p-3 thay vì p-4 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                 {/* ✅ Icon container nhỏ hơn: p-1.5, size 18 */}
                 <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail size={18} />
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Email Address</p>
                    <p className="text-sm text-gray-800 font-medium break-all">{user.email}</p>
                 </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                   <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                      <Phone size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Phone Number</p>
                      <p className="text-sm text-gray-800 font-medium">{user.phone}</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* ✅ PROJECT INFO COMPACT - Giảm padding từ p-8 → p-6 */}
        {project && (
          <div className="border-t border-gray-200 bg-gray-50/50 p-6">
            {/* ✅ Title nhỏ hơn: text-base, mb-5, size 18 */}
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
               <Briefcase className="text-indigo-600" size={18} /> 
               Assigned Project
            </h3>

            {/* ✅ Giảm gap từ gap-8 → gap-6 */}
            <div className="flex flex-col md:flex-row gap-6">
               {/* Left: Text Info */}
               <div className="flex-1 space-y-3">
                  <div>
                     {/* ✅ Label nhỏ hơn: text-xs, size 14 */}
                     <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                        <Building size={14} /> Project Name
                     </div>
                     {/* ✅ Name nhỏ hơn: text-lg thay vì text-xl */}
                     <p className="text-lg font-bold text-gray-900">{project.name}</p>
                  </div>
                  
                  <div>
                     <p className="text-xs text-gray-500 mb-1">Description</p>
                     {/* ✅ Description box nhỏ hơn: p-2.5, text-xs */}
                     <p className="text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200 text-xs leading-relaxed">
                        {project.description || "No description available."}
                     </p>
                  </div>

                  {project.phone && (
                     <div>
                        <p className="text-xs text-gray-500 mb-1">Contact Hotline</p>
                        <p className="font-medium text-sm text-gray-800">{project.phone}</p>
                     </div>
                  )}
               </div>

               {/* ✅ QR Code Card COMPACT - Giảm width từ md:w-72 → md:w-60 */}
               {project.qr_code && (
                  <div className="md:w-60 flex-shrink-0">
                     {/* ✅ QR card padding nhỏ hơn: p-3 thay vì p-4 */}
                     <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                        {/* ✅ Label nhỏ hơn: text-[10px], size 12 */}
                        <div className="mb-2 flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                           <QrCode size={12} /> Scan Access
                        </div>
                        
                        {/* ✅ QR wrapper padding nhỏ hơn: p-1.5 */}
                        <div className="p-1.5 bg-white border-2 border-dashed border-gray-300 rounded-lg mb-3">
                           {/* ✅ QR image nhỏ hơn: w-32 h-32 thay vì w-40 h-40 */}
                           <img
                              src={project.qr_code}
                              alt="Project QR Code"
                              className="w-32 h-32 object-contain rounded-lg"
                           />
                        </div>

                        {/* ✅ Button nhỏ hơn: py-2, text-sm, size 16 */}
                        <button
                           onClick={() => {
                              const link = document.createElement("a");
                              link.href = project.qr_code;
                              link.download = `${project.name}_qrcode.png`;
                              link.click();
                           }}
                           className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200 text-sm"
                        >
                           <Download size={16} />
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