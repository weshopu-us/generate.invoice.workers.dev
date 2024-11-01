// Example object:

// data = {
//   company_information: {
//     name: "We Shop U Miami Corp",
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
  let data;

  if (event.request.method === "POST") {
    // Handle POST request
    try {
      data = await event.request.json();
    } catch (error) {
      return new Response("Invalid JSON format", { status: 400 });
    }
  } else if (event.request.method === "GET") {
    // Handle GET request using a single URL parameter
    const url = new URL(event.request.url);
    const jsonData = url.searchParams.get("data");

    if (!jsonData) {
      return new Response("Missing 'data' parameter", { status: 400 });
    }

    try {
      console.log("JSON Data:", jsonData);
      data = JSON.parse(jsonData);
    } catch (error) {
      return new Response("Invalid JSON in 'data' parameter", { status: 400 });
    }
  } else {
    return new Response("Only GET and POST requests are allowed", {
      status: 405,
    });
  }

  console.log("Data F:", data);
  // Extract data fields
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
  doc.addImage(watermarkBase64, "PNG", marginLeft, 60, 170, 180);
  yPosition += 30; // Move down after logo

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
  yPosition += 20;

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
  if (total_pieces) {
    docText(
      marginRight,
      yPosition + 20 - 0,
      `Total Pieces: ${total_pieces}`,
      "right"
    );
  }

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
  yPosition += 25;

  // Table headers for items
  doc.setFont("helvetica", "bold");
  docText(marginLeft, yPosition, "Qty");
  docText(marginLeft + 20, yPosition, "Description");
  docText(marginRight - 30, yPosition, "Unit Price", "right");
  docText(marginRight, yPosition, "Net Price", "right");
  yPosition += 5;
  doc.setLineWidth(0.333);
  doc.line(marginLeft, yPosition, marginRight, yPosition);
  yPosition += 5;

  // Items
  doc.setFont("helvetica", "normal");
  items.forEach((item) => {
    docText(marginLeft, yPosition, item.quantity);
    const maxDescriptionWidth = marginRight - (marginLeft + 20 + 50); // Adjust 80 to account for the space taken by other columns
    const descriptionLines = doc.splitTextToSize(item.description, maxDescriptionWidth);
    doc.text(descriptionLines, marginLeft + 20, yPosition);
    docText(marginRight - 30, yPosition, item.unit_price, "right");
    docText(marginRight, yPosition, item.net_price, "right");
    yPosition += 15;
  });
  yPosition += 10;

  // Payment information
  if (payment_methods.bank_information) {
    doc.setFont("helvetica", "bold");
    docText(marginLeft, yPosition, "Bank Information:");
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    const bankInfo = payment_methods.bank_information;
    docText(marginLeft, yPosition, `Name: ${bankInfo.name}`);
    yPosition += 5;
    docText(marginLeft, yPosition, `Bank: ${bankInfo.bank}`);
    yPosition += 5;
    docText(
      marginLeft,
      yPosition,
      `Account Number: ${bankInfo.account_number}`
    );
    yPosition += 5;
    docText(
      marginLeft,
      yPosition,
      `Routing Number: ${bankInfo.routing_number}`
    );
    yPosition += 10;
  }

  // Zelle information
  if (payment_methods.zelle_information) {
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
  }

  // Pricing information
  doc.setFont("helvetica", "bold");
  docText(
    marginRight,
    yPosition - 14,
    `Subtotal: ${pricing.subtotal}`,
    "right"
  );
  yPosition += 5;
  docText(
    marginRight,
    yPosition - 14,
    `Shipping: ${pricing.shipping}`,
    "right"
  );
  yPosition += 5;
  docText(marginRight, yPosition - 14, `Paid: ${pricing.paid}`, "right");
  yPosition += 5;
  docText(marginRight, yPosition - 14, `Total: ${pricing.total}`, "right");
  yPosition += 5;
  if (pricing.credit_card_fee)
    docText(
      marginRight,
      yPosition - 4,
      `Credit Card: ${pricing.credit_card_fee} Fee | ${pricing.total_with_fee}`,
      "right"
    );

  // Output PDF as ArrayBuffer
  const output = doc.output("arraybuffer");
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");

  return new Response(output, { headers });
}
