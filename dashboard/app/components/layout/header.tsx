import { Link } from "react-router";
import { FaShoppingBasket, FaBars } from "react-icons/fa";
import logo from "../../assets/logo.webp";

const isAuthenticated = true;

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm py-2">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Coffee Club Logo"
            className="w-16 h-16 object-contain"
          />
          <span
            className="text-2xl font-extrabold text-yellow-500 tracking-tight text-5xl md:text-3xl font-extrabold"
          >
            Coffee Club
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-8 ml-8">
          <Link to="/" className="font-semibold text-gray-800 hover:text-yellow-500 transition flex items-center gap-1">
            Home <span className="ml-1"></span>
          </Link>
          <Link to="/about" className="font-semibold text-gray-800 hover:text-yellow-500 transition flex items-center gap-1">
            About Us <span className="ml-1"></span>
          </Link>
          <Link to="/shop" className="font-semibold text-gray-800 hover:text-yellow-500 transition flex items-center gap-1">
            Shop <span className="ml-1"></span>
          </Link>
          <Link to="/contact" className="font-semibold text-gray-800 hover:text-yellow-500 transition">
            Contact
          </Link>
        </nav>

        {/* Cart, Contact Button, and Menu Icon */}
        <div className="flex items-center gap-4">
          <Link
            to="/contact"
            className="px-7 py-2 rounded bg-yellow-400 text-gray-900 font-bold text-lg shadow hover:bg-yellow-500 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </header>
  );
}