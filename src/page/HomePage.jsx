import Sidebar from "../components/Sidebar";

const HomePage = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="p-7 text-3xl font-semibold flex-1 h-screen">Home Page</div>
        </div>
    )
}

export default HomePage;