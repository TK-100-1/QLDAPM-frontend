type ObjectValue<T> = T[keyof T];

export const OPERATOR = {
    GREATER_THAN: '>',
    LESS_THAN: '<',
    EQUAL: '=',
    GREATER_THAN_OR_EQUAL: '>=',
    LESS_THAN_OR_EQUAL: '<=',
} as const;
export type Operator = ObjectValue<typeof OPERATOR>;

export const NOTIFICATION_METHOD = {
    EMAIL: 'email',
} as const;
export type NotificationMethod = ObjectValue<typeof NOTIFICATION_METHOD>;

export const CONDITION_MODE = {
    STATIC: 'static',
    CROSS_ABOVE: 'cross_above',
    CROSS_BELOW: 'cross_below',
    CHANGE_UP: 'change_up',
    CHANGE_DOWN: 'change_down',
} as const;
export type ConditionMode = ObjectValue<typeof CONDITION_MODE>;

export const LOGIC_TYPE = {
    AND: 'AND',
    OR: 'OR',
} as const;
export type LogicType = ObjectValue<typeof LOGIC_TYPE>;

export const ALERT_TRIGGER_STRATEGY = {
    ONCE_IN_DURATION: 'ONCE_IN_DURATION',
    REPEAT_N_TIMES: 'REPEAT_N_TIMES',
    AT_SPECIFIC_TIME: 'AT_SPECIFIC_TIME',
    FOREVER: 'FOREVER',
    ONE_TIME: 'ONE_TIME',
} as const;
export type AlertTriggerStrategy = ObjectValue<typeof ALERT_TRIGGER_STRATEGY>;

export const TRIGGER_TYPE = {
    SPOT: 'spot',
    FUTURE: 'future',
    PRICE_DIFF: 'price_difference',
    FUNDING_RATE: 'funding_rate',
} as const;
export type TriggerType = ObjectValue<typeof TRIGGER_TYPE>;

export type TriggerConditionTree =
    | {
          type: 'condition';
          condition: TriggerConditionNode;
      }
    | {
          type: 'group';
          logic: LogicType;
          children: TriggerConditionTree[];
      };

export type CreateTriggerPayload = {
    symbol: string;
    triggerType: TriggerType;

    conditions: TriggerConditionNode[];
    conditionTree?: TriggerConditionTree;

    cooldownSeconds?: number;
    dedupeWindowSeconds?: number;
    minConfirmations?: number;

    timeWindow?: {
        start?: string | null;
        end?: string | null;
        timezone?: string;
    };
    maxTriggers?: number;
    notification: {
        method: NotificationMethod;
    };

    alertTriggerStrategy?: AlertTriggerStrategy;
    notification_method?: NotificationMethod;
    operator?: Operator;
    conditionMode?: ConditionMode;
    logicType?: LogicType;
    price?: number;
    fundingRate?: number;
    timezone?: string;
    startTime?: string;
    endTime?: string;
};

export type TriggerFormState = {
    symbol: string;

    operator: Operator;
    conditionMode: ConditionMode;
    triggerType: TriggerType;
    price?: number;
    fundingRate?: number;
    metric: 'price' | 'funding_rate' | 'price_difference';
    enableSecondary: boolean;
    enableThird: boolean;

    secondaryCondition: TriggerConditionNode;
    thirdCondition: TriggerConditionNode;

    logicType: LogicType;
    nestedInnerLogic?: LogicType;
    nestedOuterLogic?: LogicType;

    cooldownSeconds: number;
    dedupeWindowSeconds: number;
    minConfirmations: number;

    timeWindow?: {
        start?: string | null;
        end?: string | null;
        timezone?: string;
    };

    alertTriggerStrategy?: AlertTriggerStrategy;

    notificationMethod: NotificationMethod;
};

export type TriggerConditionNode = {
    metric: 'price' | 'funding_rate' | 'price_difference';

    mode?:
        | 'static'
        | 'cross_above'
        | 'cross_below'
        | 'change_up'
        | 'change_down';

    value?: number;
    triggerType: TriggerType;
    operator?: Operator;
    conditionMode?: ConditionMode;
};

export type TriggerConditionData = {
    id: string;
    alert_id: string;
    username: string;
    symbol: string;
    operator: Operator;
    notification_method: NotificationMethod;
    price: number;
    triggerType: TriggerType;
    status: string;
    status_reason?: string;
    message: string;
};

export interface AlertDataFull {
    // ===== IDs =====
    _id?: string;
    id?: string;
    alert_id?: string;

    // ===== USER =====
    user_id?: string;
    username?: string;

    // ===== CORE =====
    symbol: string;

    // ===== CONDITIONS =====
    conditions: TriggerConditionNode[];
    conditionTree?: TriggerConditionTree;

    // ===== CONFIG =====
    timeWindow?: {
        start?: string | null;
        end?: string | null;
        timezone?: string;
    };
    execution: {
        cooldown_seconds: number;
        max_triggers: number;
        min_confirmations: number;
        dedupe_window_seconds: number;
    };
    notification?: {
        method: NotificationMethod;
        message: string;
    };
    conditionMode?: ConditionMode;
    logicType?: LogicType;

    // ===== STATE =====
    is_active?: boolean;
    runtime_state?: {
        last_triggered_at?: string;
        prev_values: number;
        last_result: boolean;
        trigger_count?: number;
        is_snoozed?: boolean;
        confirmation_count?: number;
    };

    // ===== META =====
    created_at?: string;
    updated_at?: string;
    TriggerType?: TriggerType;
    // ===== LEGACY / OPTIONAL =====
    notification_method?: string;
    // ===== EXTEND =====
    [key: string]: any;
}
