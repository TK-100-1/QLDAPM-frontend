import FlexBox from '@/src/components/Box/FlexBox';
import { H1, H3 } from '@/src/components/Heading';
import { DeleteTrigger, UpdateTrigger } from '@/src/libs/serverAction/alert';
import { refreshToken } from '@/src/libs/serverAction/auth';
import {
    ALERT_NOTIFICATION_OPTION,
    TriggerConditionData,
    CONDITION,
    Condition,
    NOTIFICATION_METHOD,
    NotificationMethod,
    TRIGGERTYPE,
    TriggerType,
} from '@/src/types/alert';
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Input,
    Select,
    SelectItem,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onOpenChange: () => void;
    currentTrigger: TriggerConditionData | null;
    onTriggerUpdate?: (updatedTrigger: TriggerConditionData) => void;
    isAnyEditing?: boolean;
    onEditingChange?: (isEditing: boolean) => void;
}

export default function TriggerModal({
    isOpen,
    onOpenChange,
    currentTrigger,
    onTriggerUpdate,
    isAnyEditing = false,
    onEditingChange,
}: Props) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        symbol: '',
        triggerType: TRIGGERTYPE.SPOT,
        spotPriceThreshold: 0,
        condition: CONDITION.EQUAL,
        notification_method: NOTIFICATION_METHOD.TELEGRAM,
    });

    // Initialize edit form when trigger changes
    useEffect(() => {
        if (currentTrigger) {
            setEditFormData({
                symbol: currentTrigger.symbol,
                triggerType: currentTrigger.triggerType as TriggerType,
                spotPriceThreshold: currentTrigger.spotPriceThreshold,
                condition: currentTrigger.condition as Condition,
                notification_method:
                    currentTrigger.notification_method as NotificationMethod,
            });
        }
    }, [currentTrigger]);

    // Notify parent when editing state changes
    useEffect(() => {
        onEditingChange?.(isEditing);
    }, [isEditing, onEditingChange]);

    if (!currentTrigger) return null;

    const onDelete = async () => {
        await refreshToken();

        const res = await DeleteTrigger({
            id: currentTrigger.alert_id,
        });

        if (res.success) {
            toast.success('Trigger deleted successfully');
            router.refresh();
        } else {
            toast.error('Failed to delete trigger');
        }
    };

    const onUpdate = async () => {
        if (
            editFormData.symbol === '' ||
            editFormData.spotPriceThreshold === 0 ||
            (editFormData.condition as string) === '' ||
            (editFormData.notification_method as string) === '' ||
            (editFormData.triggerType as string) === ''
        ) {
            toast.error('Please fill all fields');
            return;
        }

        await refreshToken();

        const res = await UpdateTrigger({
            id: currentTrigger.alert_id,
            symbol: editFormData.symbol,
            condition: editFormData.condition,
            price: editFormData.spotPriceThreshold,
            fundingRate: '', // You might need to handle this based on trigger type
            notification_method: editFormData.notification_method,
            triggerType: editFormData.triggerType,
            notificationOption: ALERT_NOTIFICATION_OPTION.NONE,
        });

        if (res.success) {
            toast.success('Trigger updated successfully');
            setIsEditing(false);

            // Update current trigger data locally
            if (onTriggerUpdate && currentTrigger) {
                const updatedTrigger: TriggerConditionData = {
                    ...currentTrigger,
                    symbol: editFormData.symbol,
                    triggerType: editFormData.triggerType,
                    spotPriceThreshold: editFormData.spotPriceThreshold,
                    condition: editFormData.condition,
                    notification_method: editFormData.notification_method,
                };
                onTriggerUpdate(updatedTrigger);
            }

            router.refresh();
        } else {
            toast.error('Failed to update trigger');
        }
    };

    const handleEditFormChange = (field: string, value: any) => {
        setEditFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Don't render if another modal is editing and this modal is not open
    if (isAnyEditing && !isOpen) {
        return null;
    }

    return (
        <Modal
            disableAnimation
            size="lg"
            radius="sm"
            placement="center"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                <ModalHeader>Trigger Alert Details</ModalHeader>
                <ModalBody>
                    <FlexBox className="flex-col gap-4">
                        <FlexBox className="flex-col items-center">
                            {isEditing ? (
                                <Input
                                    label="Coin Symbol"
                                    value={editFormData.symbol}
                                    onChange={(e) =>
                                        handleEditFormChange(
                                            'symbol',
                                            e.target.value,
                                        )
                                    }
                                    radius="sm"
                                />
                            ) : (
                                <H1 className="text-3xl">
                                    {currentTrigger.symbol}
                                </H1>
                            )}
                        </FlexBox>
                        <FlexBox className="justify-between gap-4">
                            {isEditing ? (
                                <>
                                    <Select
                                        label="Trigger Type"
                                        value={editFormData.triggerType}
                                        onChange={(e) =>
                                            handleEditFormChange(
                                                'triggerType',
                                                e.target.value as TriggerType,
                                            )
                                        }
                                        radius="sm"
                                    >
                                        <SelectItem
                                            key={TRIGGERTYPE.SPOT}
                                            value={TRIGGERTYPE.SPOT}
                                        >
                                            Spot
                                        </SelectItem>
                                        <SelectItem
                                            key={TRIGGERTYPE.FUTURE}
                                            value={TRIGGERTYPE.FUTURE}
                                        >
                                            Future
                                        </SelectItem>
                                        <SelectItem
                                            key={TRIGGERTYPE.PRICE_DIFF}
                                            value={TRIGGERTYPE.PRICE_DIFF}
                                        >
                                            Price difference
                                        </SelectItem>
                                        <SelectItem
                                            key={TRIGGERTYPE.FUNDING_RATE}
                                            value={TRIGGERTYPE.FUNDING_RATE}
                                        >
                                            Funding rate
                                        </SelectItem>
                                    </Select>
                                    <Input
                                        label="Price Threshold"
                                        type="number"
                                        value={
                                            editFormData.spotPriceThreshold ===
                                            0
                                                ? ''
                                                : editFormData.spotPriceThreshold.toString()
                                        }
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                handleEditFormChange(
                                                    'spotPriceThreshold',
                                                    0,
                                                );
                                                return;
                                            }
                                            const numVal = parseFloat(val);
                                            if (isNaN(numVal)) return;
                                            handleEditFormChange(
                                                'spotPriceThreshold',
                                                numVal,
                                            );
                                        }}
                                        radius="sm"
                                    />
                                    <Select
                                        label="Condition"
                                        value={editFormData.condition}
                                        onChange={(e) =>
                                            handleEditFormChange(
                                                'condition',
                                                e.target.value as Condition,
                                            )
                                        }
                                        radius="sm"
                                    >
                                        <SelectItem
                                            key={CONDITION.EQUAL}
                                            value={CONDITION.EQUAL}
                                        >
                                            Equal
                                        </SelectItem>
                                        <SelectItem
                                            key={CONDITION.GREATER_THAN}
                                            value={CONDITION.GREATER_THAN}
                                        >
                                            Greater than
                                        </SelectItem>
                                        <SelectItem
                                            key={
                                                CONDITION.GREATER_THAN_OR_EQUAL
                                            }
                                            value={
                                                CONDITION.GREATER_THAN_OR_EQUAL
                                            }
                                        >
                                            Greater than or equal
                                        </SelectItem>
                                        <SelectItem
                                            key={CONDITION.LESS_THAN}
                                            value={CONDITION.LESS_THAN}
                                        >
                                            Less than
                                        </SelectItem>
                                        <SelectItem
                                            key={CONDITION.LESS_THAN_OR_EQUAL}
                                            value={CONDITION.LESS_THAN_OR_EQUAL}
                                        >
                                            Less than or equal
                                        </SelectItem>
                                    </Select>
                                </>
                            ) : (
                                <>
                                    <FlexBox className="flex-col items-center">
                                        <H3 className="font-semibold">
                                            Trigger type
                                        </H3>
                                        <p>{currentTrigger.triggerType}</p>
                                    </FlexBox>
                                    <FlexBox className="flex-col items-center">
                                        <H3 className="text-lg font-semibold">
                                            Price threshold
                                        </H3>
                                        <p>
                                            {currentTrigger.spotPriceThreshold}
                                        </p>
                                    </FlexBox>
                                    <FlexBox className="flex-col items-center">
                                        <H3 className="text-lg font-semibold">
                                            Condition
                                        </H3>
                                        <p>{currentTrigger.condition}</p>
                                    </FlexBox>
                                </>
                            )}
                        </FlexBox>
                        {isEditing && (
                            <Select
                                label="Notification Type"
                                value={editFormData.notification_method}
                                onChange={(e) =>
                                    handleEditFormChange(
                                        'notification_method',
                                        e.target.value as NotificationMethod,
                                    )
                                }
                                radius="sm"
                            >
                                <SelectItem
                                    key={NOTIFICATION_METHOD.TELEGRAM}
                                    value={NOTIFICATION_METHOD.TELEGRAM}
                                >
                                    Telegram
                                </SelectItem>
                                <SelectItem
                                    key={NOTIFICATION_METHOD.EMAIL}
                                    value={NOTIFICATION_METHOD.EMAIL}
                                >
                                    Email
                                </SelectItem>
                            </Select>
                        )}
                    </FlexBox>
                </ModalBody>
                <ModalFooter>
                    {isEditing ? (
                        <div className="w-full flex justify-between">
                            <Button
                                radius="sm"
                                variant="bordered"
                                onClick={() => setIsEditing(false)}
                                color="default"
                            >
                                Cancel
                            </Button>
                            <Button
                                radius="sm"
                                onClick={onUpdate}
                                className="bg-primary-500 text-white font-bold"
                            >
                                Save Changes
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full flex justify-between">
                            <Button
                                radius="sm"
                                variant="bordered"
                                onClick={() => {
                                    onDelete();
                                    onOpenChange();
                                }}
                                color="danger"
                            >
                                Delete
                            </Button>
                            <Button
                                radius="sm"
                                onClick={() => setIsEditing(true)}
                                className="bg-primary-500 text-white font-bold"
                            >
                                Update
                            </Button>
                        </div>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
