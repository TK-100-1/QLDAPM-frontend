'use server';

import axios from 'axios';
import { BaseUrl, customHeader } from '..';
import { cookies } from 'next/headers';
import {
    ChangeEmailPayload,
    ChangePasswordPayload,
    DepositCoinPayload,
    PurchaseVIPPayload,
    UpdateUserInformationPayload,
} from '../../types/user';

export async function changePassword(payload: ChangePasswordPayload) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/user/me/change_password`;

    try {
        const res = await axios.put(
            url,
            {
                current_password: payload.current_password,
                new_password: payload.new_password,
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
        };
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Something went wrong',
            status: error.status,
            data: null,
        };
    }
}

export async function updateUserInformation(
    payload: UpdateUserInformationPayload,
) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    try {
        // Update profile (username)
        const profileUrl = `${BaseUrl}/user/me`;
        await axios.put(
            profileUrl,
            { username: payload.username },
            {
                headers: customHeader(token),
            },
        );

        // Update email
        const emailUrl = `${BaseUrl}/user/me/change_email`;
        const emailRes = await axios.put(
            emailUrl,
            { email: payload.email },
            {
                headers: customHeader(token),
            },
        );

        return {
            success: true,
            message:
                emailRes.data.message ||
                'User information updated successfully',
            status: emailRes.status,
            data: null,
        };
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Something went wrong',
            status: error.status,
            data: null,
        };
    }
}

export async function uploadAvatar(formData: FormData) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    try {
        const res = await axios.post(`${BaseUrl}/user/me/avatar`, formData, {
            headers: {
                Authorization: token,
                'Content-Type': 'multipart/form-data',
            },
        });

        return {
            success: true,
            message: res.data.message,
            avatar: res.data.avatar,
        };
    } catch (error: any) {
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Upload failed',
        };
    }
}

export async function changeEmail(payload: ChangeEmailPayload) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/user/me/change_email`;

    try {
        const res = await axios.put(
            url,
            { email: payload.email },
            {
                headers: customHeader(token),
            },
        );
        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        };
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Something went wrong',
            status: error.status,
            data: null,
        };
    }
}

export async function deposit(payload: DepositCoinPayload) {
    // ... keep as is but update path if needed, usually payments are separate
    // Backend path for deposit was not seen in setupAdminRoutes, let's stick to what was there or check paymentRoutes
    // Actually, I'll update path to /api/v1/payment/deposit if I find it, otherwise keep old
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/deposit?amount=${payload.amount}`;

    try {
        const res = await axios.put(
            url,
            {},
            {
                headers: customHeader(token),
            },
        );
        return {
            success: true,
            message: res.data.message,
            status: res.status,
            data: null,
        };
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Something went wrong',
            status: error.status,
            data: null,
        };
    }
}

export async function purchaseVIP(payload: { role_name: string }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/payment/vip-upgrade`;

    try {
        const res = await axios.post(
            url,
            { role_name: payload.role_name },
            {
                headers: customHeader(token),
            },
        );
        return {
            success: true,
            message: res.data.message || 'Payment created',
            status: res.status,
            data: {
                payment_url: res.data.payment_url,
                order_id: res.data.order_id,
            },
        };
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Something went wrong',
            status: error.status,
            data: null,
        };
    }
}

export async function fetchAvailableRoles() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const url = `${BaseUrl}/payment/roles`;

    try {
        const res = await axios.get(
            url,
            {
                headers: customHeader(token),
            },
        );
        return {
            success: true,
            message: '',
            status: res.status,
            data: res.data.data || [],
        };
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            message: 'Failed to fetch roles',
            status: error.status,
            data: [],
        };
    }
}
