import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import getCurrentUser from "./features/getCurrentUser";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserdata } from "./redux/userSlice";

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser();
      dispatch(setUserdata(data));
    };
    getUser();
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
