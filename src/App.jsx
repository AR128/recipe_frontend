import { Link, Outlet } from "react-router";

function App() {
  return (
    <div>
      <div>Welcome</div>
      <Link to="/login">Login</Link>
      <Link to="/signup">Sign Up</Link>
      <section className="w-full">
        <Outlet />
      </section>
    </div>
  );
}

export default App;
