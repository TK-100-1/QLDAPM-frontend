'use client';

import FlexBox from '@/src/components/Box/FlexBox';
import { SnoozeAlertData } from '@/src/types/alert';
import {
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@nextui-org/react';
import { useCallback, useState } from 'react';
import SnoozeModal from './SnoozeModal';

interface Props {
    snoozeList: SnoozeAlertData[];
    onEditingChange?: (isEditing: boolean) => void;
}

function formatDateTime(value: string) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

export default function SnoozeList({ snoozeList, onEditingChange }: Props) {
    const { isOpen, onOpenChange } = useDisclosure();
    const [currentSnooze, setCurrentSnooze] = useState<SnoozeAlertData | null>(
        null,
    );
    const [isAnyEditing, setIsAnyEditing] = useState(false);

    const handleEditingChange = useCallback(
        (isEditing: boolean) => {
            setIsAnyEditing(isEditing);
            onEditingChange?.(isEditing);
        },
        [onEditingChange],
    );

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                setIsAnyEditing(false);
                onEditingChange?.(false);
            }
            onOpenChange();
        },
        [onOpenChange, onEditingChange],
    );

    const renderCell = useCallback(
        (item: SnoozeAlertData, columnKey: ColumnKey) => {
            const cellValue = item[columnKey];

            switch (columnKey) {
                case 'start_time':
                case 'end_time':
                    return formatDateTime(String(cellValue));
                case 'is_active':
                    return item.is_active ? (
                        <Chip size="sm" color="success" variant="flat">
                            Active
                        </Chip>
                    ) : (
                        <Chip size="sm" color="default" variant="flat">
                            Inactive
                        </Chip>
                    );
                default:
                    return String(cellValue ?? '-');
            }
        },
        [],
    );

    return (
        <FlexBox className="flex-col gap-4 w-full p-4 bg-neutral-100 shadow-md rounded-md">
            <SnoozeModal
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                currentSnooze={currentSnooze}
                isAnyEditing={isAnyEditing}
                onEditingChange={handleEditingChange}
            />
            <Table
                color="primary"
                removeWrapper
                aria-label="Snooze alerts table"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn align={column.align} key={column.key}>
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={'No snooze alerts to display.'}
                    items={snoozeList}
                >
                    {(item) => (
                        <TableRow
                            key={item.alert_id}
                            onClick={() => {
                                if (!isAnyEditing) {
                                    setCurrentSnooze(item);
                                    onOpenChange();
                                }
                            }}
                            className={`cursor-pointer hover:bg-neutral-200 ${isAnyEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(item, columnKey as ColumnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </FlexBox>
    );
}

type ColumnKey =
    | 'symbol'
    | 'triggerType'
    | 'snooze_condition'
    | 'start_time'
    | 'end_time'
    | 'is_active';

type Column = {
    key: ColumnKey;
    label: string;
    align: 'start' | 'center' | 'end';
};

const columns: Column[] = [
    { key: 'symbol', label: 'Symbol', align: 'start' },
    { key: 'triggerType', label: 'Trigger Type', align: 'center' },
    { key: 'snooze_condition', label: 'Snooze Condition', align: 'center' },
    { key: 'start_time', label: 'Start Time', align: 'center' },
    { key: 'end_time', label: 'End Time', align: 'center' },
    { key: 'is_active', label: 'Status', align: 'center' },
];
