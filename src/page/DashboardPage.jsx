import React, { useEffect, useState } from "react";
import reportApi from "../axios/reportApi";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [projectStats, setProjectStats] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchProjectStats();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await reportApi.getSummary();
      setSummary(res.data.data || {});
    } catch (error) {
      console.log("SUMMARY ERROR:", error);
    }
  };

  const fetchProjectStats = async () => {
    try {
      const res = await reportApi.getProjectCustomerStats();
      setProjectStats(res.data.data || []);
    } catch (error) {
      console.log("PROJECT STATS ERROR:", error);
    }
  };

  return (
<div className="p-4 space-y-4">
  <h1 className="text-2xl font-semibold mb-2">Dashboard Overview</h1>

  {summary && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        { label: "Total Users", value: summary.totalUsers },
        { label: "Total Projects", value: summary.totalProjects },
        { label: "Total Services", value: summary.totalServices },
      ].map((item, i) => (
        <div key={i} className="bg-white p-3 shadow rounded-md">
          <p className="text-gray-500 text-sm">{item.label}</p>
          <h2 className="text-xl font-semibold">{item.value ?? 0}</h2>
        </div>
      ))}
    </div>
  )}

  <div className="space-y-4">
    {Array.isArray(projectStats) && projectStats.length > 0 ? (
      projectStats.map((project) => (
        <div key={project.projectId} className="bg-white p-3 shadow rounded-md">
          <h3 className="text-lg font-medium mb-2">{project.projectName}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={project.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="totalCustomers" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center text-sm">No data available.</p>
    )}
  </div>
</div>
  );
};

export default DashboardPage;
