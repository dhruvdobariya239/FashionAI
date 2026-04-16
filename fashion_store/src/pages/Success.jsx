import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";


const Success = () => {

    const { fetchCart } = useCart();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const saveOrder = async () => {
      try {
        const sessionId = params.get("session_id");
await api.post("/payment/success", { sessionId });

// 🔥 VERY IMPORTANT
await fetchCart();   // refresh cart from backend

navigate("/orders");
      } catch (err) {
        console.log(err);
        navigate("/");
      }
    };

    saveOrder();
  }, []);

  return <h2>Processing payment...</h2>;
};

export default Success;