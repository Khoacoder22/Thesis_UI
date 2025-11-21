import { useEffect, useState } from "react";
import reportApi from "../axios/reportApi";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { 
  Users, Briefcase, Layers, Calendar, TrendingUp, 
   AlertCircle, CheckCircle2, XCircle, Loader2,
  BarChart3 
} from "lucide-react";

// --- CONFIGURATION ---
const STATUS_COLORS = {
  done: '#10b981',      
  cancelled: '#ef4444', 
  waiting: '#f59e0b',   
  serving: '#3b82f6',   
};
const DEFAULT_COLOR = '#94a3b8';

const DashboardPage = () => {
  // --- STATE ---
  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role;

  // Data State
  const [summary, setSummary] = useState(null);
  const [projectStats, setProjectStats] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topServices, setTopServices] = useState([]);
  
  //  STATE Peak Hours
  const [peakHoursData, setPeakHoursData] = useState([]); 
  //  STATE Giờ cao điểm nhất (để hiện KPI)
  const [busiestHour, setBusiestHour] = useState({ hour: "--:--", count: 0 });

  // Filter & UI State
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);
  const dayOptions = [7, 14, 30];

  // FETCH DATA 
  useEffect(() => {
    if (!role) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. LOAD KPI & TRAFFIC
        if (role === "superadmin") {
          const summaryRes = await reportApi.getSummary();
          setSummary(summaryRes.data.data);
          const statsRes = await reportApi.getAllProjectsStats(days);
          setProjectStats(statsRes.data.data || []);
        } else {
          const res = await reportApi.getCustomerByDays(days);
          const dailyStats = res.data.data || [];
          setProjectStats([{ 
            projectId: user.projectId || 0, 
            projectName: "Customer Traffic", 
            dailyStats 
          }]);
        }

        // 2. LOAD TICKET STATUS
        const statusRes = await reportApi.getTicketStatusDistribution(days);
        const rawStatusData = statusRes.data?.data || [];
        setStatusData(Array.isArray(rawStatusData) ? rawStatusData : []);

        // 3. LOAD TOP SERVICES
        const topSvcRes = await reportApi.getTopServices(days);
        const rawServices = topSvcRes.data?.data || [];
        
        if (Array.isArray(rawServices)) {
          const formattedServices = rawServices.map(svc => ({
            name: svc.name,
            count: svc.count,
            percent: Number(svc.percent) || 0 
          }));
          setTopServices(formattedServices);
        } else {
          setTopServices([]);
        }

        // 4.  LOAD PEAK HOURS (Đã sửa logic)
        const peakRes = await reportApi.getPeakHours(days);
        // Xử lý nhiều trường hợp response của axios
        const rawPeakData = peakRes.data?.data || peakRes.data || [];

        if (Array.isArray(rawPeakData) && rawPeakData.length > 0) {
          // Format đảm bảo count là số (quan trọng để Recharts vẽ đúng)
          const formattedPeakData = rawPeakData.map(item => ({
             hour: item.hour,
             count: parseInt(item.count, 10) || 0
          }));

          setPeakHoursData(formattedPeakData);
          
          // Tìm giờ có count lớn nhất
          const max = formattedPeakData.reduce((prev, current) => 
            (prev.count > current.count) ? prev : current
          );
          setBusiestHour(max);
        } else {
          setPeakHoursData([]);
          setBusiestHour({ hour: "N/A", count: 0 });
        }

      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
      }
      setLoading(false);
    };

    loadData();
  }, [role, days, user?.projectId]);

  // --- UI COMPONENTS ---
  
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-xl shadow-sm ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-slate-800">{value ?? 0}</h2>
        {trend && <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>}
      </div>
    </div>
  );

  const ChartHeader = ({ title, subtitle, icon: Icon }) => (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {Icon && <Icon size={20} className="text-indigo-500" />}
          {title}
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>
      </div>
    </div>
  );

  const CardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-3 w-24 bg-slate-200 rounded"></div>
        <div className="h-6 w-16 bg-slate-300 rounded"></div>
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  return (
      <div className="h-screen overflow-y-auto custom-scrollbar bg-slate-50 p-6 md:p-8 font-sans text-slate-800 w-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-indigo-600" /> Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Management your numbers.</p>
        </div>
        
        <div className={`flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-opacity ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
          {loading ? <Loader2 size={16} className="animate-spin text-indigo-600" /> : <Calendar size={16} className="text-slate-400" />}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm font-semibold text-indigo-600 bg-transparent border-none outline-none cursor-pointer hover:text-indigo-700"
          >
            {dayOptions.map((d) => <option key={d} value={d}>Last {d} Days</option>)}
          </select>
        </div>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {loading ? (
           <>
             <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
           </>
         ) : (
           <>
             {role === "superadmin" && summary ? (
                <>
                  <StatCard title="Total Users" value={summary.totalUsers} icon={Users} color="bg-indigo-500" />
                  <StatCard title="Total Projects" value={summary.totalProjects} icon={Briefcase} color="bg-emerald-500" />
                </>
             ) : (
                <>
                   <StatCard title="Customers Today" value={projectStats[0]?.dailyStats?.reduce((acc, cur) => acc + (Number(cur.totalCustomers) || 0), 0) || 0} icon={Users} color="bg-indigo-500" trend="Based on selection" />
                   {/*  KPI Card: Đã dùng dữ liệu busiestHour */}
                   <StatCard title="Busiest Hour" value={busiestHour.hour} icon={BarChart3} color="bg-orange-500" trend={`${busiestHour.count} visitors`} />
                </>
             )}
             <StatCard title="Completed" value={statusData.find(s => s.name === 'done')?.value || 0} icon={CheckCircle2} color="bg-blue-500" />
             <StatCard title="Cancelled" value={statusData.find(s => s.name === 'cancelled')?.value || 0} icon={XCircle} color="bg-rose-500" />
           </>
         )}
      </div>

      {/* ROW 2: TRAFFIC & STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* 2.1 TRAFFIC CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
          <ChartHeader title="Customer Traffic" subtitle="Total visitors over time" icon={TrendingUp} />
          <div className="h-[300px] w-full">
             {loading ? <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl"></div> : (
                <ResponsiveContainer>
                  <AreaChart data={projectStats[0]?.dailyStats || []}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="totalCustomers" stroke="#6366f1" strokeWidth={3} fill="url(#colorTraffic)" animationDuration={1500}/>
                  </AreaChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>

        {/* 2.2 STATUS CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn delay-75">
           <ChartHeader title="Ticket Status" subtitle="Distribution by outcome" icon={AlertCircle} />
           <div className="h-[300px] w-full relative">
              {loading ? <div className="w-full h-full bg-slate-50 animate-pulse rounded-full scale-75"></div> : (
                <>
                  <ResponsiveContainer>
                      <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={STATUS_COLORS[entry.name?.toLowerCase()] || DEFAULT_COLOR} 
                              />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                      <span className="text-3xl font-bold text-slate-800">
                        {statusData.reduce((a, b) => a + (Number(b.value) || 0), 0)}
                      </span>
                      <span className="text-xs text-slate-400 uppercase font-bold">Tickets</span>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>

      {/* ROW 3: PEAK HOURS & TOP SERVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* 3.1 PEAK HOURS CHART (Đã sửa: dùng peakHoursData và dataKey="count") */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn delay-100">
            <ChartHeader title="Peak Hours" subtitle="Busiest times of day" icon={BarChart3} />
            <div className="h-[250px]">
               {loading ? <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl"></div> : (
                 <ResponsiveContainer>
                    {/*  ĐÃ SỬA: Dùng data={peakHoursData} */}
                    <BarChart data={peakHoursData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                       <Tooltip 
                          cursor={{fill: '#f1f5f9'}} 
                          contentStyle={{ borderRadius: '8px' }}
                          formatter={(value) => [`${value} tickets`, 'Volume']} 
                       />
                       {/*  ĐÃ SỬA: Dùng dataKey="count" */}
                       <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1500} />
                    </BarChart>
                 </ResponsiveContainer>
               )}
            </div>
         </div>

         {/* 3.2 TOP SERVICES */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn delay-200">
            <ChartHeader title="Top Services" subtitle="By ticket volume" icon={Layers} />
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
               {loading ? (
                 [1,2,3].map(i => <div key={i} className="h-10 bg-slate-50 animate-pulse rounded-lg"></div>)
               ) : (
                 topServices.length > 0 ? (
                   topServices.map((svc, i) => (
                      <div key={i} className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-500">
                            #{i+1}
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between mb-1">
                               <span className="font-semibold text-sm text-slate-700 truncate max-w-[200px]">{svc.name}</span>
                               <span className="text-xs text-slate-500 font-medium">{svc.count} ({svc.percent}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${svc.percent}%` }}></div>
                            </div>
                         </div>
                      </div>
                   ))
                 ) : (
                   <p className="text-center text-slate-400 text-sm py-10">No service data available</p>
                 )
               )}
            </div>
         </div>
      </div>

    </div>
  );
};

export default DashboardPage; 



