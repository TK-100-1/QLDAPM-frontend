'use server';

import axios from 'axios';
import { BaseUrl, customHeader } from '..';
import { TriggerConditionTree, CreateTriggerPayload } from '@/src/types/alert';
import { cookies } from 'next/headers';

function normalizeAlertSymbol(symbol: string) {
    const normalized = symbol.trim().toUpperCase();
    if (!normalized) return normalized;
    if (normalized.endsWith('USDT')) return normalized;
    if (normalized === 'USDT') return normalized;
    return `${normalized}USDT`;
}

function toBackendConditionTree(
    tree?: TriggerConditionTree,
    conditions: CreateTriggerPayload['conditions'] = [],
): unknown {
    if (!tree) {
        return undefined;
    }

    if (tree.type === 'condition') {
        const sourceCondition =
            tree.condition ??
            ((tree as any).condition_index !== undefined
                ? conditions[(tree as any).condition_index]
                : undefined);
        if (!sourceCondition) {
            return null;
        }
        return {
            type: 'condition',
            condition: sourceCondition,
        };
    }

    return {
        type: 'group',
        logic: tree.logic,
        children: tree.children.map((item) =>
            toBackendConditionTree(item as TriggerConditionTree, conditions),
        ),
    };
}

export async function CreateTriggerAlert(payload: CreateTriggerPayload) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/vip2/alerts`;

    const notificationMethod =
        payload.notification?.method || payload.notification_method || 'email';

    try {
        const res = await axios.post(
            url,
            {
                symbol: normalizeAlertSymbol(payload.symbol),
                triggerType: payload.triggerType,
                // conditions: payload.conditions,
                conditionTree: toBackendConditionTree(
                    payload.conditionTree,
                    payload.conditions,
                ),
                timeWindow: {
                    start: payload.timeWindow?.start || null,
                    end: payload.timeWindow?.end || null,
                    timezone:
                        payload.timeWindow?.timezone ||
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                execution: {
                    cooldown_seconds: payload.cooldownSeconds || 30,
                    max_triggers: payload.maxTriggers || 10,
                    min_confirmations: payload.minConfirmations || 1,
                    dedupe_window_seconds: payload.dedupeWindowSeconds || 30,
                },
                notification: {
                    method: notificationMethod,
                    message: '',
                },
                // backward compatibility fields for mixed backend deployments
                condition_mode: payload.conditionMode || 'static',
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
                triggerType: payload.triggerType,
                // conditions: payload.conditions,
                conditionTree: toBackendConditionTree(
                    payload.conditionTree,
                    payload.conditions,
                ),
                timeWindow: {
                    start: payload.timeWindow?.start || null,
                    end: payload.timeWindow?.end || null,
                    timezone:
                        payload.timeWindow?.timezone ||
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                execution: {
                    cooldown_seconds: payload.cooldownSeconds || 30,
                    max_triggers: payload.maxTriggers || 10,
                    min_confirmations: payload.minConfirmations || 1,
                    dedupe_window_seconds: payload.dedupeWindowSeconds || 30,
                },
                notification: {
                    method: payload.notification_method,
                    message: '',
                },
                condition_mode: payload.conditionMode || 'static',
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
