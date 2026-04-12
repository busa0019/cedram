import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;