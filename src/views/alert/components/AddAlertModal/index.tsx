import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import TriggerForm from '../TriggerForm';
// import { useAuth } from "@/src/provider/AuthProvider";

interface Props {
    isOpen: boolean;
    onOpenChange: () => void;
}

export default function AddAlertModal({ isOpen, onOpenChange }: Props) {
    // const { basicUserInfor } = useAuth();
    // const role = basicUserInfor.vip_role as number;

    return (
        <Modal
            disableAnimation
            size="xl"
            radius="sm"
            placement="center"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-3xl font-bold">
                    Add new alerts
                </ModalHeader>
                <ModalBody>
                    <TriggerForm />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
