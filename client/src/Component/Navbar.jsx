import { Fragment, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MdOutlineDashboard, MdSettings, MdPerson, MdLogout } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";
import userImg from "/images/user.png";
import logo from "/images/greenbook.png";
import ItemMenu from "./ItemMenu";
import {appLogo} from '../assets/appConfig'

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const user = useSelector((state) => state.auth);
  const { userName, lastLoggedIn } = user;

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      dispatch(setLogout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const openMenu = () => setIsOpenMenu(true);
  const closeMenu = () => setIsOpenMenu(false);

  return (
    <Disclosure as="nav" className="fixed top-0 inset-x-0 border-b border-gray-300 bg-white shadow-md z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <img
              className="h-10 w-auto md:h-12 lg:h-14 hover:cursor-pointer"
              src={appLogo}
              alt="Green Book Logo"
              onClick={() => navigate("/dashboard")}
            />
          </div>
          {/* Navigation Items */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-4">{/* Add navigation items here if needed */}</div>
          {/* User Menu */}
          <div className="flex items-center pr-2 sm:ml-6 sm:pr-0">
            <div>
              <MdOutlineDashboard className="text-2xl md:text-3xl text-black cursor-pointer" onClick={openMenu} />
            </div>
            {/* Display ItemMenu when isOpenMenu is true */}
            {isOpenMenu && <ItemMenu closeModal={closeMenu} />}
            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button className="flex items-center rounded-full text-sm focus:outline-none">
                  <span className="sr-only">Open user menu</span>
                  <img className="h-8 w-8 rounded-full" src={userImg} alt="User" />
                  <div className="hidden sm:ml-2 sm:flex sm:flex-col sm:justify-start items-start text-black font-medium">
                    <p className="text-xs md:text-sm lg:text-md">{userName}</p>
                    <p className="text-xs text-gray-500">Login at {new Date(lastLoggedIn).toLocaleTimeString()}</p>
                  </div>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        onClick={() => navigate('/profile')}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "px-4 py-2 text-sm text-gray-700 flex items-center cursor-pointer"
                        )}
                      >
                        <MdPerson className="mr-2" />
                        Your Profile
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                      onClick={() => navigate('/settings')}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "px-4 py-2 text-sm text-gray-700 flex items-center cursor-pointer"
                        )}
                      >
                        <MdSettings className="mr-2" />
                        Settings
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        onClick={handleLogout}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "px-4 py-2 text-sm text-gray-700 flex items-center"
                        )}
                      >
                        <MdLogout className="mr-2" />
                        Log Out
                      </a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
