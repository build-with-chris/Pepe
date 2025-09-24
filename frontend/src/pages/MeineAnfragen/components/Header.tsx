

import * as React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

export type HeaderProps = {
  /** i18n key for the main title (preferred). If not provided, falls back to `title` string. */
  titleKey?: string;
  /** Plain title string if you don't want to use i18n. */
  title?: string;
  /** Optional i18n key for a subtitle/description. */
  subtitleKey?: string;
  /** Optional right-aligned content (e.g., buttons, filters) */
  right?: React.ReactNode;
  /** Optional extra classes for the wrapper */
  className?: string;
};

const Header: React.FC<HeaderProps> = ({ titleKey, title, subtitleKey, right, className }) => {
  const { t } = useTranslation();
  const resolvedTitle = titleKey ? t(titleKey) : (title ?? "");
  const resolvedSubtitle = subtitleKey ? t(subtitleKey) : null;

  return (
    <div className={clsx("mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {resolvedTitle}
        </h1>
        {resolvedSubtitle && (
          <p className="mt-1 text-sm text-white/70 max-w-prose">
            {resolvedSubtitle}
          </p>
        )}
      </div>
      {right ? (
        <div className="flex-shrink-0 flex items-center gap-2">{right}</div>
      ) : null}
    </div>
  );
};

export default Header;