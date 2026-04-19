"use client";

import React from "react";
import { AdminPayment } from "@/src/libs/serverFetch/adminFetch";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@nextui-org/react";

interface Props {
  payments: AdminPayment[];
}

export default function PaymentsView({ payments }: Props) {
  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Payment History</h1>
      </div>

      <Table
        aria-label="Payments management table"
        shadow="sm"
        className="border border-default-200 rounded-xl"
      >
        <TableHeader>
          <TableColumn>ORDER ID</TableColumn>
          <TableColumn>USER ID</TableColumn>
          <TableColumn>INFO</TableColumn>
          <TableColumn>AMOUNT</TableColumn>
          <TableColumn>STATUS</TableColumn>
        </TableHeader>
        <TableBody items={payments} emptyContent="No payments found">
          {(payment) => (
            <TableRow key={payment.order_id}>
              <TableCell className="font-medium text-xs text-default-500">
                {payment.order_id}
              </TableCell>
              <TableCell className="text-xs text-default-500">
                {payment.user_id}
              </TableCell>
              <TableCell>{payment.orderInfo}</TableCell>
              <TableCell className="font-semibold">
                ${payment.amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={
                    payment.transaction_status === "Success"
                      ? "success"
                      : "default"
                  }
                  variant="flat"
                >
                  {payment.transaction_status}
                </Chip>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
