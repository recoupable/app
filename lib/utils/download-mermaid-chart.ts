import { RefObject } from "react";

const handleDownload = ({ containerRef }: { containerRef: RefObject<HTMLPreElement> }) => {
  if (!containerRef.current) return;

  const svgElement = containerRef.current.querySelector("svg");
  if (!svgElement) {
    console.error("Could not find SVG element to download.");
    return;
  }

  // Serialize the SVG
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  // Add XML declaration and potentially namespace if missing
  if (!svgString.startsWith("<?xml")) {
    svgString = '<?xml version="1.0" standalone="no"?>\n' + svgString;
  }
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Create a Blob
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

  // Create an object URL
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger download
  const a = document.createElement("a");
  a.href = url;

  // Format: "Recoup Diagram May 15, 2025, 09_59_47 PM"
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = now
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .replace(/:/g, "_");

  const filename = `Recoup Diagram ${formattedDate}, ${formattedTime}`;

  a.download = `${filename}.svg`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default handleDownload;
