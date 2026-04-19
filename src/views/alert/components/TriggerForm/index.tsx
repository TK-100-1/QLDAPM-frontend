'use client';

import Form from '@/src/components/Form';
import CoinSymbolSelect from '../CoinSymbolSelect';
import { CreateTriggerAlert } from '@/src/libs/serverAction/alert';
import { refreshToken } from '@/src/libs/serverAction/auth';
import {
    ALERT_NOTIFICATION_OPTION,
    CONDITION,
    Condition,
    CONDITIONTYPE,
    ConditionType,
    CreateTriggerPayload,
    Indicator,
    INDICATOR,
    NOTIFICATION_METHOD,
    NotificationMethod,
    TRIGGERTYPE,
    TriggerType,
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

const defaultFormData: CreateTriggerPayload = {
    symbol: '',
    condition: CONDITION.EQUAL,
    price: 0,
    fundingRate: '',
    notification_method: NOTIFICATION_METHOD.TELEGRAM,
    triggerType: TRIGGERTYPE.SPOT,
    notificationOption: ALERT_NOTIFICATION_OPTION.NONE,
    conditionType: CONDITIONTYPE.ONCE_IN_DURATION,
    startTime: new Date().toISOString().split('.')[0],
    endTime: new Date().toISOString().split('.')[0],
    indicatorType: INDICATOR.EMA,
    indicatorPeriod: 14,
    indicatorCondition: CONDITION.EQUAL,
    indicatorThreshold: 0,
};

export default function TriggerForm() {
    const router = useRouter();

    const [formData, setFormData] =
        useState<CreateTriggerPayload>(defaultFormData);

    const onChangeForm = (change: Partial<CreateTriggerPayload>) => {
        setFormData((prev) => ({ ...prev, ...change }));
    };

    const isPriceType =
        formData.triggerType === TRIGGERTYPE.SPOT ||
        formData.triggerType === TRIGGERTYPE.FUTURE ||
        formData.triggerType === TRIGGERTYPE.PRICE_DIFF;

    const isFundingType = formData.triggerType === TRIGGERTYPE.FUNDING_RATE;
    const isSnoozeSelected =
        formData.notificationOption === ALERT_NOTIFICATION_OPTION.SNOOZE;
    const isIndicatorSelected =
        formData.notificationOption === ALERT_NOTIFICATION_OPTION.INDICATOR;

    const onSubmit = async () => {
        if (formData.symbol === '') {
            toast.error('Please select a coin');
            return;
        }

        if (
            isSnoozeSelected &&
            (!formData.startTime ||
                !formData.endTime ||
                !formData.conditionType)
        ) {
            toast.error('Please fill all snooze fields');
            return;
        }

        if (isIndicatorSelected) {
            if (!formData.indicatorType || !formData.indicatorPeriod) {
                toast.error('Please fill indicator type and period');
                return;
            }

            if (!formData.indicatorThreshold) {
                toast.error('Indicator threshold is required');
                return;
            }
        }

        if (isFundingType) {
            if (!formData.fundingRate) {
                toast.error('Funding rate is required');
                return;
            }
        } else {
            if (!formData.price) {
                toast.error('Price is required');
                return;
            }
        }

        await refreshToken();

        const payload: CreateTriggerPayload = {
            ...formData,
            price: isPriceType ? parseFloat(formData.price as any) || 0 : 0,
            fundingRate: isFundingType ? formData.fundingRate : '',
            conditionType: isSnoozeSelected
                ? formData.conditionType
                : undefined,
            startTime: isSnoozeSelected ? formData.startTime : undefined,
            endTime: isSnoozeSelected ? formData.endTime : undefined,
            indicatorType: isIndicatorSelected
                ? formData.indicatorType
                : undefined,
            indicatorPeriod: isIndicatorSelected
                ? Number(formData.indicatorPeriod) || 0
                : undefined,
            indicatorCondition: isIndicatorSelected
                ? formData.indicatorCondition
                : undefined,
            indicatorThreshold: isIndicatorSelected
                ? Number(formData.indicatorThreshold) || 0
                : undefined,
        };

        const res = await CreateTriggerAlert(payload);

        if (res.success) {
            toast.success(res.message);
            setFormData(defaultFormData);
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
                        fundingRate: '',
                    });
                }}
                selectedKeys={[formData.triggerType]}
                label="Trigger Type"
                radius="sm"
            >
                <SelectItem key={TRIGGERTYPE.SPOT}>Spot</SelectItem>
                <SelectItem key={TRIGGERTYPE.FUTURE}>Future</SelectItem>
                <SelectItem key={TRIGGERTYPE.PRICE_DIFF}>
                    Price difference
                </SelectItem>
                <SelectItem key={TRIGGERTYPE.FUNDING_RATE}>
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

                            // cho phép số + dấu .
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
                            formData.triggerType === TRIGGERTYPE.PRICE_DIFF
                                ? 'Price Difference'
                                : 'Price Threshold'
                        }
                        description={
                            formData.triggerType === TRIGGERTYPE.PRICE_DIFF
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
                                onChangeForm({ fundingRate: val });
                            }
                        }}
                        value={formData.fundingRate}
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
                            condition: e.target.value as Condition,
                        });
                    }}
                    selectedKeys={[formData.condition]}
                    label="Condition"
                    radius="sm"
                >
                    <SelectItem key={CONDITION.EQUAL}>Equal</SelectItem>
                    <SelectItem key={CONDITION.GREATER_THAN}>
                        Greater than
                    </SelectItem>
                    <SelectItem key={CONDITION.GREATER_THAN_OR_EQUAL}>
                        Greater than or equal
                    </SelectItem>
                    <SelectItem key={CONDITION.LESS_THAN}>Less than</SelectItem>
                    <SelectItem key={CONDITION.LESS_THAN_OR_EQUAL}>
                        Less than or equal
                    </SelectItem>
                </Select>
            </div>

            {/* Notification */}
            <Select
                onChange={(e) => {
                    onChangeForm({
                        notification_method: e.target
                            .value as NotificationMethod,
                    });
                }}
                selectedKeys={[formData.notification_method]}
                label="Notification type"
                radius="sm"
            >
                <SelectItem key={NOTIFICATION_METHOD.TELEGRAM}>
                    Telegram
                </SelectItem>
                <SelectItem key={NOTIFICATION_METHOD.EMAIL}>Email</SelectItem>
            </Select>

            <Select
                onChange={(e) => {
                    onChangeForm({
                        notificationOption: e.target.value as
                            | 'none'
                            | 'snooze'
                            | 'indicator',
                    });
                }}
                selectedKeys={[formData.notificationOption]}
                label="Notification option"
                radius="sm"
            >
                <SelectItem key={ALERT_NOTIFICATION_OPTION.NONE}>
                    None
                </SelectItem>
                <SelectItem key={ALERT_NOTIFICATION_OPTION.SNOOZE}>
                    Snooze
                </SelectItem>
                <SelectItem key={ALERT_NOTIFICATION_OPTION.INDICATOR}>
                    Indicator
                </SelectItem>
            </Select>

            {isSnoozeSelected && (
                <>
                    <div className="w-full flex gap-4">
                        <DatePicker
                            value={parseDateTime(formData.startTime || '')}
                            onChange={(date) => {
                                onChangeForm({ startTime: date.toString() });
                            }}
                            hideTimeZone
                            label="Snooze start time"
                            radius="sm"
                        />
                        <DatePicker
                            value={parseDateTime(formData.endTime || '')}
                            onChange={(date) => {
                                onChangeForm({ endTime: date.toString() });
                            }}
                            hideTimeZone
                            label="Snooze end time"
                            radius="sm"
                        />
                    </div>

                    <Select
                        onChange={(e) => {
                            onChangeForm({
                                conditionType: e.target.value as ConditionType,
                            });
                        }}
                        selectedKeys={[
                            formData.conditionType ||
                                CONDITIONTYPE.ONCE_IN_DURATION,
                        ]}
                        label="Snooze condition type"
                        radius="sm"
                    >
                        <SelectItem key={CONDITIONTYPE.ONCE_IN_DURATION}>
                            Once in duration
                        </SelectItem>
                        <SelectItem key={CONDITIONTYPE.REPEAT_N_TIMES}>
                            Repeat n times
                        </SelectItem>
                        <SelectItem key={CONDITIONTYPE.AT_SPECIFIC_TIME}>
                            At specific time
                        </SelectItem>
                        <SelectItem key={CONDITIONTYPE.FOREVER}>
                            Forever
                        </SelectItem>
                        <SelectItem key={CONDITIONTYPE.ONE_TIME}>
                            One time
                        </SelectItem>
                    </Select>
                </>
            )}

            {isIndicatorSelected && (
                <>
                    <div className="w-full flex gap-4">
                        <Select
                            onChange={(e) => {
                                onChangeForm({
                                    indicatorType: e.target.value as Indicator,
                                });
                            }}
                            selectedKeys={[
                                formData.indicatorType || INDICATOR.EMA,
                            ]}
                            label="Indicator"
                            radius="sm"
                        >
                            <SelectItem key={INDICATOR.EMA}>EMA</SelectItem>
                            <SelectItem key={INDICATOR.BOLL}>BOLL</SelectItem>
                            <SelectItem key={INDICATOR.MA}>MA</SelectItem>
                        </Select>

                        <Input
                            type="number"
                            step="1"
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value)) {
                                    onChangeForm({ indicatorPeriod: value });
                                }
                            }}
                            value={String(formData.indicatorPeriod || '')}
                            label="Indicator period"
                            placeholder="14"
                            radius="sm"
                        />
                    </div>

                    <div className="w-full flex gap-4">
                        <Input
                            type="number"
                            step="0.0001"
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                    onChangeForm({ indicatorThreshold: value });
                                }
                            }}
                            value={String(formData.indicatorThreshold || '')}
                            label="Indicator threshold"
                            placeholder="Enter threshold"
                            radius="sm"
                        />

                        <Select
                            onChange={(e) => {
                                onChangeForm({
                                    indicatorCondition: e.target
                                        .value as Condition,
                                });
                            }}
                            selectedKeys={[
                                formData.indicatorCondition || CONDITION.EQUAL,
                            ]}
                            label="Indicator condition"
                            radius="sm"
                        >
                            <SelectItem key={CONDITION.EQUAL}>Equal</SelectItem>
                            <SelectItem key={CONDITION.GREATER_THAN}>
                                Greater than
                            </SelectItem>
                            <SelectItem key={CONDITION.GREATER_THAN_OR_EQUAL}>
                                Greater than or equal
                            </SelectItem>
                            <SelectItem key={CONDITION.LESS_THAN}>
                                Less than
                            </SelectItem>
                            <SelectItem key={CONDITION.LESS_THAN_OR_EQUAL}>
                                Less than or equal
                            </SelectItem>
                        </Select>
                    </div>
                </>
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
