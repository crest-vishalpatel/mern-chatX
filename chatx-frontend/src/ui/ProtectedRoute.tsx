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
  const { userId, setUserId } = useChat();
  const navigate = useNavigate();

  const authorize = async () => {
    try {
      const result = await verifyToken();
      if (result) {
        setUserId(result.userId);
      }
    } catch (error) {
      toast.error("Something went wrong");
      if (!userId) navigate("/login");
    }
  };

  useEffect(() => {
    authorize();
  }, []);

  if (userId) {
    return children;
  }
};

export default ProtectedRoute;
