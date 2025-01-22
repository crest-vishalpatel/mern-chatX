import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { verifyToken } from "@/api/apiService";
import toast from "react-hot-toast";
import { useChat } from "@/contexts/ChatContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    dispatch,
    state: { isLoggedIn },
  } = useChat();
  const navigate = useNavigate();

  const authorize = async () => {
    try {
      const result = await verifyToken();
      if (result) {
        dispatch({ type: "LOGIN", payload: { userId: result.userId } });
      }
    } catch (error) {
      toast.error("Something went wrong");
      if (!isLoggedIn) navigate("/login");
    }
  };

  useEffect(() => {
    authorize();
  }, []);

  if (isLoggedIn) {
    return children;
  }
};

export default ProtectedRoute;
