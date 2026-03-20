"use client";
import FlexBox from "@/src/components/Box/FlexBox";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

interface Props {
  name: string;
}

export default function CustomeBreadcrumbs({ name }: Props) {
  return (
    <Breadcrumbs underline="hover" size="md" className="mb-4">
      <BreadcrumbItem href="/market">Market</BreadcrumbItem>
      <BreadcrumbItem>{name}</BreadcrumbItem>
    </Breadcrumbs>
  );
}
