'use client';
import { Button, Divider, Spacer, useDisclosure } from '@nextui-org/react';
import { Plus } from '@phosphor-icons/react';
import AddAlertModal from './components/AddAlertModal';
import { IndicatorTrigerData, TriggerConditionData } from '@/src/types/alert';
import TriggerList from './components/TriggerList';
import { H1 } from '@/src/components/Heading';
import IndicatorList from './components/IndicatorList';
import { useState } from 'react';
// import { useAuth } from "@/src/provider/AuthProvider";
// import FlexBox from "@/src/components/Box/FlexBox";
// import Link from "next/link";

interface Props {
    triggerList: TriggerConditionData[];
    indicatorList: IndicatorTrigerData[];
}

export default function Alerts({ triggerList, indicatorList }: Props) {
    const { isOpen, onOpenChange } = useDisclosure();
    const [isTriggerEditing, setIsTriggerEditing] = useState(false);
    const [isIndicatorEditing, setIsIndicatorEditing] = useState(false);

    const isAnyEditing = isTriggerEditing || isIndicatorEditing;

    return (
        <div className="w-8/12 h-full flex flex-col gap-4 pt-10">
            <AddAlertModal isOpen={isOpen} onOpenChange={onOpenChange} />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Alert Management</h1>
                <Button
                    endContent={<Plus weight="bold" size={20} />}
                    radius="sm"
                    onClick={() => onOpenChange()}
                    color="primary"
                    className="font-medium"
                    isDisabled={isAnyEditing}
                >
                    Add alert
                </Button>
            </div>
            <Divider />
            <H1>Trigger Alerts</H1>
            <TriggerList
                triggerList={triggerList}
                onEditingChange={setIsTriggerEditing}
            />
            <Spacer y={2} />
            <H1>Indicator Alerts</H1>
            <IndicatorList
                indicatorList={indicatorList}
                onEditingChange={setIsIndicatorEditing}
            />
        </div>
    );
}
