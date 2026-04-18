import FlexBox from '@/src/components/Box/FlexBox';
import { H1, H3 } from '@/src/components/Heading';
import {
    DeleteSnoozeAlert,
    UpdateSnoozeAlert,
} from '@/src/libs/serverAction/alert';
import { refreshToken } from '@/src/libs/serverAction/auth';
import {
    CONDITIONTYPE,
    ConditionType,
    NotificationMethod,
    NOTIFICATION_METHOD,
    SnoozeAlertData,
    TRIGGERTYPE,
    TriggerType,
} from '@/src/types/alert';
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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onOpenChange: () => void;
    currentSnooze: SnoozeAlertData | null;
    onEditingChange?: (isEditing: boolean) => void;
    isAnyEditing?: boolean;
}

function toInputDateTime(value: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoDateTime(value: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString();
}

function toConditionTypeLabel(value: string): ConditionType {
    switch (value) {
        case 'Only once':
            return CONDITIONTYPE.ONE_TIME;
        case 'At Specific Time':
            return CONDITIONTYPE.AT_SPECIFIC_TIME;
        case 'Forever':
            return CONDITIONTYPE.FOREVER;
        case 'Once per 5 minutes':
            return CONDITIONTYPE.REPEAT_N_TIMES;
        case 'Once a day':
        default:
            return CONDITIONTYPE.ONCE_IN_DURATION;
    }
}

export default function SnoozeModal({
    isOpen,
    onOpenChange,
    currentSnooze,
    onEditingChange,
    isAnyEditing = false,
}: Props) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        symbol: '',
        triggerType: TRIGGERTYPE.SPOT as TriggerType,
        conditionType: CONDITIONTYPE.ONCE_IN_DURATION as ConditionType,
        startTime: '',
        endTime: '',
        notification_method: NOTIFICATION_METHOD.TELEGRAM as NotificationMethod,
    });

    useEffect(() => {
        if (!currentSnooze) return;
        setFormData({
            symbol: currentSnooze.symbol,
            triggerType: (currentSnooze.triggerType ||
                TRIGGERTYPE.SPOT) as TriggerType,
            conditionType: toConditionTypeLabel(currentSnooze.snooze_condition),
            startTime: toInputDateTime(currentSnooze.start_time),
            endTime: toInputDateTime(currentSnooze.end_time),
            notification_method:
                (currentSnooze.notification_method as NotificationMethod) ||
                NOTIFICATION_METHOD.TELEGRAM,
        });
    }, [currentSnooze]);

    useEffect(() => {
        onEditingChange?.(isEditing);
    }, [isEditing, onEditingChange]);

    if (!currentSnooze) return null;

    if (isAnyEditing && !isOpen) {
        return null;
    }

    const onDelete = async () => {
        await refreshToken();
        const res = await DeleteSnoozeAlert({ id: currentSnooze.alert_id });

        if (res.success) {
            toast.success('Snooze alert deleted successfully');
            router.refresh();
            return;
        }

        toast.error(res.message || 'Failed to delete snooze alert');
    };

    const onUpdate = async () => {
        if (
            !formData.symbol ||
            !formData.startTime ||
            !formData.endTime ||
            !formData.triggerType ||
            !formData.conditionType
        ) {
            toast.error('Please fill all fields');
            return;
        }

        const startTimeIso = toIsoDateTime(formData.startTime);
        const endTimeIso = toIsoDateTime(formData.endTime);

        if (!startTimeIso || !endTimeIso) {
            toast.error('Invalid date time format');
            return;
        }

        if (new Date(startTimeIso) >= new Date(endTimeIso)) {
            toast.error('End time must be later than start time');
            return;
        }

        await refreshToken();
        const res = await UpdateSnoozeAlert({
            id: currentSnooze.alert_id,
            symbol: formData.symbol,
            triggerType: formData.triggerType,
            conditionType: formData.conditionType,
            startTime: startTimeIso,
            endTime: endTimeIso,
            notification_method: formData.notification_method,
        });

        if (res.success) {
            toast.success('Snooze alert updated successfully');
            setIsEditing(false);
            router.refresh();
            return;
        }

        toast.error(res.message || 'Failed to update snooze alert');
    };

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
                <ModalHeader>Snooze Alert Details</ModalHeader>
                <ModalBody>
                    <FlexBox className="flex-col gap-4">
                        <FlexBox className="flex-col items-center">
                            {isEditing ? (
                                <Input
                                    label="Coin Symbol"
                                    value={formData.symbol}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            symbol: e.target.value,
                                        }))
                                    }
                                    radius="sm"
                                />
                            ) : (
                                <H1 className="text-3xl">
                                    {currentSnooze.symbol}
                                </H1>
                            )}
                        </FlexBox>

                        <FlexBox className="justify-between gap-4">
                            <FlexBox className="flex-col items-center">
                                <H3 className="font-semibold">Trigger type</H3>
                                <p>{currentSnooze.triggerType}</p>
                            </FlexBox>
                            <FlexBox className="flex-col items-center">
                                <H3 className="font-semibold">Condition</H3>
                                <p>{currentSnooze.snooze_condition}</p>
                            </FlexBox>
                            <FlexBox className="flex-col items-center">
                                <H3 className="font-semibold">Status</H3>
                                <p>
                                    {currentSnooze.is_active
                                        ? 'Active'
                                        : 'Inactive'}
                                </p>
                            </FlexBox>
                        </FlexBox>

                        {isEditing && (
                            <>
                                <FlexBox className="w-full gap-4">
                                    <Select
                                        label="Trigger Type"
                                        selectedKeys={[formData.triggerType]}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                triggerType: e.target
                                                    .value as TriggerType,
                                            }))
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
                                        <SelectItem
                                            key={TRIGGERTYPE.INTERVAL}
                                            value={TRIGGERTYPE.INTERVAL}
                                        >
                                            Interval
                                        </SelectItem>
                                        <SelectItem
                                            key={TRIGGERTYPE.LISTING}
                                            value={TRIGGERTYPE.LISTING}
                                        >
                                            Listing
                                        </SelectItem>
                                    </Select>

                                    <Select
                                        label="Snooze Condition"
                                        selectedKeys={[formData.conditionType]}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                conditionType: e.target
                                                    .value as ConditionType,
                                            }))
                                        }
                                        radius="sm"
                                    >
                                        <SelectItem
                                            key={CONDITIONTYPE.ONCE_IN_DURATION}
                                            value={
                                                CONDITIONTYPE.ONCE_IN_DURATION
                                            }
                                        >
                                            Once in duration
                                        </SelectItem>
                                        <SelectItem
                                            key={CONDITIONTYPE.REPEAT_N_TIMES}
                                            value={CONDITIONTYPE.REPEAT_N_TIMES}
                                        >
                                            Repeat n times
                                        </SelectItem>
                                        <SelectItem
                                            key={CONDITIONTYPE.AT_SPECIFIC_TIME}
                                            value={
                                                CONDITIONTYPE.AT_SPECIFIC_TIME
                                            }
                                        >
                                            At specific time
                                        </SelectItem>
                                        <SelectItem
                                            key={CONDITIONTYPE.FOREVER}
                                            value={CONDITIONTYPE.FOREVER}
                                        >
                                            Forever
                                        </SelectItem>
                                        <SelectItem
                                            key={CONDITIONTYPE.ONE_TIME}
                                            value={CONDITIONTYPE.ONE_TIME}
                                        >
                                            One time
                                        </SelectItem>
                                    </Select>
                                </FlexBox>

                                <FlexBox className="w-full gap-4">
                                    <Input
                                        type="datetime-local"
                                        label="Start Time"
                                        value={formData.startTime}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                startTime: e.target.value,
                                            }))
                                        }
                                        radius="sm"
                                    />
                                    <Input
                                        type="datetime-local"
                                        label="End Time"
                                        value={formData.endTime}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                endTime: e.target.value,
                                            }))
                                        }
                                        radius="sm"
                                    />
                                </FlexBox>
                            </>
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
