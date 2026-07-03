import {
  BoxIcon,
  CheckCircleIcon,
  FileTextIcon,
  FileUpIcon,
  FilesIcon,
  QuoteIcon,
  SearchIcon,
  SendIcon,
} from "lucide-react";

export const pageTours = {
  "/dashboard/upload": {
    guideId: "new-invoice",
    steps: [
      {
        title: "Choose an airline ticket",
        description:
          "Drag and drop a PDF ticket here, or use Browse Files to select one from your device.",
        icon: FileUpIcon,
        target: "invoice-upload-area",
      },
      {
        title: "Extract the ticket details",
        description:
          "After selecting a PDF, click Extract Details. AirInvoice reads the ticket and prepares the invoice information.",
        icon: FileTextIcon,
        target: "invoice-extract-action",
      },
      {
        title: "Review before continuing",
        description:
          "The extracted details open on the preview page, where you can review and edit them before choosing a template.",
        icon: CheckCircleIcon,
      },
    ],
  },
  "/dashboard/quotation": {
    guideId: "new-quotation",
    steps: [
      {
        title: "Create a customer quotation",
        description:
          "Unlike a completed invoice, a quotation presents proposed travel and pricing details for your customer.",
        icon: QuoteIcon,
        target: "quotation-customer-details",
      },
      {
        title: "Add the flight details",
        description:
          "Search for the origin, destination, and airline, then complete the flight number, dates, baggage, meals, and notes.",
        icon: FileTextIcon,
        target: "quotation-flight-details",
      },
      {
        title: "Set the quoted amount",
        description:
          "Enter the Total Amount, review the customer and flight information, then use Submit to continue to templates.",
        icon: CheckCircleIcon,
        target: "quotation-submit-area",
      },
    ],
  },
  "/dashboard/templates": {
    guideId: "templates",
    steps: [
      {
        title: "Reusable invoice designs",
        description:
          "Templates keep your company branding and document layout ready for future invoices and quotations.",
        icon: BoxIcon,
        target: "template-filters",
      },
      {
        title: "Create your own template",
        description:
          "Choose Create New Template to design a custom layout for your business.",
        icon: FileTextIcon,
        target: "template-create-card",
      },
      {
        title: "Select, reuse, and manage",
        description:
          "Filter by document type, select a template for the current document, or set defaults, edit, and delete saved templates.",
        icon: CheckCircleIcon,
        target: "template-list",
      },
    ],
  },
  "/dashboard/invoices": {
    guideId: "invoices-list",
    steps: [
      {
        title: "Find the right document",
        description:
          "Search by passenger name or passport number, then switch between the Invoices and Quotations tabs.",
        icon: SearchIcon,
        target: "invoice-list-filters",
      },
      {
        title: "Browse your saved documents",
        description:
          "Each card shows the document date and passenger details. Duplicate booking references are highlighted for review.",
        icon: FilesIcon,
        target: "invoice-list",
      },
      {
        title: "Open, send, or remove",
        description:
          "Select a card to open its Send Options. Use the trash icon on a card when you need to delete that document.",
        icon: SendIcon,
        target: "invoice-row-actions",
      },
    ],
  },
};
