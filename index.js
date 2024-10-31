// Example object:

// data = {
//   company_information: {
//     name: "Company",
//     address_line_1: "10630 NW 27Th Street",
//     address_line_2: "Suite 211",
//     city: "Doral",
//     state: "FL",
//     zip: "33172",
//     phone: "+1 (561) 599-3262",
//   },
//   customer_information: {
//     name: "Olmary Katerine Ballona",
//     address_line_1: "Dubai Hills United Villa 136",
//     city: "Dubai",
//     state: "Dubai",
//     zip: "00000",
//     phone: "+971 50 123 4567",
//   },
//   shopper: "Loretana Blarassin",
//   invoice_number: "2024-000031",
//   date: "25/09/2024",
//   total_pieces: "2",
//   items: [
//     {
//       quantity: "1",
//       description: "Pre Loved Shoes",
//       unit_price: "$100.00",
//       net_price: "$100.00",
//     },
//     {
//       quantity: "1",
//       description: "Pre Loved Sunglasses",
//       unit_price: "$200.00",
//       net_price: "$200.00",
//     },
//   ],
//   payment_methods: {
//     bank_information: {
//       name: "We Shop U Miami Corp",
//       bank: "Pittsburgh National Bank (PNC)",
//       account_number: "1238866749",
//       routing_number: "123456789",
//     },
//     zelle_information: {
//       email: "accounting@weshopu.us",
//     },
//   },
//   pricing: {
//     subtotal: "$300.00",
//     shipping: "$0.00",
//     paid: "$0.00",
//     total: "$300.00",
//     credit_card_fee: "5%",
//     total_with_fee: "$315.00",
//   }
// };

import { jsPDF } from "jspdf";
import logoBase64 from "./weshopu-logo";
import watermarkBase64 from "./weshopu-watermark";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  if (event.request.method !== "POST") {
    return new Response("Only POST requests are allowed", { status: 405 });
  }

  let data;
  try {
    data = await event.request.json();
  } catch (error) {
    return new Response("Invalid JSON format", { status: 400 });
  }

  const {
    company_information,
    customer_information,
    shopper,
    invoice_number,
    date,
    total_pieces,
    items,
    payment_methods,
    pricing,
  } = data;

  const doc = new jsPDF({
    orientation: "p",
    format: "a4",
  });

  // Define margins
  const marginLeft = 20;
  const marginRight = doc.internal.pageSize.width - 20;
  const maxWidth = marginRight - marginLeft;
  let yPosition = 10; // Start from the top

  // Helper function to add wrapped text
  const docText = (x, y, text, align = "left") => {
    const lines = doc.splitTextToSize(text, maxWidth);
    if (align === "right") {
      doc.text(lines, x, y, { align: "right", maxWidth });
    } else {
      doc.text(lines, x, y);
    }
  };

  // Logo
  doc.addImage(logoBase64, "PNG", marginLeft, yPosition, 50, 15);
  doc.addImage(watermarkBase64, "PNG", marginLeft, yPosition + 30, 170, 180);
  yPosition += 22; // Move down after logo

  // Company information
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  docText(marginLeft, yPosition, company_information.name);
  doc.setFontSize(10);
  yPosition += 6;
  docText(
    marginLeft,
    yPosition,
    `${company_information.address_line_1}, ${company_information.address_line_2}`
  );
  yPosition += 5;
  docText(
    marginLeft,
    yPosition,
    `${company_information.city}, ${company_information.state} ${company_information.zip}`
  );
  yPosition += 5;
  docText(marginLeft, yPosition, company_information.phone);
  yPosition += 10;

  // Invoice details on the top-right
  doc.setFont("helvetica", "normal");
  docText(marginRight, yPosition + 5 - 0, `Shopper: ${shopper}`, "right");
  docText(
    marginRight,
    yPosition + 10 - 0,
    `Invoice #: ${invoice_number}`,
    "right"
  );
  docText(marginRight, yPosition + 15 - 0, `Date: ${date}`, "right");
  docText(
    marginRight,
    yPosition + 20 - 0,
    `Total Pieces: ${total_pieces}`,
    "right"
  );

  // Customer information
  doc.setFont("helvetica", "bold");
  docText(marginLeft, yPosition, "Bill To:");
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  docText(marginLeft, yPosition, customer_information.name);
  yPosition += 5;
  docText(marginLeft, yPosition, customer_information.address_line_1);
  yPosition += 5;
  docText(
    marginLeft,
    yPosition,
    `${customer_information.city}, ${customer_information.state} ${customer_information.zip}`
  );
  yPosition += 5;
  docText(marginLeft, yPosition, customer_information.phone);
  yPosition += 15;

  // Table headers for items
  doc.setFont("helvetica", "bold");
  docText(marginLeft, yPosition, "Quantity");
  docText(marginLeft + 30, yPosition, "Description");
  docText(marginRight - 60, yPosition, "Unit Price", "right");
  docText(marginRight, yPosition, "Net Price", "right");
  yPosition += 5;
  doc.setLineWidth(0.333);
  doc.line(marginLeft, yPosition, marginRight, yPosition);
  yPosition += 5;

  // Items
  doc.setFont("helvetica", "normal");
  items.forEach((item) => {
    docText(marginLeft, yPosition, item.quantity);
    docText(marginLeft + 30, yPosition, item.description);
    docText(marginRight - 60, yPosition, item.unit_price, "right");
    docText(marginRight, yPosition, item.net_price, "right");
    yPosition += 10;
  });
  yPosition += 10;

  // Payment information
  doc.setFont("helvetica", "bold");
  docText(marginLeft, yPosition, "Bank Information:");
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  const bankInfo = payment_methods.bank_information;
  docText(marginLeft, yPosition, `Name: ${bankInfo.name}`);
  yPosition += 5;
  docText(marginLeft, yPosition, `Bank: ${bankInfo.bank}`);
  yPosition += 5;
  docText(marginLeft, yPosition, `Account Number: ${bankInfo.account_number}`);
  yPosition += 5;
  docText(marginLeft, yPosition, `Routing Number: ${bankInfo.routing_number}`);
  yPosition += 10;

  // Zelle information
  doc.setFont("helvetica", "bold");
  docText(marginLeft, yPosition, "Zelle Information:");
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  docText(
    marginLeft,
    yPosition,
    `Email: ${payment_methods.zelle_information.email}`
  );
  yPosition += 10;

  // Pricing information
  doc.setFont("helvetica", "bold");
  docText(
    marginRight,
    yPosition - 44,
    `Subtotal: ${pricing.subtotal}`,
    "right"
  );
  yPosition += 5;
  docText(
    marginRight,
    yPosition - 44,
    `Shipping: ${pricing.shipping}`,
    "right"
  );
  yPosition += 5;
  docText(marginRight, yPosition - 44, `Paid: ${pricing.paid}`, "right");
  yPosition += 5;
  docText(marginRight, yPosition - 44, `Total: ${pricing.total}`, "right");
  yPosition += 5;
  if (pricing.credit_card_fee)
    docText(
      marginRight,
      yPosition - 34,
      `Credit Card: ${pricing.credit_card_fee} Fee | ${pricing.total_with_fee}`,
      "right"
    );

  // Output PDF as ArrayBuffer
  const output = doc.output("arraybuffer");
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");

  return new Response(output, { headers });
}
