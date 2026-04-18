import { ServerUrl } from '@/src/libs';
import { refreshToken } from '@/src/libs/serverAction/auth';
import {
    changePassword,
    deposit,
    purchaseVIP,
    updateUserInformation,
    uploadAvatar,
} from '@/src/libs/serverAction/user';
import { useAuth } from '@/src/provider/AuthProvider';
import {
    ChangePasswordPayload,
    DepositCoinPayload,
    PurchaseVIPPayload,
} from '@/src/types/user';
import {
    Avatar,
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
import { Camera, Eye, EyeSlash, Wallet } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onOpenChange: () => void;
    actionType: 'changePassword' | 'updateInfo' | 'deposit' | 'purchaseVIP';
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
            case 'updateInfo':
                return <UpdateUserInformation onOpenChange={onOpenChange} />;
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
            radius="lg"
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
        current_password: '',
        new_password: '',
        confirm_new_password: '',
    });
    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const onSubmit = async () => {
        if (
            formData.current_password === '' ||
            formData.new_password === '' ||
            formData.confirm_new_password === ''
        ) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.new_password !== formData.confirm_new_password) {
            toast.error('New passwords do not match');
            return;
        }

        await refreshToken();
        const res = await changePassword(formData);

        if (res.success) {
            toast.success(res.message);
            onOpenChange();
        } else {
            toast.error(res.message);
        }
    };

    return (
        <ModalContent className="p-4">
            <ModalHeader className="flex flex-col items-center gap-2 pb-0">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                    <Wallet size={32} className="text-blue-500" />{' '}
                    {/* Using Wallet as a placeholder icon for "Change Password" based on screenshot 2 */}
                </div>
                <h2 className="text-2xl font-bold">Change Password</h2>
                <p className="text-sm text-slate-400 font-normal">
                    Please enter your details to update password
                </p>
            </ModalHeader>
            <ModalBody className="gap-4 py-6">
                <Input
                    radius="sm"
                    label="Current Password"
                    placeholder="Enter current password"
                    type={showPass.current ? 'text' : 'password'}
                    variant="bordered"
                    endContent={
                        <button
                            type="button"
                            onClick={() =>
                                setShowPass({
                                    ...showPass,
                                    current: !showPass.current,
                                })
                            }
                        >
                            {showPass.current ? (
                                <EyeSlash size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    }
                    value={formData.current_password}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            current_password: e.target.value,
                        })
                    }
                />
                <Input
                    radius="sm"
                    label="New Password"
                    placeholder="Minimum 8 characters"
                    type={showPass.new ? 'text' : 'password'}
                    variant="bordered"
                    endContent={
                        <button
                            type="button"
                            onClick={() =>
                                setShowPass({ ...showPass, new: !showPass.new })
                            }
                        >
                            {showPass.new ? (
                                <EyeSlash size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    }
                    value={formData.new_password}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            new_password: e.target.value,
                        })
                    }
                />
                <Input
                    radius="sm"
                    label="Confirm New Password"
                    placeholder="Re-type new password"
                    type={showPass.confirm ? 'text' : 'password'}
                    variant="bordered"
                    endContent={
                        <button
                            type="button"
                            onClick={() =>
                                setShowPass({
                                    ...showPass,
                                    confirm: !showPass.confirm,
                                })
                            }
                        >
                            {showPass.confirm ? (
                                <EyeSlash size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    }
                    value={formData.confirm_new_password}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            confirm_new_password: e.target.value,
                        })
                    }
                />
            </ModalBody>
            <ModalFooter className="flex-col gap-2">
                <Button
                    color="primary"
                    className="w-full text-lg font-bold py-6"
                    onClick={onSubmit}
                >
                    Update Password
                </Button>
                <Button
                    variant="light"
                    className="w-full"
                    onClick={onOpenChange}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </ModalContent>
    );
}

function UpdateUserInformation({ onOpenChange }: formProps) {
    const { basicUserInfor } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: basicUserInfor?.username || '',
        email: basicUserInfor?.email || '',
    });

    const [avatar, setAvatar] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Only image allowed');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Max size 2MB');
            return;
        }

        setAvatar(file);

        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const onSubmit = async () => {
        if (!formData.username || !formData.email) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);

            await refreshToken();

            const res1 = await updateUserInformation({
                username: formData.username,
                email: formData.email,
            });

            if (!res1.success) {
                toast.error(res1.message);
                return;
            }

            if (avatar) {
                const form = new FormData();
                form.append('avatar', avatar);

                const res2 = await uploadAvatar(form);

                if (!res2.success) {
                    toast.error(res2.message);
                    return;
                }
            }

            toast.success('Updated successfully');

            setAvatar(null);
            setPreview(null);

            onOpenChange();
            router.refresh();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: any) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const avatarUrl = preview
        ? preview
        : basicUserInfor?.avatar
          ? `${ServerUrl}${basicUserInfor.avatar}`
          : '/user.svg';

    return (
        <ModalContent className="p-4">
            <ModalHeader className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold">Update User Information</h2>
            </ModalHeader>

            <ModalBody className="gap-6 py-4">
                <input
                    type="file"
                    id="avatarInput"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <div className="flex flex-col items-center">
                    <div className="relative">
                        <Avatar
                            src={avatarUrl}
                            className="w-24 h-24 object-cover"
                        />

                        <div
                            onClick={() =>
                                document.getElementById('avatarInput')?.click()
                            }
                            className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600"
                        >
                            <Camera size={16} className="text-white" />
                        </div>
                    </div>
                </div>

                <Input
                    label="Username"
                    value={formData.username}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            username: e.target.value,
                        })
                    }
                />

                <Input
                    label="Email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            email: e.target.value,
                        })
                    }
                />
            </ModalBody>

            <ModalFooter>
                <Button color="primary" onClick={onSubmit} isLoading={loading}>
                    Save
                </Button>
            </ModalFooter>
        </ModalContent>
    );
}

// function UpdateUserInformation({ onOpenChange }: formProps) {
//     const { basicUserInfor } = useAuth();
//     const router = useRouter();

//     const [formData, setFormData] = useState({
//         username: basicUserInfor?.username || '',
//         email: basicUserInfor?.email || '',
//     });

//     const [avatar, setAvatar] = useState<File | null>(null);
//     const [preview, setPreview] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);

//     const handleFileChange = (e: any) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         // validate
//         if (!file.type.startsWith('image/')) {
//             toast.error('Only image allowed');
//             return;
//         }

//         if (file.size > 2 * 1024 * 1024) {
//             toast.error('Max size 2MB');
//             return;
//         }

//         setAvatar(file);
//         const previewUrl = URL.createObjectURL(file);
//         setPreview(previewUrl);
//     };

//     const onSubmit = async () => {
//         if (!formData.username || !formData.email) {
//             toast.error('Please fill in all fields');
//             return;
//         }

//         try {
//             setLoading(true);

//             await refreshToken();

//             const res1 = await updateUserInformation({
//                 username: formData.username,
//                 email: formData.email,
//             });

//             if (!res1.success) {
//                 toast.error(res1.message);
//                 return;
//             }

//             if (avatar) {
//                 const form = new FormData();
//                 form.append('avatar', avatar);

//                 const res2 = await uploadAvatar(form);

//                 if (!res2.success) {
//                     toast.error(res2.message);
//                     return;
//                 }
//             }

//             toast.success('Updated successfully');
//             onOpenChange();
//             router.refresh();
//             // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         } catch (error: any) {
//             toast.error('Something went wrong');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <ModalContent className="p-4">
//             <ModalHeader className="flex flex-col items-center gap-2">
//                 <h2 className="text-2xl font-bold">Update User Information</h2>
//             </ModalHeader>

//             <ModalBody className="gap-6 py-4">
//                 <input
//                     type="file"
//                     id="avatarInput"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleFileChange}
//                 />

//                 <div className="flex flex-col items-center">
//                     <div className="relative">
//                         <Avatar
//                             src={basicUserInfor?.avatar || '/user.svg'}
//                             className="w-24 h-24"
//                         />

//                         <div
//                             onClick={() =>
//                                 document.getElementById('avatarInput')?.click()
//                             }
//                             className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600"
//                         >
//                             <Camera size={16} className="text-white" />
//                         </div>
//                     </div>
//                 </div>

//                 <Input
//                     label="Username"
//                     value={formData.username}
//                     onChange={(e) =>
//                         setFormData({
//                             ...formData,
//                             username: e.target.value,
//                         })
//                     }
//                 />

//                 <Input
//                     label="Email"
//                     value={formData.email}
//                     onChange={(e) =>
//                         setFormData({
//                             ...formData,
//                             email: e.target.value,
//                         })
//                     }
//                 />
//             </ModalBody>

//             <ModalFooter>
//                 <Button color="primary" onClick={onSubmit} isLoading={loading}>
//                     Save
//                 </Button>
//             </ModalFooter>
//         </ModalContent>
//     );
// }

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
