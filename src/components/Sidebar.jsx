import {useState, useEffect} from "react";

const Sidebar = () => {
    const [open, setOpen] = useState(true);

    // For Super Admin  
    const Menus = [
        {title: "Dashboard", src: "Chart_fill"},
        {title: "Projects", src: "User", gap: true},
        {title: "User", src: "Chat"},
    ]

    return (
        <div className="flex">
            <div className={`${open ? "w-72" : "w-20"} bg-dark-purple h-screen p-5 p-8 relative duration-300`}>
            <img
            src="../assets/logo.png"
            className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple border-2 rounded-full ${!open && "rotate-180"}`}
            onClick={() => setOpen(!open)}/>

            </div>
        </div>
    )   
}

export default Sidebar;