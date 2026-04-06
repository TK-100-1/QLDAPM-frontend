'use client';
import FlexBox from '@/src/components/Box/FlexBox';
import { IndicatorTrigerData } from '@/src/types/alert';
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
import IndicatorModal from './IndicatorModal';

interface Props {
    indicatorList: IndicatorTrigerData[];
    onEditingChange?: (isEditing: boolean) => void;
}

export default function IndicatorList({
    indicatorList,
    onEditingChange,
}: Props) {
    const { isOpen, onOpenChange } = useDisclosure();
    const [currentIndicator, setCurrentIndicator] =
        useState<IndicatorTrigerData | null>(null);
    const [isAnyEditing, setIsAnyEditing] = useState(false);

    const handleIndicatorUpdate = useCallback(
        (updatedIndicator: IndicatorTrigerData) => {
            setCurrentIndicator(updatedIndicator);
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
        const cellValue = user[columnKey];

        switch (columnKey) {
            case 'indicator':
                if (!cellValue) return 'None';
            default:
                return cellValue;
        }
    }, []);

    return (
        <FlexBox className="flex-col gap-4 w-full p-4 bg-neutral-100 shadow-md rounded-md">
            <IndicatorModal
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                currentIndicator={currentIndicator}
                onIndicatorUpdate={handleIndicatorUpdate}
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
                    emptyContent={'No alerts to display.'}
                    items={indicatorList}
                >
                    {(indicator) => (
                        <TableRow
                            onClick={() => {
                                if (!isAnyEditing) {
                                    setCurrentIndicator(indicator);
                                    onOpenChange();
                                }
                            }}
                            className={`cursor-pointer hover:bg-neutral-200 ${isAnyEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            key={indicator.alert_id}
                        >
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(
                                        indicator,
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

type ColumnKey =
    | 'symbol'
    | 'indicator'
    | 'value'
    | 'condition'
    | 'period'
    | 'notification_method';

type Column = {
    key: ColumnKey;
    label: string;
    align: 'start' | 'center' | 'end';
};

const columns: Column[] = [
    { key: 'symbol', label: 'Symbol', align: 'start' },
    { key: 'indicator', label: 'Indicator', align: 'center' },
    { key: 'condition', label: 'Condition', align: 'center' },
    { key: 'value', label: 'Threshold Value', align: 'center' },
    { key: 'period', label: 'Period', align: 'center' },
    {
        key: 'notification_method',
        label: 'Notification Method',
        align: 'center',
    },
];
