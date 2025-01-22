import * as React from "react";
import { HiEllipsisVertical, HiChatBubbleLeft, HiMoon } from "react-icons/hi2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import {
  createConversation,
  getAllUsers,
  getUsers,
  logout,
} from "@/api/apiService";
import { IUser } from "@/types";
import { useChat } from "@/contexts/ChatContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router";
import { Checkbox } from "./ui/checkbox";
import MultiSelect from "./Multiselect";
import { Input } from "./ui/input";

const Header: React.FC = () => {
  const { dispatch, socket } = useChat();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [users, setUsers] = React.useState<Array<IUser>>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [isGroup, setIsGroup] = React.useState<boolean>(false);
  const [groupName, setGroupName] = React.useState<string>("");
  const [allUsers, setAllUsers] = React.useState<Array<IUser>>([]);

  const fetchUsers = async () => {
    try {
      const [result1, result2] = await Promise.all([getUsers(), getAllUsers()]);
      setUsers(result1.users);
      setAllUsers(result2.users);
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  const handleNewChat = async () => {
    if (selectedUsers.length === 0) return;
    try {
      const { result } = await createConversation({
        participants: selectedUsers,
        groupName,
        isGroup,
      });
      socket?.emit("create_conversation", {
        receiverId: selectedUsers,
        conversationId: result._id,
      });
      dispatch({
        type: "NEW_CHAT",
        payload: { chat: { ...result, userDetails: result.participants } },
      });
      navigate(`/chats/${result._id}`);
    } catch (error) {
      toast.error("Something went wrong");
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      socket?.disconnect();
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleUsers = (selectedUsers: string[]) => {
    setSelectedUsers(selectedUsers);
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  return (
    <header className="flex justify-between border-b p-2">
      <img
        src="profile.jpg"
        alt=""
        className="block h-12 w-12 cursor-pointer rounded-full"
      />
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost">
          <HiMoon size={20} />
        </Button>
        <Button variant="ghost" onClick={() => setIsOpen(true)}>
          <HiChatBubbleLeft size={20} />
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New conversation</DialogTitle>
              <DialogDescription>
                Select contact to start new conversation
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="group"
                checked={isGroup}
                onCheckedChange={() => setIsGroup((prev) => !prev)}
              />
              <label
                htmlFor="group"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                New Group
              </label>
            </div>
            {isGroup ? (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <MultiSelect users={allUsers} addUsers={handleUsers} />
              </div>
            ) : (
              <Select
                value={selectedUsers[0]}
                onValueChange={(value) => setSelectedUsers([value])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem value={user._id} key={user._id}>
                      {user.firstName}&nbsp;{user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <DialogFooter>
              <Button type="button" onClick={handleNewChat}>
                Start
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <HiEllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
