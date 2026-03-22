import { useAuth } from "@/src/provider/AuthProvider";
import { Role } from "@/src/types/user";
import {
  Avatar,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spacer,
  useDisclosure,
} from "@nextui-org/react";
import { At, Envelope, Wallet } from "@phosphor-icons/react";
import { useState } from "react";
import UserActionModal from "./UserActionModal";

interface Props {
  isOpenMain: boolean;
  onOpenChangeMain: () => void;
}

const renderVipRole = (role: Role) => {
  switch (role) {
    case 0:
      return "VIP0";
    case 1:
      return "VIP1";
    case 2:
      return "VIP2";
    case 3:
      return "VIP3";
    default:
      return "VIP0";
  }
};

export default function UserProfileModal({
  isOpenMain,
  onOpenChangeMain,
}: Props) {
  const { basicUserInfor } = useAuth();
  const { isOpen, onOpenChange } = useDisclosure();
  const [currentAction, setCurrentAction] = useState<
    "changePassword" | "updateInfo" | "deposit" | "purchaseVIP"
  >("changePassword");

  if (!basicUserInfor) return null;

  return (
    <Modal
      disableAnimation
      size="xl"
      radius="lg"
      placement="center"
      isOpen={isOpenMain}
      onOpenChange={onOpenChangeMain}>
      <ModalContent className="p-4">
        <ModalHeader className="flex flex-col gap-1 text-3xl font-bold px-6 pb-2">
          User Profile
        </ModalHeader>
        <ModalBody className="px-6 py-4">
          <div className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            <Avatar 
               src="/user.svg" 
               className="w-24 h-24 text-large"
               isBordered 
               color="default" 
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {basicUserInfor.name} - {renderVipRole(basicUserInfor.vip_role)}
              </h2>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <At size={20} className="text-slate-400" />
                  <span className="text-md">@{basicUserInfor.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Envelope size={20} className="text-slate-400" />
                  <span className="text-md">{basicUserInfor.email}</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold border border-green-100">
                  <Wallet size={20} />
                  <span className="text-lg">{basicUserInfor.coin || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <Spacer y={4} />
          
          <Listbox
            aria-label="User Actions"
            onAction={(key) => {
              setCurrentAction(key as any);
              onOpenChange();
            }}
            variant="flat"
            itemClasses={{
              base: "px-6 py-4 rounded-xl gap-3 transition-colors hover:bg-slate-100 data-[hover=true]:bg-slate-100",
              title: "text-lg font-medium text-slate-700",
            }}
            className="p-0 border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden"
          >
            <ListboxItem key="changePassword">
              Change password
            </ListboxItem>
            <ListboxItem key="updateInfo">
              Change information
            </ListboxItem>
            <ListboxItem key="deposit">
              Deposit
            </ListboxItem>
            <ListboxItem key="purchaseVIP">
              Purchase VIP
            </ListboxItem>
          </Listbox>

          <UserActionModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            actionType={currentAction}
          />
        </ModalBody>
        <ModalFooter className="h-4" />
      </ModalContent>
    </Modal>
  );
}
