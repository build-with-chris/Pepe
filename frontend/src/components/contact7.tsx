import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Contact7Props {
  title?: string;
  description?: string;
  emailLabel?: string;
  emailDescription?: string;
  email?: string;
  officeLabel?: string;
  officeDescription?: string;
  officeAddress?: string;
  phoneLabel?: string;
  phoneDescription?: string;
  phone?: string;
  chatLabel?: string;
  chatDescription?: string;
  chatLink?: string;
}

const Contact7 = ({
  title,
  description,
  emailLabel,
  emailDescription,
  email,
  officeLabel,
  officeDescription,
  officeAddress,
  phoneLabel,
  phoneDescription,
  phone,
  chatLabel,
  chatDescription,
  chatLink,
}: Contact7Props) => {
  const { t } = useTranslation();
  const titleText = title ?? t("contact.title");
  const descriptionText = description ?? t("contact.description");
  const emailLabelText = emailLabel ?? t("contact.email.label");
  const emailDescText = emailDescription ?? t("contact.email.description");
  const officeLabelText = officeLabel ?? t("contact.office.label");
  const officeDescText = officeDescription ?? t("contact.office.description");
  const officeAddressText = officeAddress ?? t("contact.office.address");
  const phoneLabelText = phoneLabel ?? t("contact.phone.label");
  const phoneDescText = phoneDescription ?? t("contact.phone.description");
  const chatLabelText = chatLabel ?? t("contact.chat.label");
  const chatDescText = chatDescription ?? t("contact.chat.description");
  const chatLinkText = chatLink ?? t("contact.chat.link");
  return (
    <section className="bg-black py-32">
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="mb-14">
          <h1 className="mb-3 mt-2 text-balance text-3xl font-semibold md:text-4xl">
            {titleText}
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg">
            {descriptionText}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <a
            href={`mailto:${email}`}
            aria-label={emailLabelText}
            className="block bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
          >
            <span className="bg-white/10 mb-3 flex size-12 flex-col items-center justify-center rounded-full">
              <Mail className="h-6 w-auto" />
            </span>
            <p className="mb-2 text-lg font-semibold">{emailLabelText}</p>
            <p className="text-muted-foreground mb-3">{emailDescText}</p>
            <p className="font-semibold underline-offset-2">{email}</p>
          </a>
          <a
            href="https://www.google.de/maps/place/Pepe+Dome+im+Theatron+im+Ostpark/@48.1119726,11.640768,16z/data=!3m1!4b1!4m6!3m5!1s0x479ddfe1623e7b83:0x8f776b2413dcab9e!8m2!3d48.1119726!4d11.6433429!16s%2Fg%2F11dfj6w_tt?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={officeLabelText}
            className="block bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
          >
            <span className="bg-white/10 mb-3 flex size-12 flex-col items-center justify-center rounded-full">
              <MapPin className="h-6 w-auto" />
            </span>
            <p className="mb-2 text-lg font-semibold">{officeLabelText}</p>
            <p className="text-muted-foreground mb-3">{officeDescText}</p>
            <p className="font-semibold underline-offset-2">{officeAddressText}</p>
          </a>
          <a
            href={`tel:${phone}`}
            aria-label={phoneLabelText}
            className="block bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
          >
            <span className="bg-white/10 mb-3 flex size-12 flex-col items-center justify-center rounded-full">
              <Phone className="h-6 w-auto" />
            </span>
            <p className="mb-2 text-lg font-semibold">{phoneLabelText}</p>
            <p className="text-muted-foreground mb-3">{phoneDescText}</p>
            <p className="font-semibold underline-offset-2">{phone}</p>
          </a>
          <a
            href="#"
            aria-label={chatLabelText}
            className="block bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
          >
            <span className="bg-white/10 mb-3 flex size-12 flex-col items-center justify-center rounded-full">
              <MessageCircle className="h-6 w-auto" />
            </span>
            <p className="mb-2 text-lg font-semibold">{chatLabelText}</p>
            <p className="text-muted-foreground mb-3">{chatDescText}</p>
            <p className="font-semibold underline-offset-2">{chatLinkText}</p>
          </a>
        </div>
      </div>
    </section>
  );
};

export { Contact7 };
