import React from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Contact2Props {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  web?: { label: string; url: string };
}

const Contact2 = ({
  title,
  description,
  phone = "(0159) 04891419",
  email = "info@pepearts.de",
  web = { label: "pepeshows.de", url: "https://pepeshows.de" },
}: Contact2Props) => {
  const { t } = useTranslation();

  const titleText = title ?? t("contact2.title");
  const descriptionText = description ?? t("contact2.description");

  return (
    <section className="py-32 w-full md:w-4/5 mx-auto">
      <div className="container">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="mb-2 text-5xl font-semibold lg:mb-1 lg:text-6xl">
                {titleText}
              </h1>
              <p className="text-muted-foreground">{descriptionText}</p>
            </div>
            <div className="mx-auto w-fit lg:mx-0">
              <h3 className="mb-6 text-center text-2xl font-semibold lg:text-left">
                {t("contact2.details")}
              </h3>
              <ul className="ml-4 list-disc">
                <li>
                  <span className="font-bold">{t("contact2.phone")}: </span>
                  {phone}
                </li>
                <li>
                  <span className="font-bold">{t("contact2.email")}: </span>
                  <a href={`mailto:${email}`} className="underline">
                    {email}
                  </a>
                </li>
                <li>
                  <span className="font-bold">{t("contact2.website")}: </span>
                  <a href={web.url} target="_blank" className="underline">
                    {web.label}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border p-10">
            <div className="flex gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="firstname">{t("contact2.form.firstname")}</Label>
                <Input type="text" id="firstname" placeholder={t("contact2.form.firstnamePlaceholder")} />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="lastname">{t("contact2.form.lastname")}</Label>
                <Input type="text" id="lastname" placeholder={t("contact2.form.lastnamePlaceholder")} />
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">{t("contact2.form.email")}</Label>
              <Input type="email" id="email" placeholder={t("contact2.form.emailPlaceholder")} />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="subject">{t("contact2.form.subject")}</Label>
              <Input type="text" id="subject" placeholder={t("contact2.form.subjectPlaceholder")} />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">{t("contact2.form.message")}</Label>
              <Textarea placeholder={t("contact2.form.messagePlaceholder")} id="message" />
            </div>
            <Button className="w-full">{t("contact2.form.submit")}</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Contact2 };
