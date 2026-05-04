"use client";

import React, { useState, useMemo } from "react";
import { AdminUser, AdminRole } from "@/src/libs/serverFetch/adminFetch";
import {
  manageUserAction,
  createUserAction,
  changeUserRoleAction,
} from "@/src/libs/serverAction/adminAction";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Input,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  PencilSimple,
  Trash,
  MagnifyingGlass,
  Shield,
  CalendarBlank,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  initialUsers: AdminUser[];
  roles: AdminRole[];
}

export default function UsersView({ initialUsers, roles }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteChange,
  } = useDisclosure();

  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    role: "VIP-0",
    status: true,
  });

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, users]);

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({
      full_name: "",
      username: "",
      email: "",
      password: "",
      role: "VIP-0",
      status: true,
    });
    onOpen();
  };

  const handleOpenEdit = (user: AdminUser) => {
    setModalMode("edit");
    setEditingUserId(user.user_id);
    setFormData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      password: "", // Left blank since admin editing doesn't require resetting password usually unless specified, but backend changeUserRoleByAdmin only changes role for now.
      role: user.vip_level,
      status: user.status,
    });
    onOpen();
  };

  const handleOpenDelete = (user: AdminUser) => {
    setDeletingUser(user);
    onDeleteOpen();
  };

  const handleSubmit = async (onClose: () => void) => {
    if (modalMode === "add") {
      const res = await createUserAction({
        ...formData,
        is_active: formData.status,
      });
      if (res.success) {
        toast.success(res.message);
        router.refresh(); // Just refresh the page to get all new data
        onClose();
      } else {
        toast.error(res.message);
      }
    } else if (modalMode === "edit" && editingUserId) {
      const resRole = await changeUserRoleAction(editingUserId, formData.role);

      const targetUser = users.find((u) => u.user_id === editingUserId);
      if (targetUser && targetUser.status !== formData.status) {
        await manageUserAction(
          editingUserId,
          formData.status ? "active" : "ban",
        );
      }

      if (resRole.success) {
        toast.success("User updated successfully");
        setUsers(
          users.map((u) =>
            u.user_id === editingUserId
              ? { ...u, vip_level: formData.role, status: formData.status }
              : u,
          ),
        );
        router.refresh();
        onClose();
      } else {
        toast.error(resRole.message);
      }
    }
  };

  const handleAction = async (
    userId: string,
    action: "ban" | "active" | "delete",
  ) => {
    const res = await manageUserAction(userId, action);
    if (res.success) {
      toast.success(res.message);
      if (action === "delete") {
        setUsers(users.filter((u) => u.user_id !== userId));
      } else {
        setUsers(
          users.map((u) =>
            u.user_id === userId ? { ...u, status: action === "active" } : u,
          ),
        );
      }
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  const roleOptions = roles.map(r => ({ label: r.name, value: r.name }));

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-default-500 text-sm mt-1">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      {/* Stats row can be injected here similarly if needed, passing static info */}

      <div className="flex justify-between items-center mb-4 gap-4">
        <Input
          className="w-full sm:max-w-[400px]"
          placeholder="Search users by name, username, or email..."
          startContent={<MagnifyingGlass className="text-default-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="faded"
          radius="md"
        />
        <Button
          className="bg-black text-white font-medium"
          onPress={handleOpenAdd}
        >
          + Add User
        </Button>
      </div>

      <Table
        aria-label="Users management table"
        shadow="sm"
        className="border border-default-200 rounded-xl"
        classNames={{
          wrapper: "p-0 rounded-xl overflow-hidden shadow-none border-none",
        }}
      >
        <TableHeader>
          <TableColumn className="uppercase text-xs font-bold text-default-500 bg-default-50 px-6 py-4">
            User
          </TableColumn>
          <TableColumn className="uppercase text-xs font-bold text-default-500 bg-default-50 py-4">
            Email
          </TableColumn>
          <TableColumn className="uppercase text-xs font-bold text-default-500 bg-default-50 py-4">
            Role
          </TableColumn>
          <TableColumn className="uppercase text-xs font-bold text-default-500 bg-default-50 py-4">
            Status
          </TableColumn>
          <TableColumn className="uppercase text-xs font-bold text-default-500 bg-default-50 py-4">
            Join Date
          </TableColumn>
          <TableColumn
            align="center"
            className="uppercase text-xs font-bold text-default-500 bg-default-50 py-4"
          >
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody items={filteredUsers} emptyContent="No users found">
          {(user) => (
            <TableRow
              key={user.user_id}
              className="border-b border-default-100 last:border-b-0 hover:bg-default-50/50 transition-colors"
            >
              <TableCell className="px-6 py-4">
                <div className="flex gap-4 items-center">
                  <Avatar
                    src={
                      user.avatar_url?.startsWith("http")
                        ? user.avatar_url
                        : `https://i.pravatar.cc/150?u=${user.user_id}`
                    }
                    size="md"
                    className="shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground">
                      {user.full_name}
                    </span>
                    <span className="text-xs text-default-400">
                      @{user.username}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-default-600 text-sm">
                  <EnvelopeSimple className="text-default-400" />
                  {user.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-default-600 text-sm capitalize">
                  <Shield
                    size={16}
                    className={
                      user.vip_level === "Admin"
                        ? "text-primary"
                        : "text-default-400"
                    }
                  />
                  {user.vip_level === "VIP-0" ? "User" : user.vip_level}
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  className={
                    user.status
                      ? "bg-black text-white px-2 border-none"
                      : "bg-default-200 text-default-600 px-2 border-none"
                  }
                >
                  {user.status ? "active" : "inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-default-500 text-sm">
                  <CalendarBlank />
                  {user.created_at
                    ? new Date(user.created_at).toISOString().split("T")[0]
                    : "N/A"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center items-center gap-2">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => handleOpenEdit(user)}
                  >
                    <PencilSimple size={18} className="text-blue-500" />
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => handleOpenDelete(user)}
                  >
                    <Trash size={18} className="text-rose-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Add / Edit User Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">
                  {modalMode === "add" ? "Add New User" : "Edit User Role"}
                </h3>
                <p className="text-sm text-default-500 font-normal">
                  {modalMode === "add"
                    ? "Create a new user account with the details below."
                    : "Modify the user's role."}
                </p>
              </ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  isDisabled={modalMode === "edit"}
                  variant="faded"
                  labelPlacement="outside"
                />
                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  isDisabled={modalMode === "edit"}
                  variant="faded"
                  labelPlacement="outside"
                />
                <Input
                  label="Email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  isDisabled={modalMode === "edit"}
                  variant="faded"
                  labelPlacement="outside"
                />
                {modalMode === "add" && (
                  <Input
                    label="Password"
                    placeholder="Enter short password..."
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    variant="faded"
                    labelPlacement="outside"
                  />
                )}

                <Select
                  label="Role"
                  placeholder="Select a role"
                  selectedKeys={[formData.role]}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  variant="faded"
                  labelPlacement="outside"
                >
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={[formData.status ? "true" : "false"]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value === "true",
                    })
                  }
                  variant="faded"
                  labelPlacement="outside"
                >
                  <SelectItem key="true" value="true">
                    Active
                  </SelectItem>
                  <SelectItem key="false" value="false">
                    Inactive
                  </SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="bordered"
                  onPress={onClose}
                  className="font-medium"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-black text-white font-medium"
                  onPress={() => handleSubmit(onClose)}
                >
                  {modalMode === "add" ? "Add User" : "Save Changes"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete User Alert Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Delete User</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">
                  Are you sure you want to delete{" "}
                  <span className="font-bold">{deletingUser?.full_name}</span>?
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="bordered"
                  onPress={onClose}
                  className="font-medium"
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  className="font-medium"
                  onPress={() => {
                    if (deletingUser)
                      handleAction(deletingUser.user_id, "delete");
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
