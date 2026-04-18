'use server';

import axios from 'axios';
import { BaseUrl, customHeader } from '..';
import {
    CreateIndicatorTriggerPayload,
    CreateSnoozePayload,
    CreateTriggerPayload,
    CreateUserIndicatorPayload,
    UpdateSnoozePayload,
} from '@/src/types/alert';
import { cookies } from 'next/headers';

function normalizeAlertSymbol(symbol: string) {
    const normalized = symbol.trim().toUpperCase();
    if (!normalized) return normalized;
    if (normalized.endsWith('USDT')) return normalized;
    if (normalized === 'USDT') return normalized;
    return `${normalized}USDT`;
}

function toBackendTriggerType(triggerType: string) {
    switch (triggerType) {
        case 'funding-rate':
            return 'funding_rate';
        case 'price-difference':
            return 'price_difference';
        case 'interval':
            return 'funding_rate_interval';
        case 'listing':
            return 'new_listing';
        default:
            return triggerType;
    }
}

function toBackendSnoozeCondition(conditionType: string) {
    switch (conditionType) {
        case 'ONE_TIME':
            return 'Only once';
        case 'FOREVER':
            return 'Forever';
        case 'AT_SPECIFIC_TIME':
            return 'At Specific Time';
        case 'REPEAT_N_TIMES':
            return 'Once per 5 minutes';
        case 'ONCE_IN_DURATION':
        default:
            return 'Once a day';
    }
}

export async function CreateSnoozeAlert(payload: CreateSnoozePayload) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    // Map snooze to the general alerts creation endpoint as backend handles it via req.body
    const url = `${BaseUrl}/vip2/alerts`;
    const backendType = toBackendTriggerType(payload.triggerType);
    const backendSnoozeCondition = toBackendSnoozeCondition(
        payload.conditionType,
    );

    const maxRepeatCount =
        payload.conditionType === 'ONE_TIME'
            ? 1
            : payload.conditionType === 'FOREVER'
              ? 0
              : 5;

    try {
        const res = await axios.post(
            url,
            {
                symbol: normalizeAlertSymbol(payload.symbol),
                trigger_type: payload.triggerType,
                type: backendType,
                // Keep a permissive threshold so snooze-style reminders can trigger.
                condition: '>=',
                threshold: 0,
                spot_price_threshold: 0,
                price: 0,
                notification_method: 'telegram',
                snooze_condition: backendSnoozeCondition,
                max_repeat_count: maxRepeatCount,
                start_time: payload.startTime,
                end_time: payload.endTime,
                next_trigger_time: payload.startTime,
            },
            {
                headers: customHeader(token),
            },
        );

        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        } as CustomResponse<null>;
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error || 'Failed to create snooze alert',
            status: error.status,
            data: null,
        } as CustomResponse<null>;
    }
}

export async function CreateTriggerAlert(payload: CreateTriggerPayload) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/vip2/alerts`;

    try {
        const res = await axios.post(
            url,
            {
                symbol: normalizeAlertSymbol(payload.symbol),
                condition: payload.condition,
                notification_method: payload.notification_method,
                trigger_type: payload.triggerType,
                type: toBackendTriggerType(payload.triggerType),
                spot_price_threshold: payload.price,
                price: payload.price,
                fundingRate: payload.fundingRate,
                threshold: payload.price,
            },
            {
                headers: customHeader(token),
            },
        );

        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        } as CustomResponse<null>;
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error || 'Failed to create trigger alert',
            status: error.status,
            data: null,
        } as CustomResponse<null>;
    }
}

export async function CreateIndicatorAlert(
    payload: CreateIndicatorTriggerPayload,
    period: number = 14,
) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    // Use indicators endpoint
    const url = `${BaseUrl}/vip3/indicators`;

    try {
        const res = await axios.post(
            url,
            {
                symbol: normalizeAlertSymbol(payload.symbol),
                indicator: payload.indicators,
                period: period,
                notification_method: payload.notification_method,
                condition: payload.condition,
                threshold: payload.price,
            },
            {
                headers: customHeader(token),
            },
        );

        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        } as CustomResponse<null>;
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                'Failed to create indicator alert',
            status: error.status,
            data: null,
        } as CustomResponse<null>;
    }
}

export async function CreateUserIndicatorAlert(
    payload: CreateUserIndicatorPayload,
) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    // Map to indicators endpoint
    const url = `${BaseUrl}/vip3/indicators`;

    try {
        const res = await axios.post(
            url,
            {
                name: payload.name,
                indicator: 'Custom',
                code: payload.code,
                period: 14,
                notification_method: 'telegram', // Default
            },
            {
                headers: customHeader(token),
            },
        );

        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        } as CustomResponse<null>;
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                'Failed to create custom indicator alert',
            status: error.status,
            data: null,
        } as CustomResponse<null>;
    }
}

export async function DeleteTrigger(payload: { id: string }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/vip2/alerts/${payload.id}`;

    try {
        const res = await axios.delete(url, {
            headers: customHeader(token),
        });

        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        } as CustomResponse<null>;
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to delete alert',
            status: error.status,
            data: null,
        } as CustomResponse<null>;
    }
}

export async function UpdateTrigger(
    payload: { id: string } & CreateTriggerPayload,
) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/vip2/alerts/${payload.id}`;

    try {
        const res = await axios.put(
            url,
            {
                symbol: normalizeAlertSymbol(payload.symbol),
                condition: payload.condition,
                notification_method: payload.notification_method,
                trigger_type: payload.triggerType,
                type: toBackendTriggerType(payload.triggerType),
                spot_price_threshold: payload.price,
                price: payload.price,
                fundingRate: payload.fundingRate,
                threshold: payload.price,
            },
            {
                headers: customHeader(token),
            },
        );

        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        } as CustomResponse<null>;
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to update alert',
            status: error.status,
            data: null,
        } as CustomResponse<null>;
    }
}

export async function DeleteIndicatorTrigger(payload: { id: string }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/vip3/indicators/${payload.id}`;

    try {
        const res = await axios.delete(url, {
            headers: customHeader(token),
        });

        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        } as CustomResponse<null>;
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                'Failed to delete indicator alert',
            status: error.status,
            data: null,
        } as CustomResponse<null>;
    }
}

export async function DeleteSnoozeAlert(payload: { id: string }) {
    return DeleteTrigger(payload);
}

export async function UpdateSnoozeAlert(payload: UpdateSnoozePayload) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/vip2/alerts/${payload.id}`;
    const backendType = toBackendTriggerType(payload.triggerType);
    const backendSnoozeCondition = toBackendSnoozeCondition(
        payload.conditionType,
    );

    const maxRepeatCount =
        payload.conditionType === 'ONE_TIME'
            ? 1
            : payload.conditionType === 'FOREVER'
              ? 0
              : 5;

    try {
        const res = await axios.put(
            url,
            {
                symbol: normalizeAlertSymbol(payload.symbol),
                trigger_type: payload.triggerType,
                type: backendType,
                condition: '>=',
                threshold: 0,
                spot_price_threshold: 0,
                price: 0,
                notification_method: payload.notification_method || 'telegram',
                snooze_condition: backendSnoozeCondition,
                max_repeat_count: maxRepeatCount,
                start_time: payload.startTime,
                end_time: payload.endTime,
                next_trigger_time: payload.startTime,
            },
            {
                headers: customHeader(token),
            },
        );

        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        } as CustomResponse<null>;
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error || 'Failed to update snooze alert',
            status: error.status,
            data: null,
        } as CustomResponse<null>;
    }
}
