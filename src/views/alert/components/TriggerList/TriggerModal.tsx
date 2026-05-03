import FlexBox from '@/src/components/Box/FlexBox';
import { H1 } from '@/src/components/Heading';
import { DeleteTrigger, UpdateTrigger } from '@/src/libs/serverAction/alert';
import { refreshToken } from '@/src/libs/serverAction/auth';
import {
    OPERATOR,
    Operator,
    NOTIFICATION_METHOD,
    NotificationMethod,
    TRIGGER_TYPE,
    TriggerType,
    AlertDataFull,
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
    Card,
    CardBody,
    Divider,
    Chip,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onOpenChange: () => void;
    currentTrigger: AlertDataFull | null;
    onTriggerUpdate?: (updatedTrigger: AlertDataFull) => void;
    isAnyEditing?: boolean;
    onEditingChange?: (isEditing: boolean) => void;
}

type AlertStatus =
    | 'active'
    | 'scheduled'
    | 'exhausted'
    | 'expired_time'
    | 'disabled';

const colorMap: Record<AlertStatus, string> = {
    active: 'success',
    scheduled: 'warning',
    exhausted: 'default',
    expired_time: 'danger',
    disabled: 'default',
};

const labelMap: Record<AlertStatus, string> = {
    active: '🟢 Active',
    scheduled: '🟡 Scheduled',
    exhausted: '⚫ Completed',
    expired_time: '🔴 Expired',
    disabled: '⚪ Disabled',
};

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
    const [editFormData, setEditFormData] = useState<{
        symbol: string;
        triggerType: TriggerType;
        operator: Operator;
        notification_method: NotificationMethod;
        price?: number;
    }>({
        symbol: '',
        triggerType: TRIGGER_TYPE.SPOT as TriggerType,
        operator: OPERATOR.EQUAL as Operator,
        notification_method: NOTIFICATION_METHOD.EMAIL as NotificationMethod,
        price: 0,
    });

    // Initialize edit form when trigger changes
    useEffect(() => {
        if (currentTrigger) {
            const firstCondition = currentTrigger.conditions?.[0];

            setEditFormData({
                symbol: currentTrigger.symbol || '',
                triggerType: currentTrigger.triggerType || TRIGGER_TYPE.SPOT,

                operator: firstCondition?.operator || OPERATOR.EQUAL,

                price: firstCondition?.value || 0,

                notification_method:
                    currentTrigger.notification?.method ||
                    NOTIFICATION_METHOD.EMAIL,
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

        const alertId = currentTrigger?.alert_id || currentTrigger?.id;
        if (!alertId) {
            toast.error('Alert ID not found');
            return;
        }

        const res = await DeleteTrigger({
            id: alertId,
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
            (editFormData.operator as string) === '' ||
            (editFormData.notification_method as string) === '' ||
            (editFormData.triggerType as string) === ''
        ) {
            toast.error('Please fill all fields');
            return;
        }

        await refreshToken();

        const alertId = currentTrigger?.alert_id || currentTrigger?.id;
        if (!alertId) {
            toast.error('Alert ID not found');
            return;
        }

        const res = await UpdateTrigger({
            id: alertId,
            symbol: editFormData.symbol,

            conditions: [
                {
                    metric: 'price',
                    operator: editFormData.operator,
                    mode: 'static',
                    value: editFormData.price,
                    triggerType: editFormData.triggerType,
                },
            ],

            conditionTree: {
                type: 'condition',
                condition: {
                    metric: 'price',
                    operator: editFormData.operator,
                    mode: 'static',
                    value: editFormData.price,
                    triggerType: editFormData.triggerType,
                },
            },

            notification: {
                method: editFormData.notification_method,
            },
            triggerType: editFormData.triggerType,
        });

        if (res.success) {
            toast.success('Trigger updated successfully');
            setIsEditing(false);

            // Update current trigger data locally
            if (onTriggerUpdate && currentTrigger) {
                const updatedTrigger: AlertDataFull = {
                    ...currentTrigger,
                    symbol: editFormData.symbol,
                    triggerType: editFormData.triggerType,

                    conditions: [
                        {
                            metric: 'price',
                            operator: editFormData.operator,
                            mode: 'static',
                            value: editFormData.price,
                            triggerType: editFormData.triggerType,
                        },
                    ],

                    conditionTree: {
                        type: 'condition',
                        condition: {
                            metric: 'price',
                            operator: editFormData.operator,
                            mode: 'static',
                            value: editFormData.price,
                            triggerType: editFormData.triggerType,
                        },
                    },

                    notification: {
                        method: editFormData.notification_method,
                        message: '',
                    },
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

    const status = currentTrigger?.status as AlertStatus;

    const getTriggerTypeLabel = (type: TriggerType): string => {
        const typeLabels: Record<TriggerType, string> = {
            [TRIGGER_TYPE.SPOT]: 'Spot',
            [TRIGGER_TYPE.FUTURE]: 'Future',
            [TRIGGER_TYPE.PRICE_DIFF]: 'Price Difference',
            [TRIGGER_TYPE.FUNDING_RATE]: 'Funding Rate',
        };
        return typeLabels[type] || type;
    };

    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    // Recursive component to render condition tree
    const ConditionTreeNode = ({
        node,
        level = 0,
    }: {
        node: any;
        level?: number;
    }) => {
        const getLevelPaddingClass = (lv: number) => {
            const paddingMap: Record<number, string> = {
                0: 'pl-0',
                1: 'pl-6',
                2: 'pl-12',
                3: 'pl-20',
                4: 'pl-32',
            };
            return paddingMap[lv] || `pl-${Math.min(lv * 6, 32)}`;
        };

        if (node.type === 'condition') {
            const cond = node.condition;
            return (
                <div
                    className={`p-3 bg-background rounded border-l-4 border-primary-400 mb-2 ${getLevelPaddingClass(level)}`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-primary-100 text-primary-600 font-semibold">
                            CONDITION
                        </span>
                    </div>
                    <p className="text-sm mt-2 font-mono">
                        <span className="text-default-700">{cond.metric}</span>
                        <span className="font-bold mx-1 text-primary-500">
                            {cond.operator}
                        </span>
                        <span className="font-bold text-success-500">
                            {cond.value}
                        </span>
                    </p>
                    {cond.mode && cond.mode !== 'static' && (
                        <div className="mt-2">
                            <Chip
                                size="sm"
                                variant="flat"
                                color="warning"
                                className="text-xs"
                            >
                                Mode: {cond.mode}
                            </Chip>
                        </div>
                    )}
                </div>
            );
        }

        if (node.type === 'group' && node.children) {
            const bgColor =
                level === 0
                    ? 'bg-default-100 border-default-300'
                    : 'bg-background border-default-200';
            const logicColor =
                node.logic === 'AND'
                    ? 'bg-success-100 text-success-700 border-success-200'
                    : 'bg-warning-100 text-warning-700 border-warning-200';

            return (
                <div
                    className={`p-3 rounded border mb-2 ${bgColor} ${getLevelPaddingClass(level)}`}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Chip
                            size="sm"
                            className={`font-bold text-sm ${logicColor}`}
                        >
                            {node.logic}
                        </Chip>
                        <span className="text-xs text-default-500">
                            Group · {node.children.length} items
                        </span>
                    </div>
                    <div className="space-y-0">
                        {node.children.map((child: any, idx: number) => (
                            <ConditionTreeNode
                                key={idx}
                                node={child}
                                level={level + 1}
                            />
                        ))}
                    </div>
                </div>
            );
        }

        return null;
    };

    // Don't render if another modal is editing and this modal is not open
    if (isAnyEditing && !isOpen) {
        return null;
    }

    return (
        <Modal
            disableAnimation
            size="2xl"
            radius="sm"
            placement="center"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            scrollBehavior="inside"
            className="max-h-[80vh]"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <H1 className="text-2xl font-bold">
                        {isEditing
                            ? 'Edit Trigger Alert'
                            : 'Trigger Alert Details'}
                    </H1>
                </ModalHeader>

                <ModalBody className="gap-6 max-h-[calc(80vh-180px)] overflow-y-auto">
                    {isEditing ? (
                        // Edit View
                        <FlexBox className="flex-col gap-4">
                            {/* Symbol */}
                            <div>
                                <Input
                                    label="Coin Symbol"
                                    value={editFormData.symbol}
                                    onChange={(e) =>
                                        handleEditFormChange(
                                            'symbol',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    radius="sm"
                                    description="Enter the coin symbol (e.g., BTC, ETH)"
                                />
                            </div>

                            <Divider />

                            {/* Trigger Type */}
                            <div>
                                <Select
                                    label="Trigger Type"
                                    selectedKeys={
                                        new Set([editFormData.triggerType])
                                    }
                                    onSelectionChange={(e) => {
                                        const selected = Array.from(
                                            e,
                                        )[0] as string;
                                        handleEditFormChange(
                                            'triggerType',
                                            selected as TriggerType,
                                        );
                                    }}
                                    radius="sm"
                                    description="Select the type of trigger"
                                >
                                    <SelectItem
                                        key={TRIGGER_TYPE.SPOT}
                                        value={TRIGGER_TYPE.SPOT}
                                    >
                                        Spot
                                    </SelectItem>
                                    <SelectItem
                                        key={TRIGGER_TYPE.FUTURE}
                                        value={TRIGGER_TYPE.FUTURE}
                                    >
                                        Future
                                    </SelectItem>
                                    <SelectItem
                                        key={TRIGGER_TYPE.PRICE_DIFF}
                                        value={TRIGGER_TYPE.PRICE_DIFF}
                                    >
                                        Price Difference
                                    </SelectItem>
                                    <SelectItem
                                        key={TRIGGER_TYPE.FUNDING_RATE}
                                        value={TRIGGER_TYPE.FUNDING_RATE}
                                    >
                                        Funding Rate
                                    </SelectItem>
                                </Select>
                            </div>

                            {/* Operator */}
                            <div>
                                <Select
                                    label="Condition Operator"
                                    selectedKeys={
                                        new Set([editFormData.operator])
                                    }
                                    onSelectionChange={(e) => {
                                        const selected = Array.from(
                                            e,
                                        )[0] as string;
                                        handleEditFormChange(
                                            'operator',
                                            selected as Operator,
                                        );
                                    }}
                                    radius="sm"
                                    description="Select the condition operator"
                                >
                                    <SelectItem
                                        key={OPERATOR.EQUAL}
                                        value={OPERATOR.EQUAL}
                                    >
                                        Equal (=)
                                    </SelectItem>
                                    <SelectItem
                                        key={OPERATOR.GREATER_THAN}
                                        value={OPERATOR.GREATER_THAN}
                                    >
                                        Greater than (&gt;)
                                    </SelectItem>
                                    <SelectItem
                                        key={OPERATOR.GREATER_THAN_OR_EQUAL}
                                        value={OPERATOR.GREATER_THAN_OR_EQUAL}
                                    >
                                        Greater than or equal (&gt;=)
                                    </SelectItem>
                                    <SelectItem
                                        key={OPERATOR.LESS_THAN}
                                        value={OPERATOR.LESS_THAN}
                                    >
                                        Less than (&lt;)
                                    </SelectItem>
                                    <SelectItem
                                        key={OPERATOR.LESS_THAN_OR_EQUAL}
                                        value={OPERATOR.LESS_THAN_OR_EQUAL}
                                    >
                                        Less than or equal (&lt;=)
                                    </SelectItem>
                                </Select>
                            </div>

                            {/* Price Threshold */}
                            <div>
                                <Input
                                    label="Price Threshold"
                                    type="number"
                                    value={
                                        editFormData.price === 0
                                            ? ''
                                            : editFormData.price?.toString()
                                    }
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            handleEditFormChange('price', 0);
                                            return;
                                        }
                                        const numVal = parseFloat(val);
                                        if (isNaN(numVal)) return;
                                        handleEditFormChange('price', numVal);
                                    }}
                                    radius="sm"
                                    description="Enter the price threshold value"
                                    step={0.01}
                                    min={0}
                                />
                            </div>

                            <Divider />

                            {/* Notification Method */}
                            <div>
                                <Select
                                    label="Notification Method"
                                    selectedKeys={
                                        new Set([
                                            editFormData.notification_method,
                                        ])
                                    }
                                    onSelectionChange={(e) => {
                                        const selected = Array.from(
                                            e,
                                        )[0] as string;
                                        handleEditFormChange(
                                            'notification_method',
                                            selected as NotificationMethod,
                                        );
                                    }}
                                    radius="sm"
                                    description="Select how you want to be notified"
                                >
                                    <SelectItem
                                        key={NOTIFICATION_METHOD.EMAIL}
                                        value={NOTIFICATION_METHOD.EMAIL}
                                    >
                                        Email
                                    </SelectItem>
                                </Select>
                            </div>
                        </FlexBox>
                    ) : (
                        // View Mode - Full Details
                        <FlexBox className="flex-col gap-4">
                            {/* Symbol Header */}
                            <div className="text-center py-4">
                                <H1 className="text-4xl font-bold text-primary-500">
                                    {currentTrigger.symbol.toUpperCase()}
                                </H1>
                                {/* {currentTrigger.is_active !== undefined && (
                                    <Chip
                                        className="mt-2"
                                        color={
                                            currentTrigger.is_active
                                                ? 'success'
                                                : 'danger'
                                        }
                                        variant="flat"
                                    >
                                        {currentTrigger.is_active
                                            ? '🟢 Active'
                                            : '🔴 Inactive'}
                                    </Chip>
                                )} */}
                                <Chip color={colorMap[status] || 'default'}>
                                    {labelMap[status] || status}
                                </Chip>
                            </div>

                            <Divider />

                            {/* IDs and User Info */}
                            <Card className="bg-default-100">
                                <CardBody className="gap-4">
                                    <h3 className="text-lg font-semibold">
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-default-500 uppercase">
                                                Alert ID
                                            </p>
                                            <p className="font-mono text-xs break-all">
                                                {currentTrigger.alert_id ||
                                                    currentTrigger.id ||
                                                    'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-default-500 uppercase">
                                                Trigger ID
                                            </p>
                                            <p className="font-mono text-xs break-all">
                                                {currentTrigger.id ||
                                                    currentTrigger._id ||
                                                    'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Trigger Configuration */}
                            <Card className="bg-default-100">
                                <CardBody className="gap-4">
                                    <h3 className="text-lg font-semibold">
                                        Trigger Configuration
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <p className="text-xs text-default-500 uppercase">
                                                Trigger Type
                                            </p>
                                            <p className="font-semibold">
                                                {getTriggerTypeLabel(
                                                    (currentTrigger.triggerType as TriggerType) ||
                                                        (TRIGGER_TYPE.SPOT as TriggerType),
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-default-500 uppercase">
                                                Notification
                                            </p>
                                            <p className="font-semibold capitalize">
                                                {currentTrigger.notification_method ||
                                                    currentTrigger.notification
                                                        ?.method ||
                                                    'Email'}
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Condition Tree - Smart Display */}
                            {currentTrigger.conditionTree && (
                                <Card className="bg-default-100 border-2 border-primary-200">
                                    <CardBody className="gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Condition Logic Tree
                                            </h3>
                                            <p className="text-xs text-default-500 mt-1">
                                                Complex conditions with nested
                                                AND/OR logic
                                            </p>
                                        </div>
                                        <Divider />
                                        <div className="space-y-2">
                                            <ConditionTreeNode
                                                node={
                                                    currentTrigger.conditionTree
                                                }
                                                level={0}
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Fallback: Simple Conditions List */}
                            {!currentTrigger.conditionTree &&
                                currentTrigger.conditions &&
                                currentTrigger.conditions.length > 0 && (
                                    <Card className="bg-default-100">
                                        <CardBody className="gap-3">
                                            <h3 className="text-lg font-semibold">
                                                Conditions (
                                                {
                                                    currentTrigger.conditions
                                                        .length
                                                }
                                                )
                                            </h3>
                                            <div className="space-y-3">
                                                {currentTrigger.conditions.map(
                                                    (cond, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-2 bg-background rounded border border-default-200"
                                                        >
                                                            <p className="text-sm">
                                                                <span className="font-semibold">
                                                                    Condition{' '}
                                                                    {idx + 1}:
                                                                </span>{' '}
                                                                {cond.metric}{' '}
                                                                <span className="font-mono">
                                                                    {
                                                                        cond.operator
                                                                    }
                                                                </span>{' '}
                                                                {cond.value}
                                                                {cond.mode &&
                                                                    cond.mode !==
                                                                        'static' && (
                                                                        <>
                                                                            {' '}
                                                                            <Chip
                                                                                size="sm"
                                                                                variant="flat"
                                                                                className="ml-1"
                                                                            >
                                                                                {
                                                                                    cond.mode
                                                                                }
                                                                            </Chip>
                                                                        </>
                                                                    )}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}

                            {/* Time Window */}
                            {currentTrigger.timeWindow && (
                                <Card className="bg-default-100">
                                    <CardBody className="gap-3">
                                        <h3 className="text-lg font-semibold">
                                            Time Window
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-default-500 uppercase">
                                                    Start Time
                                                </p>
                                                <p className="text-sm font-mono">
                                                    {formatDate(
                                                        currentTrigger
                                                            ?.timeWindow.start,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-default-500 uppercase">
                                                    End Time
                                                </p>
                                                <p className="text-sm font-mono">
                                                    {formatDate(
                                                        currentTrigger
                                                            ?.timeWindow.end,
                                                    )}
                                                </p>
                                            </div>
                                            {currentTrigger.timeWindow
                                                .timezone && (
                                                <div>
                                                    <p className="text-xs text-default-500 uppercase">
                                                        Timezone
                                                    </p>
                                                    <p className="text-sm">
                                                        {
                                                            currentTrigger
                                                                .timeWindow
                                                                .timezone
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Execution Settings */}
                            {currentTrigger.execution && (
                                <Card className="bg-default-100">
                                    <CardBody className="gap-4">
                                        <h3 className="text-lg font-semibold">
                                            Execution Settings
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {currentTrigger.execution
                                                .cooldown_seconds !==
                                                undefined && (
                                                <div>
                                                    <p className="text-xs text-default-500 uppercase">
                                                        Cooldown (sec)
                                                    </p>
                                                    <p className="font-semibold">
                                                        {
                                                            currentTrigger
                                                                .execution
                                                                .cooldown_seconds
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {currentTrigger.execution
                                                .dedupe_window_seconds !==
                                                undefined && (
                                                <div>
                                                    <p className="text-xs text-default-500 uppercase">
                                                        Dedupe Window (sec)
                                                    </p>
                                                    <p className="font-semibold">
                                                        {
                                                            currentTrigger
                                                                .execution
                                                                .dedupe_window_seconds
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            {currentTrigger.execution
                                                .max_triggers !== undefined && (
                                                <div>
                                                    <p className="text-xs text-default-500 uppercase">
                                                        Max Triggers
                                                    </p>
                                                    <p className="font-semibold">
                                                        {
                                                            currentTrigger
                                                                .execution
                                                                .max_triggers
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            {currentTrigger.runtime_state
                                                ?.trigger_count !==
                                                undefined && (
                                                <div>
                                                    <p className="text-xs text-default-500 uppercase">
                                                        Trigger Count
                                                    </p>
                                                    <p className="font-semibold">
                                                        {
                                                            currentTrigger
                                                                .runtime_state
                                                                .trigger_count
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Notification Details */}
                            {currentTrigger.notification && (
                                <Card className="bg-default-100">
                                    <CardBody className="gap-4">
                                        <h3 className="text-lg font-semibold">
                                            🔔 Notification Details
                                        </h3>

                                        {/* Method */}
                                        <div>
                                            <p className="text-xs text-default-500 uppercase">
                                                Method
                                            </p>
                                            <p className="font-semibold capitalize">
                                                {currentTrigger.notification
                                                    ?.method || 'Email'}
                                            </p>
                                        </div>

                                        {/* Message */}
                                        {currentTrigger.message && (
                                            <div>
                                                <p className="text-xs text-default-500 uppercase mb-2">
                                                    Message
                                                </p>

                                                {currentTrigger._messages?.map(
                                                    (msg, i) => (
                                                        <p
                                                            key={i}
                                                            className="text-sm"
                                                        >
                                                            • {msg}
                                                        </p>
                                                    ),
                                                )}

                                                <div className="bg-white rounded-xl p-3 shadow-sm border">
                                                    {currentTrigger.message
                                                        .split('\n')
                                                        .map((line, index) => {
                                                            // Header
                                                            if (
                                                                line.includes(
                                                                    '🚨',
                                                                )
                                                            ) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="font-bold text-red-500 mb-1"
                                                                    >
                                                                        {line}
                                                                    </div>
                                                                );
                                                            }

                                                            // Time
                                                            if (
                                                                line.includes(
                                                                    '⏰',
                                                                )
                                                            ) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="text-xs text-gray-400 mt-2"
                                                                    >
                                                                        {line}
                                                                    </div>
                                                                );
                                                            }

                                                            // Condition line
                                                            if (
                                                                line.includes(
                                                                    '•',
                                                                )
                                                            ) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-start gap-2 text-sm py-1"
                                                                    >
                                                                        <span className="text-blue-500">
                                                                            •
                                                                        </span>
                                                                        <span className="text-default-700">
                                                                            {line
                                                                                .replace(
                                                                                    '•',
                                                                                    '',
                                                                                )
                                                                                .trim()}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="text-sm"
                                                                >
                                                                    {line}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            )}

                            {/* Runtime State */}
                            {currentTrigger.runtime_state && (
                                <Card className="bg-warning-100 border-warning-200">
                                    <CardBody className="gap-4">
                                        <h3 className="text-lg font-semibold">
                                            Runtime State
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {currentTrigger.runtime_state
                                                .last_result !== undefined && (
                                                <div>
                                                    <p className="text-xs text-default-500 uppercase">
                                                        Last Result
                                                    </p>
                                                    <Chip
                                                        size="sm"
                                                        color={
                                                            currentTrigger
                                                                .runtime_state
                                                                .last_result
                                                                ? 'success'
                                                                : 'danger'
                                                        }
                                                        variant="flat"
                                                    >
                                                        {currentTrigger
                                                            .runtime_state
                                                            .last_result
                                                            ? 'True'
                                                            : 'False'}
                                                    </Chip>
                                                </div>
                                            )}
                                            {currentTrigger.runtime_state
                                                .trigger_count !==
                                                undefined && (
                                                <div>
                                                    <p className="text-xs text-default-500 uppercase">
                                                        Trigger Count
                                                    </p>
                                                    <p className="font-semibold text-lg">
                                                        {
                                                            currentTrigger
                                                                .runtime_state
                                                                .trigger_count
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            {/* {currentTrigger.runtime_state
                                                .confirmation_count !==
                                                undefined && (
                                                <div>
                                                    <p className="text-xs text-default-500 uppercase">
                                                        Confirmations
                                                    </p>
                                                    <p className="font-semibold text-lg">
                                                        {
                                                            currentTrigger
                                                                .runtime_state
                                                                .confirmation_count
                                                        }
                                                    </p>
                                                </div>
                                            )} */}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Timestamps */}
                            <Card className="bg-default-100">
                                <CardBody className="gap-3">
                                    <h3 className="text-lg font-semibold">
                                        Timestamps
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-default-500 uppercase">
                                                Created At
                                            </p>
                                            <p className="text-sm font-mono">
                                                {formatDate(
                                                    currentTrigger.created_at,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-default-500 uppercase">
                                                Updated At
                                            </p>
                                            <p className="text-sm font-mono">
                                                {formatDate(
                                                    currentTrigger.updated_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Summary */}
                            <Card className="bg-success-100 border-success-200">
                                <CardBody>
                                    <p className="text-sm">
                                        <span className="font-semibold">
                                            Alert Summary:
                                        </span>{' '}
                                        When{' '}
                                        <span className="font-bold">
                                            {currentTrigger.symbol.toUpperCase()}
                                        </span>{' '}
                                        price is{' '}
                                        <span className="font-bold">
                                            {currentTrigger.conditions?.[0]
                                                ?.operator || 'N/A'}
                                        </span>{' '}
                                        <span className="font-bold">
                                            {(
                                                currentTrigger.conditions?.[0]
                                                    ?.value || 0
                                            ).toLocaleString() || 0}
                                        </span>
                                        , send notification via{' '}
                                        <span className="font-bold">
                                            {currentTrigger.notification_method ||
                                                currentTrigger.notification
                                                    ?.method ||
                                                'Email'}
                                        </span>
                                        .
                                    </p>
                                </CardBody>
                            </Card>
                        </FlexBox>
                    )}
                </ModalBody>

                <Divider />

                <ModalFooter>
                    {isEditing ? (
                        <div className="w-full flex justify-between gap-2">
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
                        <div className="w-full flex justify-between gap-2">
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
