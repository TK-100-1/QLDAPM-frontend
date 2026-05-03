'use client';
import FlexBox from '@/src/components/Box/FlexBox';
import { TriggerConditionData } from '@/src/types/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@nextui-org/react';
import { useCallback, useState } from 'react';
import TriggerModal from './TriggerModal';

interface Props {
    triggerList: TriggerConditionData[];
    onEditingChange?: (isEditing: boolean) => void;
}

export default function TriggerList({ triggerList, onEditingChange }: Props) {
    const { isOpen, onOpenChange } = useDisclosure();
    const [currentTrigger, setCurrentTrigger] =
        useState<TriggerConditionData | null>(null);
    const [isAnyEditing, setIsAnyEditing] = useState(false);

    const handleTriggerUpdate = useCallback(
        (updatedTrigger: TriggerConditionData) => {
            setCurrentTrigger(updatedTrigger);
        },
        [],
    );

    const handleEditingChange = useCallback(
        (isEditing: boolean) => {
            setIsAnyEditing(isEditing);
            onEditingChange?.(isEditing);
        },
        [onEditingChange],
    );

    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                setIsAnyEditing(false);
                onEditingChange?.(false);
            }
            onOpenChange();
        },
        [onOpenChange, onEditingChange],
    );

    const renderCell = useCallback((user: any, columnKey: ColumnKey) => {
        const cellValue =
            columnKey === 'notification_method'
                ? user.notification_method || user.notification?.method || ''
                : user[columnKey];

        switch (columnKey) {
            case 'notification_method':
                return cellValue === 'email' ? 'email' : cellValue || 'email';
            default:
                return cellValue;
        }
    }, []);

    return (
        <FlexBox className="flex-col gap-4 w-full p-4 bg-neutral-100 shadow-md rounded-md">
            <TriggerModal
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                currentTrigger={currentTrigger}
                onTriggerUpdate={handleTriggerUpdate}
                isAnyEditing={isAnyEditing}
                onEditingChange={handleEditingChange}
            />
            <Table
                color="primary"
                removeWrapper
                aria-label="Example table with dynamic content"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn align={column.align} key={column.key}>
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    items={triggerList || []}
                    emptyContent={'No alerts to display.'}
                >
                    {(trigger) => (
                        <TableRow
                            onClick={() => {
                                if (!isAnyEditing) {
                                    setCurrentTrigger(trigger);
                                    onOpenChange();
                                }
                            }}
                            className={`cursor-pointer hover:bg-neutral-200 ${isAnyEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            key={trigger.alert_id || trigger.id}
                        >
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(
                                        trigger,
                                        columnKey as ColumnKey,
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </FlexBox>
    );
}

type ColumnKey = 'symbol' | 'notification_method' | 'triggerType' | 'status';

type Column = {
    key: ColumnKey;
    label: string;
    align: 'start' | 'center' | 'end';
};

const columns: Column[] = [
    { key: 'symbol', label: 'Symbol', align: 'start' },
    { key: 'triggerType', label: 'Trigger Type', align: 'center' },
    {
        key: 'notification_method',
        label: 'Notification Method',
        align: 'center',
    },
    { key: 'status', label: 'Status', align: 'center' },
];
