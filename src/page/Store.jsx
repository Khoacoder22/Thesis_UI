import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const Store = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("");
  const { slug } = useParams();
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      if (!slug) {
        alert("Store information not found!");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/projects/${slug}`);
      setServices(response.data.data.services || []);
      setProjectName(response.data.data.project?.name || "Store");
    } catch (error) {
      console.error("Error fetching services:", error);
      alert("Unable to load store information!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service) => {
    navigate(`/services/${service.id}`, {
      state: { serviceName: service.name },
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[100dvh] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading Store...</p>
        </div>
      </div>
    );

  return (
    // THAY ĐỔI 1: Sử dụng h-[100dvh] để cố định chiều cao bằng màn hình thiết bị
    // overflow-y-auto: Cho phép cuộn nội dung bên trong div này
    <div className="h-[100dvh] bg-gray-50 w-full font-sans overflow-y-auto scroll-smooth">
      
      {/* THAY ĐỔI 2: Thêm pb-24 (padding bottom) để item cuối cùng không bị sát đáy màn hình */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 pb-24">
        
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-down">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-800">
            Welcome to <span className="text-blue-600">{projectName}</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-md sm:text-lg text-gray-500">
            Select a service to get your ticket instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {services.length === 0 ? (
            <div className="md:col-span-2 text-center py-16 px-4 bg-white rounded-2xl shadow-sm animate-fade-in-up">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 21.75h4.5m-4.5 0a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 017.5 3h5.25l4.5 4.5v11.25a2.25 2.25 0 01-2.25 2.25h-4.5z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Services Available</h3>
              <p className="mt-1 text-sm text-gray-500">We are not offering any services at the moment.</p>
            </div>
          ) : (
            services.map((service, index) => (
              <div
                key={service.id}
                onClick={() => handleSelectService(service)}
                className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                        {service.name}
                      </h2>
                      <p className="mt-2 text-sm sm:text-base text-gray-500 line-clamp-2">{service.description}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-300">
                        <svg
                          className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-hover:text-blue-600 transition-colors duration-300"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Store;