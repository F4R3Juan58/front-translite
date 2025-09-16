import React from "react";

export default function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-2xl bg-gray-100">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold leading-5">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground leading-snug">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
