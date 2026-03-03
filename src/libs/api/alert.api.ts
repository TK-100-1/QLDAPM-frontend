import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { httpService } from "../http";
import {
	CreateSnoozePayload,
	CreateTriggerPayload,
	CreateIndicatorTriggerPayload,
	CreateUserIndicatorPayload,
	DeleteTriggerPayload,
	DeleteIndicatorTriggerPayload,
	TriggerConditionData,
	IndicatorTrigerData,
} from "@/src/types/alert";

export type AlertListData = {
	triggerList: TriggerConditionData[];
	indicatorList: IndicatorTrigerData[];
};

export function fetchAlerts(): Observable<AlertListData> {
	return httpService.get<(TriggerConditionData | IndicatorTrigerData)[]>(
		"/api/vip2/get/alerts"
	).pipe(
		map((res) => {
			const triggerList: TriggerConditionData[] = [];
			const indicatorList: IndicatorTrigerData[] = [];

			if (res.success && Array.isArray(res.data)) {
				for (const item of res.data) {
					if (item.triggerType === "indicator") {
						indicatorList.push(item as IndicatorTrigerData);
					} else {
						triggerList.push(item as TriggerConditionData);
					}
				}
			}

			return { triggerList, indicatorList };
		})
	);
}

export function createSnoozeAlert(
	payload: CreateSnoozePayload
): Observable<CustomResponse<null>> {
	return httpService.post(
		`/api/vip2/create/snooze?snoozeType=${payload.triggerType}`,
		payload
	);
}

export function createTriggerAlert(
	payload: CreateTriggerPayload
): Observable<CustomResponse<null>> {
	return httpService.post(
		`/api/vip2/create?triggerType=${payload.triggerType}`,
		payload
	);
}

export function createIndicatorAlert(
	payload: CreateIndicatorTriggerPayload
): Observable<CustomResponse<null>> {
	return httpService.post("/api/vip3/create", payload);
}

export function createUserIndicatorAlert(
	payload: CreateUserIndicatorPayload
): Observable<CustomResponse<null>> {
	return httpService.post("/api/vip3/user-indicators", payload);
}

export function deleteTrigger(
	payload: DeleteTriggerPayload
): Observable<CustomResponse<null>> {
	return httpService.delete(
		`/api/vip2/delete/${payload.symbol}?triggerType=${payload.triggerType}`
	);
}

export function deleteIndicatorTrigger(
	payload: DeleteIndicatorTriggerPayload
): Observable<CustomResponse<null>> {
	return httpService.delete(`/api/vip3/delete/${payload.symbol}`);
}
