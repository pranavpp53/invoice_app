import { useEffect } from "react";
import {
  FaUsers,
  FaUserShield,
  FaUserCircle,
  FaFileInvoiceDollar,
  FaFolderOpen,
  FaBook
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ItemMenu({ closeModal }) {
  const navigate = useNavigate();

  const userRole = useSelector((state) => state.auth.userRole);
  const permissions = useSelector((state) => state.auth.permissions);

  const items = [
    {
      icon: <FaUserShield />,
      title: "User Roles",
      style: "bg-purple",
      path: "/user_roles",
      permissionKey: "roles.view",
    },
    {
      icon: <FaUsers />,
      title: "Sub Users",
      style: "bg-blue",
      path: "/subuser",
      permissionKey: "subUser.view",
    },
    {
      icon: <FaUserCircle />,
      title: "Customers",
      style: "bg-green",
      path: "/customers",
      permissionKey: "customers.view",
    },
    {
      icon: <FaFolderOpen />,  
      title: "Documents",
      style: "bg-cyan",  
      path: "/documents",
      permissionKey: "documents.view",
    },
    {
      icon: <FaBook />,  
      title: "Ledger",
      style: "bg-teal text-white",  
      path: "/ledger",
      permissionKey: "ledger.view",
    }
  ];

  const handleCardClick = (path) => {
    closeModal();
    navigate(path);
  };

  const filteredItems =
    userRole === "admin"
      ? items
      : items.filter((item) => {
          const keys = item.permissionKey?.split(".");
          return (
            permissions && permissions[keys[0]] && permissions[keys[0]][keys[1]]
          );
        });

  useEffect(() => {
    const modal = document.getElementById("item-menu-modal");
    if (modal) {
      modal.classList.add("animate-open-menu");
    }
  }, []);

  return (
    <>
      {/* Inline styles for keyframes */}
      <style>
        {`
          @keyframes openMenu {
            0% {
              transform: scale(0.9);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      <div
        className="fixed inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out z-40"
        onClick={closeModal}
      ></div>

      <div
        id="item-menu-modal"
        className="fixed inset-0 flex items-center justify-center z-50 transition-transform transform scale-90 sm:scale-95 md:scale-100"
        style={{ animation: "openMenu 0.3s ease-in-out forwards" }}
        onClick={closeModal}
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full md:max-w-2xl animate-fadeIn scale-105 duration-500 ease-in-out">
          {/* Modal body with animated grid layout */}
          <div className="p-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div
              className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105 bg-yellow`}
              onClick={() => handleCardClick("/dashboard")}
            >
              <div className="text-white text-3xl mb-2">
                <MdDashboard />
              </div>
              <div className="text-white font-semibold text-center text-sm md:text-base">
                Dashboard
              </div>
            </div>
            {filteredItems.map((card, index) => (
              <div
                key={index}
                className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105 ${card.style}`}
                onClick={() => handleCardClick(card.path)}
              >
                <div className="text-white text-3xl mb-2">{card.icon}</div>
                <div className="text-white font-semibold text-center text-sm md:text-base">
                  {card.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ItemMenu;
