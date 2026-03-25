import { useAuthStore } from "../store/authStore";

const Home = () => {
  const { isAuthenticated, user } = useAuthStore();

  // 🔹 NOT LOGGED IN
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to <span className="text-blue-500">Clyraa</span> 🌍
        </h1>

        <p className="text-gray-600 max-w-2xl text-lg mb-8">
          Clyraa is your all-in-one travel platform where you can connect with
          people, join communities, plan trips, and share your journey with the world.
        </p>

        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Explore
          </button>
        </div>
      </div>
    );
  }

  // 🔹 LOGGED IN
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-3xl md:text-5xl font-bold mb-4">
        Welcome back, <span className="text-blue-500">{user?.name}</span> 👋
      </h1>

      <p className="text-gray-600 text-lg max-w-xl mb-6">
        Ready to explore new places, connect with travelers, and plan your next adventure?
      </p>

      <div className="flex gap-4">
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Home;