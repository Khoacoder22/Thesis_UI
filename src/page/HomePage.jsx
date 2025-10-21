import Sidebar from "../components/Sidebar";
import ProjectPage from "../page/ProjectPage";

const HomePage = () => {
  return (
    <div className="flex">
      <Sidebar />
      <ProjectPage />
    </div>
  );
};

export default HomePage;
