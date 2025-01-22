import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Toaster } from "react-hot-toast";
import { ChatContextProvider } from "./contexts/ChatContext";
import ProtectedRoute from "./ui/ProtectedRoute";
import AppLayout from "./ui/AppLayout";
import Conversation from "./pages/chats/Conversation";
import DefaultChat from "./components/DefaultChat";

function App() {
  return (
    <ChatContextProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate replace to="chats" />} />
            <Route path="chats" element={<DefaultChat />} />
            <Route path="chats/:chatId" element={<Conversation />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-center" reverseOrder={false} />
    </ChatContextProvider>
  );
}

export default App;
