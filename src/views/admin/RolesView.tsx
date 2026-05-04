"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  CheckboxGroup,
  Checkbox,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminRole } from "@/src/libs/serverFetch/adminFetch";
import {
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from "@/src/libs/serverAction/adminAction";

export const PERMISSIONS_LIST = [
  { value: "manage_users", label: "Quản lý tài khoản User (Admin)" },
  { value: "manage_roles", label: "Quản lý hệ thống Role (Admin)" },
  { value: "view_payment_history", label: "Xem lịch sử giao dịch (Admin)" },
  { value: "manage_alerts", label: "Tạo & Quản lý cảnh báo giá (User)" },
  { value: "manage_indicators", label: "Sử dụng chỉ báo nâng cao (User)" },
  { value: "view_vip_kline", label: "Xem biểu đồ giá VIP (User)" },
];

export default function RolesView({
  initialRoles,
}: {
  initialRoles: AdminRole[];
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    permissions: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const handleOpenEdit = (role: AdminRole) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      price: role.price,
      description: role.description,
      permissions: role.permissions || [],
    });
    onOpen();
  };

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setFormData({
      name: "",
      price: 0,
      description: "",
      permissions: [],
    });
    onOpen();
  };

  const onSubmit = async () => {
    if (!formData.name) {
      toast.error("Role name is required");
      return;
    }
    setLoading(true);
    let res;
    if (selectedRole) {
      res = await updateRoleAction(selectedRole._id, formData);
    } else {
      res = await createRoleAction(formData);
    }

    if (res.success) {
      toast.success(res.message);
      // Wait for next/cache revalidation
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    setLoading(true);
    const res = await deleteRoleAction(id);
    if (res.success) {
      toast.success(res.message);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <Button color="primary" onPress={handleOpenCreate}>
          Create New Role
        </Button>
      </div>

      <Table aria-label="Roles table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>PERMISSIONS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {initialRoles.map((role) => (
            <TableRow key={role._id}>
              <TableCell className="font-semibold">{role.name}</TableCell>
              <TableCell>{role.price.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.map((p) => {
                    const label = PERMISSIONS_LIST.find((perm) => perm.value === p)?.label || p;
                    return (
                      <span
                        key={p}
                        className="px-2 py-1 bg-slate-100 rounded-md text-xs"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" onPress={() => handleOpenEdit(role)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onPress={() => handleDelete(role._id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedRole ? "Edit Role" : "Create Role"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Role Name"
                  placeholder="e.g. VIP-1"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  isDisabled={!!selectedRole} // Usually name shouldn't change easily, or if it does, it might break user refs. Let's disable for safety or let them change. Let's allow changing.
                />
                <Input
                  label="Price"
                  type="number"
                  placeholder="0"
                  value={formData.price.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
                <Input
                  label="Description"
                  placeholder="Short description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <CheckboxGroup
                  label="Permissions"
                  value={formData.permissions}
                  onChange={(val) =>
                    setFormData({ ...formData, permissions: val as string[] })
                  }
                >
                  {PERMISSIONS_LIST.map((p) => (
                    <Checkbox key={p.value} value={p.value}>
                      {p.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onSubmit} isLoading={loading}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
