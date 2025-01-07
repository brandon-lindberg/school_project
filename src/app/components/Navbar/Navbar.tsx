import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            International Schools
          </Link>
          <div className="flex space-x-4">
            <Link href="/list" className="text-gray-700 hover:text-blue-600">
              Schools
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link href="/register" className="text-gray-700 hover:text-blue-600">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
