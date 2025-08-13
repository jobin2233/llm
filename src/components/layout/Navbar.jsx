import { Link } from "react-router-dom";
import { HomeIcon, UserCircleIcon, ClipboardDocumentListIcon, DocumentTextIcon, SparklesIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { signOutUser } from "../../services/firebase";

const Navbar = ({ user }) => {
  const handleLogout = async () => {
    try {
      const result = await signOutUser();
      if (!result.success) {
        console.error("Error signing out:", result.error);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="glass-medium sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-elegant group-hover:shadow-luxury transition-all duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-indigo-400/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="heading-professional text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-purple-500 group-hover:to-indigo-500 transition-all duration-300">
            SynthesisAI
          </span>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-6">
          <Link to="/" className="nav-link group">
            <div className="flex flex-col items-center p-3 rounded-xl text-crystal hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
              <HomeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium hidden md:block">Home</span>
            </div>
          </Link>

          <Link to="/medication-report" className="nav-link group">
            <div className="flex flex-col items-center p-3 rounded-xl text-crystal hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
              <ClipboardDocumentListIcon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium hidden md:block">Medications</span>
            </div>
          </Link>

          <Link to="/user-report" className="nav-link group">
            <div className="flex flex-col items-center p-3 rounded-xl text-crystal hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
              <DocumentTextIcon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium hidden md:block">Reports</span>
            </div>
          </Link>

          <Link to="/recommendations" className="nav-link group">
            <div className="flex flex-col items-center p-3 rounded-xl text-crystal hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
              <SparklesIcon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium hidden md:block">Recommendations</span>
            </div>
          </Link>

          <Link to="/nearby-clinics" className="nav-link group">
            <div className="flex flex-col items-center p-3 rounded-xl text-crystal hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
              <MapPinIcon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium hidden md:block">Clinics</span>
            </div>
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="nav-link group">
                <div className="flex flex-col items-center p-3 rounded-xl text-crystal hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                  <UserCircleIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium hidden md:block">Profile</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="ml-4 px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent shadow-elegant hover:shadow-luxury transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <button className="ml-4 btn-glass bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30">
              <Link to="/auth" className="text-crystal font-semibold">
                Login / Sign Up
              </Link>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
