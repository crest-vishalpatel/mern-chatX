import React, { useState } from "react";
import { IUser } from "@/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";

interface Props {
  users: Array<IUser>;
  addUsers: (users: string[]) => void;
}

const MultiSelect: React.FC<Props> = ({ users, addUsers }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleSelect = (value: string) => {
    const updated = selectedUsers.includes(value)
      ? selectedUsers.filter((item) => item !== value)
      : [...selectedUsers, value];
    setSelectedUsers(updated);
    addUsers(updated);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex justify-start gap-2">
            {selectedUsers?.length
              ? selectedUsers.map((val, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-slate-200 px-2 py-1 text-xs font-medium"
                  >
                    {users.find((user) => user._id === val)?.firstName}
                  </div>
                ))
              : "Select users..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={() => toggleSelect(user._id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUsers.includes(user._id)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {user.firstName}&nbsp;{user.lastName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
