'use client';

import Form from '@/src/components/Form';
import CoinSymbolSelect from '../CoinSymbolSelect';
import { CreateTriggerAlert } from '@/src/libs/serverAction/alert';
import {
    OPERATOR,
    CONDITION_MODE,
    ALERT_TRIGGER_STRATEGY,
    TriggerConditionNode,
    TriggerConditionTree,
    CreateTriggerPayload,
    LOGIC_TYPE,
    NOTIFICATION_METHOD,
    TriggerType,
    TRIGGER_TYPE,
    ConditionMode,
    TriggerFormState,
    LogicType,
    Operator,
    AlertTriggerStrategy,
    NotificationMethod,
} from '@/src/types/alert';
import {
    Button,
    DatePicker,
    Input,
    Select,
    SelectItem,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { parseDateTime } from '@internationalized/date';

const defaultFormData: TriggerFormState = {
    // ?? basic
    symbol: '',

    // ?? PRIMARY CONDITION
    operator: OPERATOR.GREATER_THAN,
    conditionMode: CONDITION_MODE.STATIC,

    price: 0,
    fundingRate: 0,
    metric: 'price',
    triggerType: TRIGGER_TYPE.SPOT,
    // ?? MULTI CONDITIONS
    enableSecondary: false,
    enableThird: false,

    secondaryCondition: {
        metric: 'price',
        operator: '>',
        mode: 'static',
        value: 0,
        triggerType: TRIGGER_TYPE.SPOT,
    },

    thirdCondition: {
        metric: 'price',
        operator: '>',
        mode: 'static',
        value: 0,
        triggerType: TRIGGER_TYPE.SPOT,
    },

    // ?? LOGIC
    logicType: LOGIC_TYPE.AND,
    nestedInnerLogic: LOGIC_TYPE.AND,
    nestedOuterLogic: LOGIC_TYPE.AND,

    // ?? EXECUTION
    cooldownSeconds: 30,
    dedupeWindowSeconds: 30,
    minConfirmations: 1,

    // ?? SNOOZE
    timeWindow: {
        start: null,
        end: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },

    alertTriggerStrategy: ALERT_TRIGGER_STRATEGY.ONCE_IN_DURATION,

    // ?? NOTIFICATION
    notificationMethod: NOTIFICATION_METHOD.EMAIL,
};

function safeParseDateTime(value?: string | null) {
    if (!value) return null;

    try {
        return parseDateTime(value);
    } catch {
        return null;
    }
}

export default function TriggerForm() {
    const router = useRouter();

    const [formData, setFormData] = useState<TriggerFormState>(defaultFormData);
    const [enableSecondaryCondition, setEnableSecondaryCondition] =
        useState(false);
    const [secondaryCondition, setSecondaryCondition] =
        useState<TriggerConditionNode>(getDefaultConditionNode());
    const [enableThirdCondition, setEnableThirdCondition] = useState(false);
    const [thirdCondition, setThirdCondition] = useState<TriggerConditionNode>(
        getDefaultConditionNode(),
    );
    const [nestedInnerLogic, setNestedInnerLogic] = useState<LogicType>(
        LOGIC_TYPE.AND,
    );
    const [nestedOuterLogic, setNestedOuterLogic] = useState<LogicType>(
        LOGIC_TYPE.OR,
    );

    const onChangeForm = (change: Partial<TriggerFormState>) => {
        setFormData((prev) => ({ ...prev, ...change }));
    };

    const isPriceType =
        formData.triggerType === TRIGGER_TYPE.SPOT ||
        formData.triggerType === TRIGGER_TYPE.FUTURE ||
        formData.triggerType === TRIGGER_TYPE.PRICE_DIFF;

    const isFundingType = formData.triggerType === TRIGGER_TYPE.FUNDING_RATE;

    const conditionModeOptions: Array<{ key: ConditionMode; label: string }> = [
        { key: CONDITION_MODE.STATIC, label: 'Static threshold' },
        { key: CONDITION_MODE.CROSS_ABOVE, label: 'Cross above' },
        { key: CONDITION_MODE.CROSS_BELOW, label: 'Cross below' },
        { key: CONDITION_MODE.CHANGE_UP, label: 'Change up' },
        { key: CONDITION_MODE.CHANGE_DOWN, label: 'Change down' },
    ];

    function getDefaultConditionNode(): TriggerConditionNode {
        return {
            metric: 'price',
            operator: '>',
            mode: 'static',
            triggerType: TRIGGER_TYPE.SPOT,
            value: 0,
        };
    }

    const buildPrimaryCondition = (): TriggerConditionNode => {
        return {
            metric: formData.metric,
            triggerType: formData.triggerType,
            operator: formData.operator || '>',
            mode: formData.conditionMode || 'static',
            value: isFundingType
                ? Number(formData.fundingRate) || 0
                : Number(formData.price) || 0,
        };
    };

    const buildConditions = (): TriggerConditionNode[] => {
        const result: TriggerConditionNode[] = [];

        result.push(buildPrimaryCondition());

        if (enableSecondaryCondition) {
            result.push(secondaryCondition);
        }

        if (enableThirdCondition) {
            result.push(thirdCondition);
        }

        return result;
    };

    const buildConditionTree = (
        conditions: TriggerConditionNode[],
    ): TriggerConditionTree | undefined => {
        if (conditions.length === 0) return undefined;

        if (conditions.length === 1) {
            return {
                type: 'condition',
                condition: conditions[0],
            };
        }

        if (conditions.length === 2 || !enableThirdCondition) {
            return {
                type: 'group',
                logic: formData.logicType || LOGIC_TYPE.AND,
                children: conditions.slice(0, 2).map((c) => ({
                    type: 'condition',
                    condition: c,
                })),
            };
        }

        return {
            type: 'group',
            logic: nestedOuterLogic,
            children: [
                {
                    type: 'group',
                    logic: nestedInnerLogic,
                    children: conditions.slice(0, 2).map((c) => ({
                        type: 'condition',
                        condition: c,
                    })),
                },
                {
                    type: 'condition',
                    condition: conditions[2],
                },
            ],
        };
    };

    const mapStrategyToExecution = (strategy: AlertTriggerStrategy) => {
        switch (strategy) {
            case 'ONE_TIME':
                return { max_triggers: 1 };

            case 'FOREVER':
                return { max_triggers: 0 };

            case 'ONCE_IN_DURATION':
                return { max_triggers: 1 };

            case 'REPEAT_N_TIMES':
                return { max_triggers: 5 }; // hoặc input user

            case 'AT_SPECIFIC_TIME':
                return { max_triggers: 1 };

            default:
                return { max_triggers: 10 };
        }
    };

    const onSubmit = async () => {
        if (!formData.symbol) {
            toast.error('Please select a coin');
            return;
        }

        const conditions = buildConditions();
        const conditionTree = buildConditionTree(conditions);

        if (conditions.length === 0) {
            toast.error('At least one condition required');
            return;
        }

        for (const c of conditions) {
            if (c.mode === 'static' && c.value === undefined) {
                toast.error('Value required');
                return;
            }
        }

        const payload: CreateTriggerPayload = {
            symbol: formData.symbol,
            triggerType: formData.triggerType,

            conditions,
            conditionTree,

            cooldownSeconds: Number(formData.cooldownSeconds) || 0,
            dedupeWindowSeconds: Number(formData.dedupeWindowSeconds) || 30,
            minConfirmations: Math.max(
                1,
                Number(formData.minConfirmations) || 1,
            ),

            notification: {
                method: formData.notificationMethod,
            },

            maxTriggers: mapStrategyToExecution(
                formData.alertTriggerStrategy ||
                    ALERT_TRIGGER_STRATEGY.ONCE_IN_DURATION,
            ).max_triggers,
        };

        payload.timeWindow = {
            start: formData.timeWindow?.start ?? null,
            end: formData.timeWindow?.end ?? null,
            timezone:
                formData.timeWindow?.timezone ||
                Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const res = await CreateTriggerAlert(payload);

        if (res.success) {
            toast.success(res.message);
            setFormData(defaultFormData);
            setEnableSecondaryCondition(false);
            setEnableThirdCondition(false);
            setSecondaryCondition(getDefaultConditionNode());
            setThirdCondition(getDefaultConditionNode());
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    return (
        <Form className="p-0">
            {/* Coin */}
            <CoinSymbolSelect
                label="Coin symbol"
                placeholder="Select a coin"
                value={formData.symbol}
                onValueChange={(symbol) => onChangeForm({ symbol })}
            />

            {/* Trigger Type */}
            <Select
                onChange={(e) => {
                    const type = e.target.value as TriggerType;

                    onChangeForm({
                        triggerType: type,
                        price: 0,
                        fundingRate: 0,
                    });
                }}
                selectedKeys={[formData.triggerType]}
                label="Trigger Type"
                radius="sm"
            >
                <SelectItem key={TRIGGER_TYPE.SPOT}>Spot</SelectItem>
                <SelectItem key={TRIGGER_TYPE.FUTURE}>Future</SelectItem>
                <SelectItem key={TRIGGER_TYPE.PRICE_DIFF}>
                    Price difference
                </SelectItem>
                <SelectItem key={TRIGGER_TYPE.FUNDING_RATE}>
                    Funding rate
                </SelectItem>
            </Select>

            {/* Dynamic Input */}
            <div className="w-full flex gap-4">
                {isPriceType && (
                    <Input
                        type="text"
                        onChange={(e) => {
                            const val = e.target.value;

                            // cho ph�p s? + d?u .
                            if (/^\d*\.?\d*$/.test(val)) {
                                onChangeForm({
                                    price: val === '' ? 0 : parseFloat(val),
                                });
                            }
                        }}
                        value={
                            formData.price === 0 ? '' : String(formData.price)
                        }
                        label={
                            formData.triggerType === TRIGGER_TYPE.PRICE_DIFF
                                ? 'Price Difference'
                                : 'Price Threshold'
                        }
                        description={
                            formData.triggerType === TRIGGER_TYPE.PRICE_DIFF
                                ? 'Difference between spot and future price'
                                : 'Target price (e.g., 76000.50)'
                        }
                        placeholder="Enter price"
                        radius="sm"
                    />
                )}

                {isFundingType && (
                    <Input
                        type="text"
                        onChange={(e) => {
                            const val = e.target.value;

                            if (/^\d*\.?\d*$/.test(val)) {
                                onChangeForm({
                                    fundingRate:
                                        val === '' ? 0 : parseFloat(val),
                                });
                            }
                        }}
                        value={
                            formData.fundingRate === 0
                                ? ''
                                : String(formData.fundingRate)
                        }
                        label="Funding Rate"
                        description="e.g., 0.0001 = 0.01%"
                        placeholder="Enter funding rate"
                        radius="sm"
                    />
                )}

                {/* Condition */}
                <Select
                    onChange={(e) => {
                        onChangeForm({
                            operator: e.target.value as Operator,
                        });
                    }}
                    selectedKeys={[formData.operator]}
                    label="Operator"
                    radius="sm"
                >
                    <SelectItem key={OPERATOR.EQUAL}>Equal</SelectItem>
                    <SelectItem key={OPERATOR.GREATER_THAN}>
                        Greater than
                    </SelectItem>
                    <SelectItem key={OPERATOR.GREATER_THAN_OR_EQUAL}>
                        Greater than or equal
                    </SelectItem>
                    <SelectItem key={OPERATOR.LESS_THAN}>Less than</SelectItem>
                    <SelectItem key={OPERATOR.LESS_THAN_OR_EQUAL}>
                        Less than or equal
                    </SelectItem>
                </Select>

                <Select
                    onChange={(e) => {
                        onChangeForm({
                            conditionMode: e.target.value as ConditionMode,
                        });
                    }}
                    selectedKeys={[
                        formData.conditionMode || CONDITION_MODE.STATIC,
                    ]}
                    label="Condition Mode"
                    radius="sm"
                >
                    {conditionModeOptions.map((item) => (
                        <SelectItem key={item.key}>{item.label}</SelectItem>
                    ))}
                </Select>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    type="number"
                    min={0}
                    step={1}
                    value={String(formData.cooldownSeconds || 30)}
                    onChange={(e) =>
                        onChangeForm({
                            cooldownSeconds: Math.max(
                                0,
                                Number(e.target.value) || 0,
                            ),
                        })
                    }
                    label="Cooldown (seconds)"
                    radius="sm"
                />
                <Input
                    type="number"
                    min={0}
                    step={1}
                    value={String(formData.dedupeWindowSeconds || 30)}
                    onChange={(e) =>
                        onChangeForm({
                            dedupeWindowSeconds: Math.max(
                                0,
                                Number(e.target.value) || 0,
                            ),
                        })
                    }
                    label="Dedupe window (seconds)"
                    radius="sm"
                />
                <Input
                    type="number"
                    min={1}
                    step={1}
                    value={String(formData.minConfirmations || 1)}
                    onChange={(e) =>
                        onChangeForm({
                            minConfirmations: Math.max(
                                1,
                                Number(e.target.value) || 1,
                            ),
                        })
                    }
                    label="Confirmations"
                    radius="sm"
                />
            </div>

            {/* Notification */}
            <Select
                onChange={(e) => {
                    onChangeForm({
                        notificationMethod: e.target
                            .value as NotificationMethod,
                    });
                }}
                selectedKeys={[formData.notificationMethod]}
                label="Notification type"
                radius="sm"
            >
                <SelectItem key={NOTIFICATION_METHOD.EMAIL}>Email</SelectItem>
            </Select>

            <div className="w-full flex gap-4">
                <DatePicker
                    value={safeParseDateTime(
                        formData.timeWindow?.start ?? undefined,
                    )}
                    onChange={(date) => {
                        setFormData((prev) => ({
                            ...prev,
                            timeWindow: {
                                ...prev.timeWindow,
                                start: date ? date.toString() : null,
                            },
                        }));
                    }}
                    hideTimeZone
                    label="Snooze start time"
                    radius="sm"
                />
                <DatePicker
                    value={safeParseDateTime(
                        formData.timeWindow?.end ?? undefined,
                    )}
                    onChange={(date) => {
                        setFormData((prev) => ({
                            ...prev,
                            timeWindow: {
                                ...prev.timeWindow,
                                end: date ? date.toString() : null,
                            },
                        }));
                        console.log('end', formData.timeWindow);
                    }}
                    hideTimeZone
                    label="Snooze end time"
                    radius="sm"
                />
            </div>

            <Select
                onChange={(e) => {
                    onChangeForm({
                        alertTriggerStrategy: e.target
                            .value as AlertTriggerStrategy,
                    });
                }}
                selectedKeys={
                    formData.alertTriggerStrategy
                        ? [formData.alertTriggerStrategy]
                        : undefined
                }
                label="Snooze condition type"
                radius="sm"
            >
                <SelectItem key={ALERT_TRIGGER_STRATEGY.ONCE_IN_DURATION}>
                    Once in duration
                </SelectItem>
                <SelectItem key={ALERT_TRIGGER_STRATEGY.REPEAT_N_TIMES}>
                    Repeat n times
                </SelectItem>
                <SelectItem key={ALERT_TRIGGER_STRATEGY.AT_SPECIFIC_TIME}>
                    At specific time
                </SelectItem>
                <SelectItem key={ALERT_TRIGGER_STRATEGY.FOREVER}>
                    Forever
                </SelectItem>
                <SelectItem key={ALERT_TRIGGER_STRATEGY.ONE_TIME}>
                    One time
                </SelectItem>
            </Select>

            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <Select
                    onChange={(e) => {
                        onChangeForm({
                            logicType: e.target.value as LogicType,
                        });
                    }}
                    selectedKeys={[formData.logicType || LOGIC_TYPE.AND]}
                    label="Logic between conditions"
                    radius="sm"
                >
                    <SelectItem key={LOGIC_TYPE.AND}>AND</SelectItem>
                    <SelectItem key={LOGIC_TYPE.OR}>OR</SelectItem>
                </Select>

                <Button
                    radius="sm"
                    variant="flat"
                    onClick={() =>
                        setEnableSecondaryCondition((previous) => !previous)
                    }
                >
                    {enableSecondaryCondition
                        ? 'Remove 2nd condition'
                        : 'Add 2nd condition'}
                </Button>

                <Button
                    radius="sm"
                    variant="flat"
                    isDisabled={!enableSecondaryCondition}
                    onClick={() =>
                        setEnableThirdCondition((previous) => !previous)
                    }
                >
                    {enableThirdCondition
                        ? 'Remove 3rd condition'
                        : 'Add 3rd condition'}
                </Button>
            </div>

            {enableThirdCondition && (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        onChange={(e) =>
                            setNestedInnerLogic(e.target.value as LogicType)
                        }
                        selectedKeys={[nestedInnerLogic]}
                        label="Inner logic (A ? B)"
                        radius="sm"
                    >
                        <SelectItem key={LOGIC_TYPE.AND}>AND</SelectItem>
                        <SelectItem key={LOGIC_TYPE.OR}>OR</SelectItem>
                    </Select>
                    <Select
                        onChange={(e) =>
                            setNestedOuterLogic(e.target.value as LogicType)
                        }
                        selectedKeys={[nestedOuterLogic]}
                        label="Outer logic ((A ? B) ? C)"
                        radius="sm"
                    >
                        <SelectItem key={LOGIC_TYPE.AND}>AND</SelectItem>
                        <SelectItem key={LOGIC_TYPE.OR}>OR</SelectItem>
                    </Select>
                </div>
            )}

            {enableSecondaryCondition && (
                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select
                        onChange={(e) =>
                            setSecondaryCondition((prev) => ({
                                ...prev,
                                metric: e.target.value as
                                    | 'price'
                                    | 'funding_rate'
                                    | 'price_difference',
                            }))
                        }
                        selectedKeys={[secondaryCondition.metric]}
                        label="2nd Trigger Type"
                        radius="sm"
                    >
                        <SelectItem key="price">Price</SelectItem>
                        <SelectItem key="funding_rate">Funding rate</SelectItem>
                        <SelectItem key="price_difference">Spread</SelectItem>
                    </Select>

                    <Select
                        onChange={(e) =>
                            setSecondaryCondition((prev) => ({
                                ...prev,
                                operator: e.target.value as Operator,
                            }))
                        }
                        selectedKeys={[
                            secondaryCondition.operator ||
                                OPERATOR.GREATER_THAN,
                        ]}
                        label="2nd condition"
                        radius="sm"
                    >
                        <SelectItem key={OPERATOR.EQUAL}>Equal</SelectItem>
                        <SelectItem key={OPERATOR.GREATER_THAN}>
                            Greater than
                        </SelectItem>
                        <SelectItem key={OPERATOR.GREATER_THAN_OR_EQUAL}>
                            Greater than or equal
                        </SelectItem>
                        <SelectItem key={OPERATOR.LESS_THAN}>
                            Less than
                        </SelectItem>
                        <SelectItem key={OPERATOR.LESS_THAN_OR_EQUAL}>
                            Less than or equal
                        </SelectItem>
                    </Select>

                    <Select
                        onChange={(e) =>
                            setSecondaryCondition((prev) => ({
                                ...prev,
                                conditionMode: e.target.value as ConditionMode,
                            }))
                        }
                        selectedKeys={[
                            secondaryCondition.conditionMode ||
                                CONDITION_MODE.STATIC,
                        ]}
                        label="2nd mode"
                        radius="sm"
                    >
                        {conditionModeOptions.map((item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                        ))}
                    </Select>

                    <Input
                        type="number"
                        step="0.0001"
                        value={String(secondaryCondition.value || '')}
                        onChange={(e) =>
                            setSecondaryCondition((prev) => ({
                                ...prev,
                                value: Number(e.target.value) || 0,
                            }))
                        }
                        label="2nd threshold"
                        radius="sm"
                    />
                </div>
            )}

            {enableThirdCondition && (
                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select
                        onChange={(e) =>
                            setThirdCondition((prev) => ({
                                ...prev,
                                metric: e.target.value as
                                    | 'price'
                                    | 'funding_rate'
                                    | 'price_difference',
                            }))
                        }
                        selectedKeys={[thirdCondition.metric]}
                        label="3rd metric"
                        radius="sm"
                    >
                        <SelectItem key="price">Price</SelectItem>
                        <SelectItem key="funding_rate">Funding rate</SelectItem>
                        <SelectItem key="price_difference">Spread</SelectItem>
                    </Select>

                    <Select
                        onChange={(e) =>
                            setThirdCondition((prev) => ({
                                ...prev,
                                operator: e.target.value as Operator,
                            }))
                        }
                        selectedKeys={[
                            thirdCondition.operator || OPERATOR.GREATER_THAN,
                        ]}
                        label="3rd condition"
                        radius="sm"
                    >
                        <SelectItem key={OPERATOR.EQUAL}>Equal</SelectItem>
                        <SelectItem key={OPERATOR.GREATER_THAN}>
                            Greater than
                        </SelectItem>
                        <SelectItem key={OPERATOR.GREATER_THAN_OR_EQUAL}>
                            Greater than or equal
                        </SelectItem>
                        <SelectItem key={OPERATOR.LESS_THAN}>
                            Less than
                        </SelectItem>
                        <SelectItem key={OPERATOR.LESS_THAN_OR_EQUAL}>
                            Less than or equal
                        </SelectItem>
                    </Select>

                    <Select
                        onChange={(e) =>
                            setThirdCondition((prev) => ({
                                ...prev,
                                conditionMode: e.target.value as ConditionMode,
                            }))
                        }
                        selectedKeys={[
                            thirdCondition.conditionMode ||
                                CONDITION_MODE.STATIC,
                        ]}
                        label="3rd mode"
                        radius="sm"
                    >
                        {conditionModeOptions.map((item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                        ))}
                    </Select>

                    <Input
                        type="number"
                        step="0.0001"
                        value={String(thirdCondition.value || '')}
                        onChange={(e) =>
                            setThirdCondition((prev) => ({
                                ...prev,
                                value: Number(e.target.value) || 0,
                            }))
                        }
                        label="3rd threshold"
                        radius="sm"
                    />
                </div>
            )}

            {/* Submit */}
            <div className="w-full flex items-center justify-end">
                <Button
                    onClick={onSubmit}
                    radius="sm"
                    className="bg-primary-500 text-white font-bold"
                >
                    Create
                </Button>
            </div>
        </Form>
    );
}
