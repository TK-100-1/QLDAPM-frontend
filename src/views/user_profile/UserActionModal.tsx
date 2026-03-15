import { refreshToken } from '@/src/libs/serverAction/auth';
import {
    changeEmail,
    changePassword,
    deposit,
    purchaseVIP,
} from '@/src/libs/serverAction/user';
import { useAuth } from '@/src/provider/AuthProvider';
import {
    ChangeEmailPayload,
    ChangePasswordPayload,
    DepositCoinPayload,
    PurchaseVIPPayload,
} from '@/src/types/user';
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onOpenChange: () => void;
    actionType: 'changePassword' | 'changeEmail' | 'deposit' | 'purchaseVIP';
}

export default function UserActionModal({
    isOpen,
    onOpenChange,
    actionType,
}: Props) {
    const renderModal = () => {
        switch (actionType) {
            case 'changePassword':
                return <ChangePassword onOpenChange={onOpenChange} />;
            case 'changeEmail':
                return <ChangeEmail onOpenChange={onOpenChange} />;
            case 'deposit':
                return <Deposit onOpenChange={onOpenChange} />;
            case 'purchaseVIP':
                return <PurchaseVIP />;
            default:
                return null;
        }
    };

    return (
        <Modal
            disableAnimation
            size="md"
            radius="sm"
            placement="center"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            {renderModal()}
        </Modal>
    );
}

interface formProps {
    onOpenChange: () => void;
}

function ChangePassword({ onOpenChange }: formProps) {
    const [formData, setFormData] = useState<ChangePasswordPayload>({
        currentPassword: '',
        newPassword: '',
    });
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string>('');

    const onSubmit = async () => {
        setFieldErrors({});
        setFormError('');
        if (!formData.currentPassword) {
            setFieldErrors({ currentPassword: 'Current password is required' });
            return;
        }
        if (!formData.newPassword) {
            setFieldErrors({ newPassword: 'New password is required' });
            return;
        }
        if (formData.newPassword !== confirmPassword) {
            setFieldErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }

        await refreshToken();

        const res = await changePassword(formData);

        if (res.success) {
            toast.success(res.message);
            setFormData({ currentPassword: '', newPassword: '' });
            setConfirmPassword('');
            onOpenChange();
        } else {
            // map server field errors if present
            if (res.data && typeof res.data === 'object') {
                setFieldErrors(res.data as Record<string, string>);
            } else {
                setFormError(res.message);
            }
            toast.error(res.message);
        }
    };

    return (
        <ModalContent>
            <ModalHeader className="flex flex-col gap-1 text-2xl">
                Change Password
                <span className="text-sm text-default-400">
                    Please enter your details to update password
                </span>
            </ModalHeader>
            <ModalBody>
                <Input
                    radius="sm"
                    label="Current Password"
                    placeholder="Enter current password"
                    type="password"
                    isInvalid={!!fieldErrors.currentPassword}
                    errorMessage={fieldErrors.currentPassword}
                    value={formData.currentPassword}
                    onChange={(e) => {
                        setFormData({
                            ...formData,
                            currentPassword: e.target.value,
                        });
                        setFieldErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.currentPassword;
                            return copy;
                        });
                    }}
                />
                <Input
                    radius="sm"
                    label="New Password"
                    placeholder="Minimum 8 characters"
                    type="password"
                    isInvalid={!!fieldErrors.newPassword}
                    errorMessage={fieldErrors.newPassword}
                    value={formData.newPassword}
                    onChange={(e) => {
                        setFormData({
                            ...formData,
                            newPassword: e.target.value,
                        });
                        setFieldErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.newPassword;
                            delete copy.confirmPassword;
                            return copy;
                        });
                    }}
                />
                <Input
                    radius="sm"
                    label="Confirm New Password"
                    placeholder="Re-type new password"
                    type="password"
                    isInvalid={!!fieldErrors.confirmPassword}
                    errorMessage={fieldErrors.confirmPassword}
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setFieldErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.confirmPassword;
                            return copy;
                        });
                    }}
                />
                {formError ? (
                    <div className="text-sm text-red-600 mt-2">{formError}</div>
                ) : null}
            </ModalBody>
            <ModalFooter className="flex items-center justify-between gap-4">
                <div />
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        color="default"
                        onClick={onOpenChange}
                    >
                        Cancel
                    </Button>
                    <Button color="primary" onClick={onSubmit}>
                        Update Password
                    </Button>
                </div>
            </ModalFooter>
        </ModalContent>
    );
}

function ChangeEmail({ onOpenChange }: formProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<ChangeEmailPayload>({
        email: '',
    });

    const onSubmit = async () => {
        if (formData.email === '') {
            toast.error('Email cannot be empty');
            return;
        }

        await refreshToken();

        const res = await changeEmail(formData);

        if (res.success) {
            toast.success(res.message);
            setFormData({
                email: '',
            });
            onOpenChange();
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    return (
        <ModalContent>
            <ModalHeader className="flex flex-col gap-1 text-2xl">
                Change Email
            </ModalHeader>
            <ModalBody>
                <Input
                    radius="sm"
                    label="New email"
                    placeholder="Enter new email"
                    type="text"
                    value={formData.email}
                    onChange={(e) => {
                        setFormData({
                            ...formData,
                            email: e.target.value,
                        });
                    }}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={onSubmit}>
                    Confirm
                </Button>
            </ModalFooter>
        </ModalContent>
    );
}

function Deposit({ onOpenChange }: formProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<DepositCoinPayload>({
        amount: 0,
    });

    const onSubmit = async () => {
        if (formData.amount === 0) {
            toast.error('Amount cannot be 0');
            return;
        }

        await refreshToken();

        const res = await deposit(formData);

        if (res.success) {
            toast.success(res.message);
            setFormData({
                amount: 0,
            });
            onOpenChange();
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    return (
        <ModalContent>
            <ModalHeader className="flex flex-col gap-1 text-2xl">
                Deposit coin
            </ModalHeader>
            <ModalBody>
                <Input
                    radius="sm"
                    label="Amount"
                    placeholder="Enter amount you want to deposit"
                    type="text"
                    value={formData.amount.toString()}
                    onChange={(e) => {
                        if (isNaN(Number(e.target.value))) {
                            return;
                        }
                        setFormData({
                            amount: Number(e.target.value),
                        });
                    }}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={onSubmit}>
                    Confirm
                </Button>
            </ModalFooter>
        </ModalContent>
    );
}

function PurchaseVIP() {
    const router = useRouter();
    const { basicUserInfor } = useAuth();
    const vip = basicUserInfor.vip_role as number;

    const [formData, setFormData] = useState<PurchaseVIPPayload>({
        vipLevel: 1,
    });

    const canBuyVIP = (vip: number) => {
        if (!basicUserInfor) return false;
        if (basicUserInfor.vip_role === 0) return true;
        return vip > basicUserInfor.vip_role;
    };

    const onSubmit = async () => {
        await refreshToken();

        const res = await purchaseVIP(formData);

        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    return (
        <ModalContent>
            <ModalHeader className="flex flex-col gap-1 text-2xl">
                Purchase VIP
            </ModalHeader>
            <ModalBody>
                {canBuyVIP(3) ? (
                    <Select
                        disableAnimation
                        placeholder="Select VIP level"
                        onChange={(e) => {
                            if (!basicUserInfor) return;
                            const value = Number(e.target.value);
                            if (value <= basicUserInfor.vip_role) {
                                toast.error('You already have this VIP role');
                                return;
                            }
                            setFormData({
                                vipLevel: Number(e.target.value),
                            });
                        }}
                    >
                        {vip < 1 ? (
                            <SelectItem key={'1'} value={'1'}>
                                VIP 1
                            </SelectItem>
                        ) : (
                            (null as any)
                        )}
                        {vip < 2 ? (
                            <SelectItem key={'2'} value={'2'}>
                                VIP 2
                            </SelectItem>
                        ) : (
                            (null as any)
                        )}
                        <SelectItem key={'3'} value={'3'}>
                            VIP 3
                        </SelectItem>
                    </Select>
                ) : (
                    'Your VIP role is already at the highest level'
                )}
            </ModalBody>
            <ModalFooter>
                {canBuyVIP(3) && (
                    <Button color="primary" onClick={onSubmit}>
                        Confirm
                    </Button>
                )}
            </ModalFooter>
        </ModalContent>
    );
}
